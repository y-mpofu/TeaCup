# Backend/app/routes/news_routes.py
# ENHANCED: Updated news routes with higher article limits to support dynamic frontend requirements
# Politics, Education, Health = 40 articles | Others = 10-15 articles

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, List, Any
import asyncio
from datetime import datetime
import logging
import json
import os

# Import the real news service (no mock data)
from app.services.news_service import news_service

# **CRITICAL ADDITION: Import search cache functionality for automatic cache updates**
try:
    from app.routes.search_routes import update_articles_cache
except ImportError:
    # Fallback if search routes not available
    def update_articles_cache(articles):
        pass

# Import authentication helper
from .auth_routes import get_user_from_token

# Set up router and logging
router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer()

# ===== ENHANCED CONFIGURATION CONSTANTS =====

# 🎯 INCREASED LIMITS: Support for dynamic frontend article requirements
# Previous limits were too restrictive (MAX_ARTICLES_PER_CATEGORY = 18, le=10)
# New limits accommodate priority categories needing 40 articles

# Maximum articles per individual category request
MAX_ARTICLES_PER_CATEGORY = 50        # Increased from 18 to support 40-article requests

# Maximum articles for "all categories" endpoint per category
MAX_PER_CATEGORY_ALL_NEWS = 45        # Increased from 10 to support priority categories

# Maximum search results
MAX_SEARCH_RESULTS = 50               # Keep existing limit

# Maximum breaking news articles
MAX_BREAKING_NEWS = 40                # Increased from 30 for better coverage

# Valid news categories supported by the system
VALID_CATEGORIES = [
    'politics',
    'sports', 
    'health',
    'business',
    'technology',
    'local-trends',
    'weather',
    'entertainment',
    'education'
]

# Valid country codes for news localization
VALID_COUNTRIES = ['ZW', 'KE', 'GH', 'RW', 'CD', 'ZA', 'BI']

# ===== HELPER FUNCTIONS =====

def validate_category(category: str) -> None:
    """
    Validate that the requested category is supported
    
    Args:
        category: Category name to validate
        
    Raises:
        HTTPException: If category is invalid (400 status)
    """
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{category}'. Valid categories: {', '.join(VALID_CATEGORIES)}"
        )

def get_user_country(credentials: HTTPAuthorizationCredentials) -> str:
    """
    Extract user's country preference from authentication token
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        User's country code (e.g., 'ZW', 'KE')
        
    Raises:
        HTTPException: If token is invalid or user has no country preference
    """
    try:
        # Get user data from token
        user = get_user_from_token(credentials.credentials)
        
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired authentication token"
            )
        
        # Check if user has a country preference set
        country = user.get('country_of_interest')
        if not country:
            raise HTTPException(
                status_code=400,
                detail="Country preference required. Please set your country in user settings."
            )
        
        # Validate country is supported
        if country not in VALID_COUNTRIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid country '{country}'. Please update your country preference."
            )
        
        return country
        
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        logger.error(f"❌ Error extracting user country: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication error. Please log in again."
        )

def convert_articles_for_cache(articles: List, category: str, country: str) -> List[Dict]:
    """
    Convert ProcessedArticle objects to cache-friendly format
    
    Args:
        articles: List of ProcessedArticle objects
        category: Category name for metadata
        country: Country code for metadata
        
    Returns:
        List of article dictionaries ready for search cache
    """
    cache_articles = []
    
    for article in articles:
        try:
            # Convert ProcessedArticle to dictionary if needed
            if hasattr(article, '__dict__'):
                article_dict = article.__dict__.copy()
            else:
                article_dict = dict(article)  # Assume it's already a dict
            
            # Add cache metadata
            article_dict['cached_at'] = datetime.now().isoformat()
            article_dict['cache_category'] = category
            article_dict['cache_country'] = country
            
            cache_articles.append(article_dict)
            
        except Exception as conv_error:
            logger.warning(f"⚠️ Failed to convert article for cache: {conv_error}")
            continue
    
    return cache_articles

def update_search_cache_safely(articles: List, category: str, country: str, source: str) -> bool:
    """
    Safely update search cache with articles, handling any errors gracefully
    
    Args:
        articles: List of articles to cache
        category: Category name
        country: Country code  
        source: Source identifier for logging
        
    Returns:
        bool: True if cache update successful, False otherwise
    """
    try:
        if not articles:
            return False
        
        cache_articles = convert_articles_for_cache(articles, category, country)
        if cache_articles:
            update_articles_cache(cache_articles)
            logger.info(f"📦 Cache updated: {len(cache_articles)} articles from {source}")
            return True
        return False
        
    except Exception as cache_error:
        logger.warning(f"⚠️ Cache update failed for {source}: {cache_error}")
        return False

# ===== MAIN NEWS ENDPOINTS =====

@router.get("/news/{category}")
async def get_news_by_category(
    category: str,
    max_articles: Optional[int] = Query(18, ge=1, le=MAX_ARTICLES_PER_CATEGORY),  # 🎯 INCREASED: le=50
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get news articles for a specific category using user's country preference
    🎯 ENHANCED: Now supports up to 50 articles per category (increased from 18)
    
    Requires authentication - user must be logged in with a valid country preference.
    News is automatically localized to the user's selected country.
    Perfect for category-specific pages and priority content loading.
    
    Args:
        category: News category (politics, sports, health, etc.)
        max_articles: Maximum articles to return (1-50, increased from 1-18)
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with articles from the specified category and user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        logger.info(f"📰 API Request: {category} news for country {user_country} (max: {max_articles})")
        
        # Validate the requested category
        validate_category(category)
        
        # Fetch real news articles using user's country preference
        articles = await news_service.get_news_for_category(category, max_articles, user_country)
        
        logger.info(f"✅ Retrieved {len(articles)} real {category} articles for {user_country}")
        
        # **NEW: Update search cache with fetched articles**
        cache_updated = update_search_cache_safely(articles, category, user_country, f"{category}_category")
        
        # FastAPI automatically converts ProcessedArticle dataclass objects to JSON
        return {
            "success": True,
            "articles": articles,                           # Auto-converted to JSON
            "category": category.title(),                   # Formatted category name
            "count": len(articles),                         # Number of articles returned
            "country": user_country,                        # User's country preference
            "search_cache_updated": cache_updated,          # Indicate if cache was updated
            "timestamp": datetime.now().isoformat()        # When this response was generated
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (400, 401, 404, etc.) without modification
        raise
    except Exception as general_error:
        # Log and convert unexpected errors to 500 responses
        logger.error(f"❌ Unexpected error fetching {category} news: {general_error}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch {category} news. Please try again later."
        )

@router.get("/news/all")
async def get_all_categories_news(
    max_per_category: Optional[int] = Query(6, ge=1, le=MAX_PER_CATEGORY_ALL_NEWS),  # 🎯 INCREASED: le=45
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get news for all categories simultaneously using user's country preference
    🎯 ENHANCED: Now supports up to 45 articles per category (increased from 10)
    
    Requires authentication - user must be logged in with a valid country preference.
    Perfect for homepage/dashboard that displays multiple categories.
    Country is automatically determined from user's settings.
    This endpoint is ideal for the enhanced frontend with dynamic article limits.
    
    Args:
        max_per_category: Number of articles per category (1-45, increased from 1-10)
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON with news organized by category, localized to user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        logger.info(f"📊 API Request: ALL categories for country {user_country} ({max_per_category} per category)")
        
        # Use the news service's optimized concurrent fetching with user's country
        news_by_category = await news_service.get_all_categories_news(max_per_category, user_country)
        
        # Calculate total statistics
        total_articles = sum(len(articles) for articles in news_by_category.values())
        successful_categories = sum(1 for articles in news_by_category.values() if len(articles) > 0)
        
        logger.info(f"✅ Dashboard complete: {total_articles} articles across {successful_categories} categories for {user_country}")
        
        # **NEW: Bulk update search cache with all fetched articles**
        cache_updated_count = 0
        all_cache_articles = []
        
        for category, articles in news_by_category.items():
            if articles:  # Only process categories that have articles
                cache_articles = convert_articles_for_cache(articles, category, user_country)
                all_cache_articles.extend(cache_articles)
                cache_updated_count += len(cache_articles)
        
        # Perform bulk cache update
        bulk_cache_success = False
        if all_cache_articles:
            try:
                update_articles_cache(all_cache_articles)
                bulk_cache_success = True
                logger.info(f"📦 Bulk cache update: {cache_updated_count} articles from all categories")
            except Exception as bulk_cache_error:
                logger.warning(f"⚠️ Bulk cache update failed: {bulk_cache_error}")
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "news_by_category": news_by_category,           # Auto-converted to JSON
            "total_articles": total_articles,               # Total count across all categories
            "categories_count": successful_categories,      # Number of categories with articles
            "country": user_country,                        # User's current country preference
            "search_cache_updated": bulk_cache_success,     # Indicate if bulk cache update succeeded
            "articles_cached": cache_updated_count,         # Number of articles added to cache
            "timestamp": datetime.now().isoformat()        # Response generation time
        }
        
    except HTTPException:
        raise
    except Exception as dashboard_error:
        logger.error(f"❌ Error fetching all categories: {dashboard_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch news dashboard. Please try again later."
        )

@router.get("/news/breaking")
async def get_breaking_news(
    max_articles: Optional[int] = Query(15, ge=1, le=MAX_BREAKING_NEWS),  # 🎯 INCREASED: le=40
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get breaking news articles using user's country preference
    🎯 ENHANCED: Now supports up to 40 breaking news articles (increased from 30)
    
    Requires authentication - user must be logged in with a valid country preference.
    Searches multiple categories for urgent news from the user's selected country.
    When user changes their country in settings, breaking news automatically updates.
    
    Args:
        max_articles: Maximum breaking news articles to return (1-40, increased from 1-30)
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with breaking news articles from user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        logger.info(f"🚨 API Request: Breaking news for country {user_country} (max: {max_articles})")
        
        # Define priority categories for breaking news
        priority_categories = ['politics', 'health', 'business', 'local-trends']
        
        # Helper function to get breaking news from a single category
        async def get_breaking_from_category(category: str) -> List:
            try:
                # Get a smaller number from each category to ensure variety
                articles_per_category = min(10, max_articles // len(priority_categories))
                articles = await news_service.get_news_for_category(category, articles_per_category, user_country)
                
                # Filter for articles marked as breaking
                breaking_articles = [article for article in articles if getattr(article, 'isBreaking', False)]
                return breaking_articles
                
            except Exception as cat_error:
                logger.warning(f"⚠️ Failed to get breaking news from {category}: {cat_error}")
                return []
        
        # Fetch breaking news from all priority categories concurrently
        breaking_tasks = [get_breaking_from_category(cat) for cat in priority_categories]
        breaking_results = await asyncio.gather(*breaking_tasks, return_exceptions=True)
        
        # Combine all breaking news articles
        all_breaking_articles = []
        for result in breaking_results:
            if isinstance(result, Exception):
                logger.warning(f"⚠️ Breaking news task failed: {result}")
                continue
            # Extend the list with articles from this category
            all_breaking_articles.extend(result)
        
        # Sort by timestamp (most recent first) and limit to requested amount
        all_breaking_articles.sort(
            key=lambda article: getattr(article, 'timestamp', ''), 
            reverse=True
        )
        final_breaking_news = all_breaking_articles[:max_articles]
        
        logger.info(f"✅ Found {len(final_breaking_news)} breaking news articles for {user_country}")
        
        # **NEW: Update search cache with breaking news articles**
        cache_updated = update_search_cache_safely(final_breaking_news, 'breaking', user_country, "breaking_news")
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "articles": final_breaking_news,                # Auto-converted to JSON
            "count": len(final_breaking_news),              # Number of breaking articles
            "country": user_country,                        # User's current country preference
            "search_cache_updated": cache_updated,          # Indicate if cache was updated
            "timestamp": datetime.now().isoformat()        # Response time
        }
        
    except HTTPException:
        raise
    except Exception as breaking_error:
        logger.error(f"❌ Error fetching breaking news: {breaking_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch breaking news. Please try again later."
        )

@router.get("/news/search")
async def search_news_articles(
    q: str = Query(..., description="Search query - minimum 2 characters"),
    max_articles: Optional[int] = Query(20, ge=1, le=MAX_SEARCH_RESULTS),  # Keep existing limit
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Search for news articles by keyword using user's country preference
    **NOW INCLUDES: Automatic search cache updates for search results**
    
    Requires authentication - user must be logged in with a valid country preference.
    Uses Google Custom Search to find articles matching the user's query,
    automatically localized to their selected country.
    
    Args:
        q: Search query string (minimum 2 characters)
        max_articles: Maximum search results to return (1-50)
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with search results localized to user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        logger.info(f"🔍 API Request: Search '{q}' in country {user_country} (max: {max_articles})")
        
        # Validate search query length
        if len(q.strip()) < 2:
            raise HTTPException(
                status_code=400, 
                detail="Search query must be at least 2 characters long"
            )
        
        # Use news service to search for real articles in user's country
        search_results = await news_service.search_news(q, max_articles, user_country)
        
        logger.info(f"✅ Search completed: {len(search_results)} results for '{q}' in {user_country}")
        
        # **NEW: Update search cache with search results**
        cache_updated = update_search_cache_safely(search_results, 'search', user_country, f"search_{q}")
        
        # search_news returns dictionaries, so no conversion needed
        return {
            "success": True,
            "articles": search_results,                     # Already in dictionary format
            "query": q,                                     # User's search query
            "count": len(search_results),                   # Number of results found
            "country": user_country,                        # User's current country preference
            "search_cache_updated": cache_updated,          # Indicate if cache was updated
            "timestamp": datetime.now().isoformat()        # Search completion time
        }
        
    except HTTPException:
        # Re-raise validation errors (400, 401 status codes)
        raise
    except Exception as search_error:
        logger.error(f"❌ Search error for '{q}': {search_error}")
        raise HTTPException(
            status_code=500,
            detail=f"Search failed for '{q}'. Please try again later."
        )

@router.get("/news/categories")
async def get_available_categories():
    """
    Get list of all supported news categories and countries
    🎯 ENHANCED: Updated documentation to reflect increased limits
    
    Useful for frontend applications to dynamically build navigation
    and populate country selection dropdowns in user settings
    
    Returns:
        JSON with list of valid categories, countries, and enhanced metadata
    """
    try:
        logger.info("📋 API Request: Getting available categories and countries")
        
        # Category information with descriptions and enhanced limits
        category_info = [
            {"name": "politics", "display": "Politics", "description": "Government, elections, policy", "priority": "high", "max_articles": 50},
            {"name": "education", "display": "Education", "description": "Schools, universities, academic results", "priority": "high", "max_articles": 50},
            {"name": "health", "display": "Health", "description": "Healthcare, medical news, wellness", "priority": "high", "max_articles": 50},
            {"name": "sports", "display": "Sports", "description": "Cricket, rugby, football, athletics", "priority": "standard", "max_articles": 50},
            {"name": "business", "display": "Business", "description": "Economy, trade, finance, markets", "priority": "standard", "max_articles": 50},
            {"name": "technology", "display": "Technology", "description": "Innovation, ICT, digital transformation", "priority": "standard", "max_articles": 50},
            {"name": "local-trends", "display": "Local Trends", "description": "Social media, culture, lifestyle", "priority": "standard", "max_articles": 50},
            {"name": "weather", "display": "Weather", "description": "Climate, forecasts, seasonal updates", "priority": "standard", "max_articles": 50},
            {"name": "entertainment", "display": "Entertainment", "description": "Music, movies, celebrities, arts", "priority": "standard", "max_articles": 50}
        ]
        
        # Country information for settings dropdown
        country_info = [
            {"code": "ZW", "name": "Zimbabwe", "flag": "🇿🇼"},
            {"code": "KE", "name": "Kenya", "flag": "🇰🇪"}, 
            {"code": "GH", "name": "Ghana", "flag": "🇬🇭"},
            {"code": "RW", "name": "Rwanda", "flag": "🇷🇼"},
            {"code": "CD", "name": "Democratic Republic of Congo", "flag": "🇨🇩"},
            {"code": "ZA", "name": "South Africa", "flag": "🇿🇦"},
            {"code": "BI", "name": "Burundi", "flag": "🇧🇮"}
        ]
        
        return {
            "success": True,
            "categories": category_info,                    # Enhanced category information with limits
            "countries": country_info,                      # Available countries for settings
            "api_limits": {                                 # 🎯 NEW: API limit information
                "max_articles_per_category": MAX_ARTICLES_PER_CATEGORY,
                "max_per_category_all_news": MAX_PER_CATEGORY_ALL_NEWS,
                "max_search_results": MAX_SEARCH_RESULTS,
                "max_breaking_news": MAX_BREAKING_NEWS
            },
            "valid_categories": VALID_CATEGORIES,           # Simple list for validation
            "valid_countries": VALID_COUNTRIES,             # Simple list for validation
            "count": len(VALID_CATEGORIES),                # Total number of categories
            "timestamp": datetime.now().isoformat()       # Response time
        }
        
    except Exception as categories_error:
        logger.error(f"❌ Error getting categories and countries: {categories_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch available categories and countries"
        )

# ADMIN/DEBUG endpoint to manually override country (optional)
@router.get("/news/{category}/country/{country_override}")
async def get_news_by_category_with_country_override(
    category: str,
    country_override: str,
    max_articles: Optional[int] = Query(18, ge=1, le=MAX_ARTICLES_PER_CATEGORY)  # 🎯 INCREASED: le=50
):
    """
    DEBUG/ADMIN endpoint: Get news for specific category with manual country override
    🎯 ENHANCED: Now supports up to 50 articles (increased from 20)
    
    This endpoint allows manually specifying a country, bypassing user settings.
    Useful for testing different countries or admin functions.
    
    Args:
        category: News category
        country_override: Country code to use (must be in VALID_COUNTRIES)
        max_articles: Maximum articles to return (1-50, increased from 1-20)
        
    Returns:
        JSON response with news from the specified country
    """
    try:
        logger.info(f"🔧 DEBUG: {category} news with country override: {country_override} (max: {max_articles})")
        
        # Validate category and country
        validate_category(category)
        
        if country_override not in VALID_COUNTRIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid country override '{country_override}'. Valid countries: {', '.join(VALID_COUNTRIES)}"
            )
        
        # Fetch news with manual country override
        articles = await news_service.get_news_for_category(category, max_articles, country_override)
        
        logger.info(f"✅ DEBUG: Retrieved {len(articles)} {category} articles for {country_override}")
        
        # **NEW: Update search cache even for debug requests**
        cache_updated = update_search_cache_safely(articles, category, country_override, f"debug_{category}")
        
        return {
            "success": True,
            "articles": articles,
            "category": category.title(),
            "count": len(articles),
            "country": country_override,
            "override_used": True,                          # Flag indicating manual override
            "search_cache_updated": cache_updated,          # Indicate if cache was updated
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as override_error:
        logger.error(f"❌ Error with country override {country_override}: {override_error}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch {category} news for {country_override}"
        )