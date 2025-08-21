
# from fastapi import APIRouter, HTTPException, Query, Depends
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from typing import Optional, Dict, List, Any
# import asyncio
# from datetime import datetime
# import logging
# import json
# import os

# # Import the real news service (no mock data)
# from app.services.news_service import news_service

# # Configuration constants
# MAX_ARTICLES_PER_CATEGORY = 18
# MAX_SEARCH_RESULTS = 50
# MAX_BREAKING_NEWS = 30

# # Valid news categories supported by the system
# VALID_CATEGORIES = [
#     'politics', 'sports', 'health', 'business', 'technology',
#     'local-trends', 'weather', 'entertainment', 'education'
# ]

# # Valid countries that users can select in their settings
# VALID_COUNTRIES = [
#     'ZW',  # Zimbabwe
#     # 'KE',  # Kenya  
#     # 'GH',  # Ghana
#     # 'RW',  # Rwanda
#     # 'CD',  # Democratic Republic of Congo
#     # 'ZA',  # South Africa
#     # 'BI'   # Burundi
# ]

# # Create router and security instances
# router = APIRouter()
# security = HTTPBearer(auto_error=False)  # Optional authentication
# logger = logging.getLogger(__name__)

# # Database functions (shared with auth_routes)
# def load_database() -> Dict[str, Any]:
#     """Load user data from JSON database file"""
#     try:
#         if os.path.exists("users_db.json"):
#             with open("users_db.json", 'r') as f:
#                 return json.load(f)
#         else:
#             return {"users": [], "sessions": []}
#     except Exception as e:
#         logger.error(f"Error loading database: {e}")
#         return {"users": [], "sessions": []}

# def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
#     """
#     Get user information from session token
#     Returns user object with country_of_interest field
#     """
#     if not token:
#         return None
        
#     db_data = load_database()
    
#     # Find active session matching the token
#     for session in db_data["sessions"]:
#         if session["session_id"] == token and session["is_active"]:
#             # Check if session is expired
#             expires_at = datetime.fromisoformat(session["expires_at"])
#             if datetime.now() > expires_at:
#                 # Session expired, deactivate it
#                 session["is_active"] = False
#                 # Note: In production, you might want to save this change
#                 return None
            
#             # Find user by session's user_id
#             for user in db_data["users"]:
#                 if user["id"] == session["user_id"]:
#                     return user
    
#     return None

# def get_user_country(credentials: Optional[HTTPAuthorizationCredentials] = None) -> Optional[str]:
#     """
#     Get the authenticated user's country preference
    
#     Args:
#         credentials: Optional authentication credentials
        
#     Returns:
#         User's country code, or None if no authentication/invalid country
#     """
#     # If no authentication provided, return None
#     if not credentials:
#         logger.info("🌍 No authentication - no country specified")
#         return None
    
#     # Get user from token
#     user = get_user_from_token(credentials.credentials)
    
#     if not user:
#         logger.info("🌍 Invalid/expired token - no country available") 
#         return None
    
#     # Get user's country preference
#     user_country = user.get("country_of_interest")
    
#     # Validate the country is supported
#     if not user_country or user_country not in VALID_COUNTRIES:
#         logger.warning(f"⚠️  User has invalid/missing country '{user_country}' - authentication required")
#         return None
    
#     logger.info(f"🌍 Using user's country preference: {user_country}")
#     return user_country

# def validate_category(category: str) -> None:
#     """
#     Validate that the requested category is supported
    
#     Args:
#         category: Category name to validate
        
#     Raises:
#         HTTPException: If category is not in VALID_CATEGORIES
#     """
#     if category not in VALID_CATEGORIES:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Invalid category '{category}'. Valid categories: {', '.join(VALID_CATEGORIES)}"
#         )

# @router.get("/news/{category}")
# async def get_news_by_category(
#     category: str,
#     max_articles: Optional[int] = Query(MAX_ARTICLES_PER_CATEGORY, ge=1, le=20),
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """
#     Get real news articles for a specific category using user's country preference
    
#     Requires authentication - user must be logged in and have a country set in their settings.
#     The country is automatically determined from the authenticated user's settings.
#     When user changes country in settings, all subsequent news requests use the new country.
    
#     Args:
#         category: News category (politics, sports, health, etc.)
#         max_articles: Maximum number of articles to return (1-20)
#         credentials: Required user authentication (country extracted from user settings)
        
#     Returns:
#         JSON response with success status and list of localized articles
#     """
#     try:
#         # Get user's country preference from their settings (required)
#         user_country = get_user_country(credentials)
        
#         if not user_country:
#             raise HTTPException(
#                 status_code=401,
#                 detail="Authentication required. Please log in and set your country preference in settings."
#             )
        
#         logger.info(f"📰 API Request: {category} news for country {user_country} (max: {max_articles})")
        
#         # Validate the requested category
#         validate_category(category)
        
#         # Fetch real news articles using user's country preference
#         articles = await news_service.get_news_for_category(category, max_articles, user_country)
        
#         logger.info(f"✅ Retrieved {len(articles)} real {category} articles for {user_country}")
        
#         # FastAPI automatically converts ProcessedArticle dataclass objects to JSON
#         return {
#             "success": True,
#             "articles": articles,                           # Auto-converted to JSON
#             "category": category.title(),                   # Formatted category name
#             "count": len(articles),                         # Number of articles returned
#             "country": user_country,                        # User's country preference
#             "timestamp": datetime.now().isoformat()        # When this response was generated
#         }
        
#     except HTTPException:
#         # Re-raise HTTP exceptions (400, 401, 404, etc.) without modification
#         raise
#     except Exception as general_error:
#         # Log and convert unexpected errors to 500 responses
#         logger.error(f"❌ Unexpected error fetching {category} news: {general_error}")
#         raise HTTPException(
#             status_code=500, 
#             detail=f"Failed to fetch {category} news. Please try again later."
#         )

# @router.get("/news/all")
# async def get_all_categories_news(
#     max_per_category: Optional[int] = Query(6, ge=1, le=10),
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """
#     Get news for all categories simultaneously using user's country preference
    
#     Requires authentication - user must be logged in with a valid country preference.
#     Perfect for homepage/dashboard that displays multiple categories.
#     Country is automatically determined from user's settings.
    
#     Args:
#         max_per_category: Number of articles per category (1-10)
#         credentials: Required user authentication (country extracted from user settings)
        
#     Returns:
#         JSON with news organized by category, localized to user's country
#     """
#     try:
#         # Get user's country preference dynamically (required)
#         user_country = get_user_country(credentials)
        
#         if not user_country:
#             raise HTTPException(
#                 status_code=401,
#                 detail="Authentication required. Please log in and set your country preference in settings."
#             )
        
#         logger.info(f"📊 API Request: ALL categories for country {user_country} ({max_per_category} per category)")
        
#         # Use the news service's optimized concurrent fetching with user's country
#         news_by_category = await news_service.get_all_categories_news(max_per_category, user_country)
        
#         # Calculate total statistics
#         total_articles = sum(len(articles) for articles in news_by_category.values())
#         successful_categories = sum(1 for articles in news_by_category.values() if len(articles) > 0)
        
#         logger.info(f"✅ Dashboard complete: {total_articles} articles across {successful_categories} categories for {user_country}")
        
#         # FastAPI automatically converts ProcessedArticle objects to JSON
#         return {
#             "success": True,
#             "news_by_category": news_by_category,           # Auto-converted to JSON
#             "total_articles": total_articles,               # Total count across all categories
#             "categories_count": successful_categories,      # Number of categories with articles
#             "country": user_country,                        # User's current country preference
#             "timestamp": datetime.now().isoformat()        # Response generation time
#         }
        
#     except HTTPException:
#         raise
#     except Exception as dashboard_error:
#         logger.error(f"❌ Error fetching all categories: {dashboard_error}")
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to fetch news dashboard. Please try again later."
#         )

# @router.get("/news/breaking")
# async def get_breaking_news(
#     max_articles: Optional[int] = Query(15, ge=1, le=MAX_BREAKING_NEWS),
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """
#     Get breaking news articles using user's country preference
    
#     Requires authentication - user must be logged in with a valid country preference.
#     Searches multiple categories for urgent news from the user's selected country.
#     When user changes their country in settings, breaking news automatically updates.
    
#     Args:
#         max_articles: Maximum breaking news articles to return
#         credentials: Required user authentication (country extracted from user settings)
        
#     Returns:
#         JSON response with breaking news articles from user's country
#     """
#     try:
#         # Get user's country preference dynamically (required)
#         user_country = get_user_country(credentials)
        
#         if not user_country:
#             raise HTTPException(
#                 status_code=401,
#                 detail="Authentication required. Please log in and set your country preference in settings."
#             )
        
#         logger.info(f"🚨 API Request: Breaking news for country {user_country} (max: {max_articles})")
        
#         # Priority categories most likely to have breaking news
#         priority_categories = ['politics', 'business', 'health', 'sports', 'technology']
        
#         # Collect breaking news from multiple categories concurrently
#         async def get_breaking_from_category(category: str):
#             """Get articles from one category and filter for breaking news"""
#             try:
#                 # Get recent articles from this category using user's country
#                 articles = await news_service.get_news_for_category(category, 5, user_country)
#                 # Filter only the breaking news articles
#                 breaking_only = [article for article in articles if getattr(article, 'isBreaking', False)]
#                 return breaking_only
#             except Exception as category_error:
#                 logger.warning(f"⚠️  Error getting breaking news from {category}: {category_error}")
#                 return []
        
#         # Fetch breaking news from all priority categories concurrently
#         breaking_tasks = [get_breaking_from_category(cat) for cat in priority_categories]
#         breaking_results = await asyncio.gather(*breaking_tasks, return_exceptions=True)
        
#         # Combine all breaking news articles
#         all_breaking_articles = []
#         for result in breaking_results:
#             if isinstance(result, Exception):
#                 logger.warning(f"⚠️  Breaking news task failed: {result}")
#                 continue
#             # Extend the list with articles from this category
#             all_breaking_articles.extend(result)
        
#         # Sort by timestamp (most recent first) and limit to requested amount
#         all_breaking_articles.sort(
#             key=lambda article: getattr(article, 'timestamp', ''), 
#             reverse=True
#         )
#         final_breaking_news = all_breaking_articles[:max_articles]
        
#         logger.info(f"✅ Found {len(final_breaking_news)} breaking news articles for {user_country}")
        
#         # FastAPI automatically converts ProcessedArticle objects to JSON
#         return {
#             "success": True,
#             "articles": final_breaking_news,                # Auto-converted to JSON
#             "count": len(final_breaking_news),              # Number of breaking articles
#             "country": user_country,                        # User's current country preference
#             "timestamp": datetime.now().isoformat()        # Response time
#         }
        
#     except HTTPException:
#         raise
#     except Exception as breaking_error:
#         logger.error(f"❌ Error fetching breaking news: {breaking_error}")
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to fetch breaking news. Please try again later."
#         )

# @router.get("/news/search")
# async def search_news_articles(
#     q: str = Query(..., description="Search query - minimum 2 characters"),
#     max_articles: Optional[int] = Query(20, ge=1, le=MAX_SEARCH_RESULTS),
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """
#     Search for news articles by keyword using user's country preference
    
#     Requires authentication - user must be logged in with a valid country preference.
#     Uses Google Custom Search to find articles matching the user's query,
#     automatically localized to their selected country.
    
#     Args:
#         q: Search query string (minimum 2 characters)
#         max_articles: Maximum search results to return (1-50)
#         credentials: Required user authentication (country extracted from user settings)
        
#     Returns:
#         JSON response with search results localized to user's country
#     """
#     try:
#         # Get user's country preference dynamically (required)
#         user_country = get_user_country(credentials)
        
#         if not user_country:
#             raise HTTPException(
#                 status_code=401,
#                 detail="Authentication required. Please log in and set your country preference in settings."
#             )
        
#         logger.info(f"🔍 API Request: Search '{q}' in country {user_country} (max: {max_articles})")
        
#         # Validate search query length
#         if len(q.strip()) < 2:
#             raise HTTPException(
#                 status_code=400, 
#                 detail="Search query must be at least 2 characters long"
#             )
        
#         # Use news service to search for real articles in user's country
#         search_results = await news_service.search_news(q, max_articles, user_country)
        
#         logger.info(f"✅ Search completed: {len(search_results)} results for '{q}' in {user_country}")
        
#         # search_news returns dictionaries, so no conversion needed
#         return {
#             "success": True,
#             "articles": search_results,                     # Already in dictionary format
#             "query": q,                                     # User's search query
#             "count": len(search_results),                   # Number of results found
#             "country": user_country,                        # User's current country preference
#             "timestamp": datetime.now().isoformat()        # Search completion time
#         }
        
#     except HTTPException:
#         # Re-raise validation errors (400, 401 status codes)
#         raise
#     except Exception as search_error:
#         logger.error(f"❌ Search error for '{q}': {search_error}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Search failed for '{q}'. Please try again later."
#         )

# @router.get("/news/trending")
# async def get_trending_news(
#     max_articles: Optional[int] = Query(12, ge=1, le=25),
#     credentials: HTTPAuthorizationCredentials = Depends(security)
# ):
#     """
#     Get trending news articles using user's country preference
    
#     Requires authentication - user must be logged in with a valid country preference.
#     Uses optimized search queries to find trending topics from the user's
#     selected country. Automatically updates when user changes country in settings.
    
#     Args:
#         max_articles: Maximum trending articles to return
#         credentials: Required user authentication (country extracted from user settings)
        
#     Returns:
#         JSON response with trending articles from user's country
#     """
#     try:
#         # Get user's country preference dynamically (required)
#         user_country = get_user_country(credentials)
        
#         if not user_country:
#             raise HTTPException(
#                 status_code=401,
#                 detail="Authentication required. Please log in and set your country preference in settings."
#             )
        
#         logger.info(f"📈 API Request: Trending news for country {user_country} (max: {max_articles})")
        
#         # Use the news service's trending functionality with user's country
#         trending_articles = await news_service.get_trending_news(max_articles, user_country)
        
#         logger.info(f"✅ Retrieved {len(trending_articles)} trending articles for {user_country}")
        
#         # FastAPI automatically converts ProcessedArticle objects to JSON
#         return {
#             "success": True,
#             "articles": trending_articles,                  # Auto-converted to JSON
#             "count": len(trending_articles),                # Number of trending articles
#             "country": user_country,                        # User's current country preference
#             "timestamp": datetime.now().isoformat()        # Response generation time
#         }
        
#     except HTTPException:
#         raise
#     except Exception as trending_error:
#         logger.error(f"❌ Error fetching trending news: {trending_error}")
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to fetch trending news. Please try again later."
#         )

# @router.get("/news/categories")
# async def get_available_categories():
#     """
#     Get list of all supported news categories and countries
    
#     Useful for frontend applications to dynamically build navigation
#     and populate country selection dropdowns in user settings
    
#     Returns:
#         JSON with list of valid categories, countries, and metadata
#     """
#     try:
#         logger.info("📋 API Request: Getting available categories and countries")
        
#         # Category information with descriptions
#         category_info = [
#             {"name": "politics", "display": "Politics", "description": "Government, elections, policy"},
#             {"name": "sports", "display": "Sports", "description": "Cricket, rugby, football, athletics"},
#             {"name": "health", "display": "Health", "description": "Healthcare, medical news, wellness"},
#             {"name": "business", "display": "Business", "description": "Economy, trade, finance, markets"},
#             {"name": "technology", "display": "Technology", "description": "Innovation, ICT, digital transformation"},
#             {"name": "local-trends", "display": "Local Trends", "description": "Social media, culture, lifestyle"},
#             {"name": "weather", "display": "Weather", "description": "Climate, forecasts, seasonal updates"},
#             {"name": "entertainment", "display": "Entertainment", "description": "Music, movies, celebrities, arts"},
#             {"name": "education", "display": "Education", "description": "Schools, universities, academic results"}
#         ]
        
#         # Country information for settings dropdown
#         country_info = [
#             {"code": "ZW", "name": "Zimbabwe", "flag": "🇿🇼"},
#             {"code": "KE", "name": "Kenya", "flag": "🇰🇪"}, 
#             {"code": "GH", "name": "Ghana", "flag": "🇬🇭"},
#             {"code": "RW", "name": "Rwanda", "flag": "🇷🇼"},
#             {"code": "CD", "name": "Democratic Republic of Congo", "flag": "🇨🇩"},
#             {"code": "ZA", "name": "South Africa", "flag": "🇿🇦"},
#             {"code": "BI", "name": "Burundi", "flag": "🇧🇮"}
#         ]
        
#         return {
#             "success": True,
#             "categories": category_info,                    # Detailed category information
#             "countries": country_info,                      # Available countries for settings
#             "valid_categories": VALID_CATEGORIES,           # Simple list for validation
#             "valid_countries": VALID_COUNTRIES,             # Simple list for validation
#             "count": len(VALID_CATEGORIES),                # Total number of categories
#             "timestamp": datetime.now().isoformat()       # Response time
#         }
        
#     except Exception as categories_error:
#         logger.error(f"❌ Error getting categories and countries: {categories_error}")
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to fetch available categories and countries"
#         )

# # ADMIN/DEBUG endpoint to manually override country (optional)
# @router.get("/news/{category}/country/{country_override}")
# async def get_news_by_category_with_country_override(
#     category: str,
#     country_override: str,
#     max_articles: Optional[int] = Query(MAX_ARTICLES_PER_CATEGORY, ge=1, le=20)
# ):
#     """
#     DEBUG/ADMIN endpoint: Get news for specific category with manual country override
    
#     This endpoint allows manually specifying a country, bypassing user settings.
#     Useful for testing different countries or admin functions.
    
#     Args:
#         category: News category
#         country_override: Country code to use (must be in VALID_COUNTRIES)
#         max_articles: Maximum articles to return
        
#     Returns:
#         JSON response with news from the specified country
#     """
#     try:
#         logger.info(f"🔧 DEBUG: {category} news with country override: {country_override}")
        
#         # Validate category and country
#         validate_category(category)
        
#         if country_override not in VALID_COUNTRIES:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"Invalid country override '{country_override}'. Valid countries: {', '.join(VALID_COUNTRIES)}"
#             )
        
#         # Fetch news with manual country override
#         articles = await news_service.get_news_for_category(category, max_articles, country_override)
        
#         logger.info(f"✅ DEBUG: Retrieved {len(articles)} {category} articles for {country_override}")
        
#         return {
#             "success": True,
#             "articles": articles,
#             "category": category.title(),
#             "count": len(articles),
#             "country": country_override,
#             "override_used": True,                          # Flag indicating manual override
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise
#     except Exception as override_error:
#         logger.error(f"❌ Error with country override {country_override}: {override_error}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to fetch {category} news for {country_override}"
#         )



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
from app.routes.search_routes import update_articles_cache

# Configuration constants
MAX_ARTICLES_PER_CATEGORY = 18
MAX_SEARCH_RESULTS = 50
MAX_BREAKING_NEWS = 30

# Valid news categories supported by the system
VALID_CATEGORIES = [
    'politics', 'sports', 'health', 'business', 'technology',
    'local-trends', 'weather', 'entertainment', 'education'
]

# Valid countries that users can select in their settings
VALID_COUNTRIES = [
    'ZW',  # Zimbabwe
    # 'KE',  # Kenya  
    # 'GH',  # Ghana
    # 'RW',  # Rwanda
    # 'CD',  # Democratic Republic of Congo
    # 'ZA',  # South Africa
    # 'BI'   # Burundi
]

# Create router and security instances
router = APIRouter()
security = HTTPBearer(auto_error=False)  # Optional authentication
logger = logging.getLogger(__name__)

# Database functions (shared with auth_routes)
def load_database() -> Dict[str, Any]:
    """Load user data from JSON database file"""
    try:
        if os.path.exists("users_db.json"):
            with open("users_db.json", 'r') as f:
                return json.load(f)
        else:
            return {"users": [], "sessions": []}
    except Exception as e:
        logger.error(f"Error loading database: {e}")
        return {"users": [], "sessions": []}

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Get user information from session token
    Returns user object with country_of_interest field
    """
    if not token:
        return None
        
    db_data = load_database()
    
    # Find active session matching the token
    for session in db_data["sessions"]:
        if session["session_id"] == token and session["is_active"]:
            # Check if session is expired
            expires_at = datetime.fromisoformat(session["expires_at"])
            if datetime.now() > expires_at:
                # Session expired, deactivate it
                session["is_active"] = False
                # Note: In production, you might want to save this change
                return None
            
            # Find user by session's user_id
            for user in db_data["users"]:
                if user["id"] == session["user_id"]:
                    return user
    
    return None

def get_user_country(credentials: Optional[HTTPAuthorizationCredentials] = None) -> Optional[str]:
    """
    Get the authenticated user's country preference
    
    Args:
        credentials: Optional authentication credentials
        
    Returns:
        User's country code, or None if no authentication/invalid country
    """
    # If no authentication provided, return None
    if not credentials:
        logger.info("🌍 No authentication - no country specified")
        return None
    
    # Get user from token
    user = get_user_from_token(credentials.credentials)
    
    if not user:
        logger.info("🌍 Invalid/expired token - no country available") 
        return None
    
    # Get user's country preference
    user_country = user.get("country_of_interest")
    
    # Validate the country is supported
    if not user_country or user_country not in VALID_COUNTRIES:
        logger.warning(f"⚠️  User has invalid/missing country '{user_country}' - authentication required")
        return None
    
    logger.info(f"🌍 Using user's country preference: {user_country}")
    return user_country

def validate_category(category: str) -> None:
    """
    Validate that the requested category is supported
    
    Args:
        category: Category name to validate
        
    Raises:
        HTTPException: If category is not in VALID_CATEGORIES
    """
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{category}'. Valid categories: {', '.join(VALID_CATEGORIES)}"
        )

def convert_articles_for_cache(articles: List[Any], category: str, user_country: str) -> List[Dict[str, Any]]:
    """
    Convert news articles to the format expected by search cache
    
    Args:
        articles: List of articles from news service (ProcessedArticle objects or dicts)
        category: Category the articles belong to
        user_country: User's country code
        
    Returns:
        List of dictionaries ready for search cache
    """
    cache_articles = []
    
    for article in articles:
        try:
            # Handle both ProcessedArticle objects and dictionaries
            if hasattr(article, '__dict__'):  # ProcessedArticle object
                article_dict = {
                    'id': getattr(article, 'id', f"auto_{datetime.now().timestamp()}"),
                    'title': getattr(article, 'title', 'Untitled'),
                    'summary': getattr(article, 'summary', 'No summary available'),
                    'category': getattr(article, 'category', category),
                    'timestamp': getattr(article, 'timestamp', datetime.now().isoformat()),
                    'readTime': getattr(article, 'readTime', '2 min read'),
                    'isBreaking': getattr(article, 'isBreaking', False),
                    'imageUrl': getattr(article, 'imageUrl', None),
                    'sourceUrl': getattr(article, 'sourceUrl', ''),
                    'source': getattr(article, 'source', 'Unknown Source'),
                    'linked_sources': getattr(article, 'linked_sources', []),
                    'country_code': user_country,
                    'cached_at': datetime.now().isoformat(),
                    'search_enabled': True
                }
            elif isinstance(article, dict):  # Already a dictionary
                article_dict = article.copy()
                # Ensure required fields are present
                article_dict.update({
                    'category': article_dict.get('category', category),
                    'country_code': user_country,
                    'cached_at': datetime.now().isoformat(),
                    'search_enabled': True
                })
            else:
                # Skip unsupported article formats
                logger.warning(f"⚠️ Skipping unsupported article format: {type(article)}")
                continue
                
            cache_articles.append(article_dict)
            
        except Exception as convert_error:
            logger.warning(f"⚠️ Failed to convert article for cache: {convert_error}")
            continue
    
    return cache_articles

def update_search_cache_safely(articles: List[Any], category: str, user_country: str, operation_name: str = "fetch") -> bool:
    """
    Safely update search cache with new articles, with error handling
    
    Args:
        articles: Articles to add to cache
        category: Category name for logging
        user_country: User's country code
        operation_name: Name of operation for logging (fetch, search, etc.)
        
    Returns:
        True if cache update succeeded, False otherwise
    """
    try:
        # Convert articles to cache format
        cache_articles = convert_articles_for_cache(articles, category, user_country)
        
        if not cache_articles:
            logger.info(f"📦 No articles to cache for {category} in {user_country}")
            return True
        
        # Update the search cache
        update_articles_cache(cache_articles)
        
        logger.info(f"📦 Search cache updated: {len(cache_articles)} {category} articles from {user_country} ({operation_name})")
        return True
        
    except Exception as cache_error:
        # Log error but don't fail the main operation
        logger.warning(f"⚠️ Failed to update search cache for {category} in {user_country}: {cache_error}")
        return False

@router.get("/news/{category}")
async def get_news_by_category(
    category: str,
    max_articles: Optional[int] = Query(MAX_ARTICLES_PER_CATEGORY, ge=1, le=20),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get real news articles for a specific category using user's country preference
    **NOW INCLUDES: Automatic search cache updates**
    
    Requires authentication - user must be logged in and have a country set in their settings.
    The country is automatically determined from the authenticated user's settings.
    When user changes country in settings, all subsequent news requests use the new country.
    
    Args:
        category: News category (politics, sports, health, etc.)
        max_articles: Maximum number of articles to return (1-20)
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with success status and list of localized articles
    """
    try:
        # Get user's country preference from their settings (required)
        user_country = get_user_country(credentials)
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
        logger.info(f"📰 API Request: {category} news for country {user_country} (max: {max_articles})")
        
        # Validate the requested category
        validate_category(category)
        
        # Fetch real news articles using user's country preference
        articles = await news_service.get_news_for_category(category, max_articles, user_country)
        
        logger.info(f"✅ Retrieved {len(articles)} real {category} articles for {user_country}")
        
        # **NEW: Automatically update search cache with fetched articles**
        cache_updated = update_search_cache_safely(articles, category, user_country, "category_fetch")
        
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
    max_per_category: Optional[int] = Query(6, ge=1, le=10),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get news for all categories simultaneously using user's country preference
    **NOW INCLUDES: Bulk search cache updates for all categories**
    
    Requires authentication - user must be logged in with a valid country preference.
    Perfect for homepage/dashboard that displays multiple categories.
    Country is automatically determined from user's settings.
    
    Args:
        max_per_category: Number of articles per category (1-10)
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON with news organized by category, localized to user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
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
    max_articles: Optional[int] = Query(15, ge=1, le=MAX_BREAKING_NEWS),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get breaking news articles using user's country preference
    **NOW INCLUDES: Automatic search cache updates for breaking news**
    
    Requires authentication - user must be logged in with a valid country preference.
    Searches multiple categories for urgent news from the user's selected country.
    When user changes their country in settings, breaking news automatically updates.
    
    Args:
        max_articles: Maximum breaking news articles to return
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with breaking news articles from user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
        logger.info(f"🚨 API Request: Breaking news for country {user_country} (max: {max_articles})")
        
        # Priority categories most likely to have breaking news
        priority_categories = ['politics', 'business', 'health', 'sports', 'technology']
        
        # Collect breaking news from multiple categories concurrently
        async def get_breaking_from_category(category: str):
            """Get articles from one category and filter for breaking news"""
            try:
                # Get recent articles from this category using user's country
                articles = await news_service.get_news_for_category(category, 5, user_country)
                # Filter only the breaking news articles
                breaking_only = [article for article in articles if getattr(article, 'isBreaking', False)]
                return breaking_only
            except Exception as category_error:
                logger.warning(f"⚠️  Error getting breaking news from {category}: {category_error}")
                return []
        
        # Fetch breaking news from all priority categories concurrently
        breaking_tasks = [get_breaking_from_category(cat) for cat in priority_categories]
        breaking_results = await asyncio.gather(*breaking_tasks, return_exceptions=True)
        
        # Combine all breaking news articles
        all_breaking_articles = []
        for result in breaking_results:
            if isinstance(result, Exception):
                logger.warning(f"⚠️  Breaking news task failed: {result}")
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
    max_articles: Optional[int] = Query(20, ge=1, le=MAX_SEARCH_RESULTS),
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
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
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

@router.get("/news/trending")
async def get_trending_news(
    max_articles: Optional[int] = Query(12, ge=1, le=25),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get trending news articles using user's country preference
    **NOW INCLUDES: Automatic search cache updates for trending articles**
    
    Requires authentication - user must be logged in with a valid country preference.
    Uses optimized search queries to find trending topics from the user's
    selected country. Automatically updates when user changes country in settings.
    
    Args:
        max_articles: Maximum trending articles to return
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with trending articles from user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
        logger.info(f"📈 API Request: Trending news for country {user_country} (max: {max_articles})")
        
        # Use the news service's trending functionality with user's country
        trending_articles = await news_service.get_trending_news(max_articles, user_country)
        
        logger.info(f"✅ Retrieved {len(trending_articles)} trending articles for {user_country}")
        
        # **NEW: Update search cache with trending articles**
        cache_updated = update_search_cache_safely(trending_articles, 'trending', user_country, "trending")
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "articles": trending_articles,                  # Auto-converted to JSON
            "count": len(trending_articles),                # Number of trending articles
            "country": user_country,                        # User's current country preference
            "search_cache_updated": cache_updated,          # Indicate if cache was updated
            "timestamp": datetime.now().isoformat()        # Response generation time
        }
        
    except HTTPException:
        raise
    except Exception as trending_error:
        logger.error(f"❌ Error fetching trending news: {trending_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch trending news. Please try again later."
        )

@router.get("/news/categories")
async def get_available_categories():
    """
    Get list of all supported news categories and countries
    
    Useful for frontend applications to dynamically build navigation
    and populate country selection dropdowns in user settings
    
    Returns:
        JSON with list of valid categories, countries, and metadata
    """
    try:
        logger.info("📋 API Request: Getting available categories and countries")
        
        # Category information with descriptions
        category_info = [
            {"name": "politics", "display": "Politics", "description": "Government, elections, policy"},
            {"name": "sports", "display": "Sports", "description": "Cricket, rugby, football, athletics"},
            {"name": "health", "display": "Health", "description": "Healthcare, medical news, wellness"},
            {"name": "business", "display": "Business", "description": "Economy, trade, finance, markets"},
            {"name": "technology", "display": "Technology", "description": "Innovation, ICT, digital transformation"},
            {"name": "local-trends", "display": "Local Trends", "description": "Social media, culture, lifestyle"},
            {"name": "weather", "display": "Weather", "description": "Climate, forecasts, seasonal updates"},
            {"name": "entertainment", "display": "Entertainment", "description": "Music, movies, celebrities, arts"},
            {"name": "education", "display": "Education", "description": "Schools, universities, academic results"}
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
            "categories": category_info,                    # Detailed category information
            "countries": country_info,                      # Available countries for settings
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
    max_articles: Optional[int] = Query(MAX_ARTICLES_PER_CATEGORY, ge=1, le=20)
):
    """
    DEBUG/ADMIN endpoint: Get news for specific category with manual country override
    **NOW INCLUDES: Automatic search cache updates for debug requests**
    
    This endpoint allows manually specifying a country, bypassing user settings.
    Useful for testing different countries or admin functions.
    
    Args:
        category: News category
        country_override: Country code to use (must be in VALID_COUNTRIES)
        max_articles: Maximum articles to return
        
    Returns:
        JSON response with news from the specified country
    """
    try:
        logger.info(f"🔧 DEBUG: {category} news with country override: {country_override}")
        
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