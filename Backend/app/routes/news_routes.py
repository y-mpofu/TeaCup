# # Backend/app/routes/news_routes.py
# # COMPLETE: All news routes including missing individual category endpoints

# from fastapi import APIRouter, HTTPException, Query
# from typing import Optional, Dict, List
# import asyncio
# from datetime import datetime
# import logging
# max_articles_per_section = 18  # Import our config for max articles

# # Import our REAL news service
# from app.services.news_service import news_service

# router = APIRouter()

# # Set up logging
# logger = logging.getLogger(__name__)

# # FIXED: Add all the individual category endpoints that frontend is calling
# @router.get("/news/{category}")
# async def get_news_by_category(
#     category: str,
#     max_articles: Optional[int] = Query(max_articles_per_section, ge=1, le=20)
# ):
#     """
#     Get news for a specific category
#     This is the endpoint your frontend is calling: /api/news/politics, /api/news/sports, etc.
#     """
#     try:
#         logger.info(f"📰 API Request: Getting {category} news (max {max_articles})")
        
#         # Validate category
#         valid_categories = [
#             'politics', 'sports', 'health', 'business', 'technology',
#             'local-trends', 'weather', 'entertainment', 'education'
#         ]
        
#         if category not in valid_categories:
#             raise HTTPException(
#                 status_code=400, 
#                 detail=f"Invalid category '{category}'. Valid categories: {', '.join(valid_categories)}"
#             )
        
#         # Fetch news for the specific category
#         articles = await news_service.get_news_for_category(category, max_articles)
        
#         # Convert articles to dict format
#         articles_dict = []
#         for article in articles:
#             if hasattr(article, '__dict__'):  # ProcessedArticle object
#                 article_dict = {
#                     'id': article.id,
#                     'title': article.title,
#                     'summary': article.summary,
#                     'category': article.category,
#                     'timestamp': article.timestamp,
#                     'readTime': article.readTime,
#                     'isBreaking': article.isBreaking,
#                     'imageUrl': article.imageUrl,
#                     'sourceUrl': article.sourceUrl,
#                     'source': article.source,
#                     'linked_sources': article.linked_sources
#                 }
#                 articles_dict.append(article_dict)
        
#         logger.info(f"✅ Successfully fetched {len(articles_dict)} {category} articles")
        
#         return {
#             "success": True,
#             "articles": articles_dict,
#             "category": category.title(),  # Format for frontend
#             "count": len(articles_dict),
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise  # Re-raise HTTP exceptions as-is
#     except Exception as e:
#         logger.error(f"❌ Error fetching {category} news: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to fetch {category} news: {str(e)}")

# @router.get("/news/all")
# async def get_all_news(
#     max_per_category: Optional[int] = Query(3, ge=1, le=10)
# ):
#     """
#     Get real news for all categories
#     COMPLETELY REPLACED: Now processes multiple categories concurrently
#     """
#     try:
#         logger.info(f"📰 API Request: Getting REAL news for ALL categories (max {max_per_category} per category)")
        
#         # All available categories
#         categories = [
#             'politics', 'sports', 'health', 'business', 'technology',
#             'local-trends', 'weather', 'entertainment', 'education'
#         ]
        
#         # Function to fetch news for a single category
#         async def fetch_category_news(category: str):
#             try:
#                 logger.info(f"🔄 Processing {category}...")
#                 articles = await news_service.get_news_for_category(category, max_per_category)
#                 return category, articles
#             except Exception as e:
#                 logger.error(f"❌ Error fetching {category}: {str(e)}")
#                 return category, []
        
#         # Process categories concurrently (but limit concurrency to avoid overwhelming APIs)
#         semaphore = asyncio.Semaphore(3)  # Only 3 concurrent requests
        
#         async def limited_fetch(category):
#             async with semaphore:
#                 return await fetch_category_news(category)
        
#         # Execute all category fetches
#         tasks = [limited_fetch(cat) for cat in categories]
#         results = await asyncio.gather(*tasks, return_exceptions=True)
        
#         # Process results
#         all_news = {}
#         for result in results:
#             if isinstance(result, Exception):
#                 logger.error(f"❌ Category fetch failed: {result}")
#                 continue
                
#             category, articles = result
            
#             # Convert articles to dict format
#             articles_dict = []
#             for article in articles:
#                 if hasattr(article, '__dict__'):  # ProcessedArticle object
#                     article_dict = {
#                         'id': article.id,
#                         'title': article.title,
#                         'summary': article.summary,
#                         'category': article.category,
#                         'timestamp': article.timestamp,
#                         'readTime': article.readTime,
#                         'isBreaking': article.isBreaking,
#                         'imageUrl': article.imageUrl,
#                         'sourceUrl': article.sourceUrl,
#                         'source': article.source,
#                         'linked_sources': article.linked_sources
#                     }
#                     articles_dict.append(article_dict)
            
#             all_news[category] = articles_dict
        
#         total_articles = sum(len(articles) for articles in all_news.values())
        
#         logger.info(f"✅ Successfully processed ALL categories: {total_articles} total REAL articles")
        
#         return {
#             "success": True,
#             "news_by_category": all_news,
#             "total_articles": total_articles,
#             "categories_count": len(all_news),
#             "data_source": "real_news",
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"❌ Error fetching ALL news: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to fetch all news: {str(e)}")

# @router.get("/news/breaking")
# async def get_breaking_news(
#     max_articles: Optional[int] = Query(10, ge=1, le=30)
# ):
#     """
#     Get breaking news articles from all categories
#     """
#     try:
#         logger.info(f"🚨 API Request: Getting breaking news (max {max_articles})")
        
#         # Get articles from multiple categories and filter for breaking news
#         categories = ['politics', 'sports', 'health', 'business', 'technology']
#         all_breaking = []
        
#         for category in categories:
#             try:
#                 articles = await news_service.get_news_for_category(category, 5)
#                 # Filter for breaking news only
#                 breaking_articles = [article for article in articles if getattr(article, 'isBreaking', False)]
#                 all_breaking.extend(breaking_articles)
#             except Exception as e:
#                 logger.warning(f"⚠️  Error fetching breaking news from {category}: {e}")
#                 continue
        
#         # Sort by timestamp and limit results
#         all_breaking.sort(key=lambda x: x.timestamp, reverse=True)
#         breaking_articles = all_breaking[:max_articles]
        
#         # Convert to dict format
#         articles_dict = []
#         for article in breaking_articles:
#             if hasattr(article, '__dict__'):
#                 article_dict = {
#                     'id': article.id,
#                     'title': article.title,
#                     'summary': article.summary,
#                     'category': article.category,
#                     'timestamp': article.timestamp,
#                     'readTime': article.readTime,
#                     'isBreaking': True,  # All are breaking news
#                     'imageUrl': article.imageUrl,
#                     'sourceUrl': article.sourceUrl,
#                     'source': article.source,
#                     'linked_sources': article.linked_sources
#                 }
#                 articles_dict.append(article_dict)
        
#         logger.info(f"✅ Successfully fetched {len(articles_dict)} breaking news articles")
        
#         return {
#             "success": True,
#             "articles": articles_dict,
#             "count": len(articles_dict),
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"❌ Error fetching breaking news: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to fetch breaking news: {str(e)}")

# @router.get("/news/search")
# async def search_news(
#     q: str = Query(..., description="Search query"),
#     max_articles: Optional[int] = Query(20, ge=1, le=50)
# ):
#     """
#     Search for news articles by keyword
#     """
#     try:
#         logger.info(f"🔍 API Request: Searching for '{q}' (max {max_articles})")
        
#         if len(q.strip()) < 2:
#             raise HTTPException(status_code=400, detail="Search query must be at least 2 characters long")
        
#         # Use the news service search functionality
#         search_results = await news_service.search_news(q, max_articles)
        
#         logger.info(f"✅ Search returned {len(search_results)} results for '{q}'")
        
#         return {
#             "success": True,
#             "articles": search_results,
#             "query": q,
#             "count": len(search_results),
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise  # Re-raise HTTP exceptions as-is
#     except Exception as e:
#         logger.error(f"❌ Error searching for '{q}': {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")








# # Backend/app/routes/news_routes.py
# # CLEANED: Removed all redundancy and unnecessary manual conversions

# from fastapi import APIRouter, HTTPException, Query
# from typing import Optional, Dict, List
# import asyncio
# from datetime import datetime
# import logging

# # Configuration
# MAX_ARTICLES_PER_SECTION = 18
# VALID_CATEGORIES = [
#     'politics', 'sports', 'health', 'business', 'technology',
#     'local-trends', 'weather', 'entertainment', 'education'
# ]

# # Import our news service
# from app.services.news_service import news_service

# router = APIRouter()
# logger = logging.getLogger(__name__)


# def validate_category(category: str) -> None:
#     """Validate that category is allowed"""
#     if category not in VALID_CATEGORIES:
#         raise HTTPException(
#             status_code=400,
#             detail=f"Invalid category '{category}'. Valid categories: {', '.join(VALID_CATEGORIES)}"
#         )


# @router.get("/news/{category}")
# async def get_news_by_category(
#     category: str,
#     max_articles: Optional[int] = Query(MAX_ARTICLES_PER_SECTION, ge=1, le=20)
# ):
#     """
#     Get news for a specific category
#     This is the endpoint your frontend is calling: /api/news/politics, /api/news/sports, etc.
#     """
#     try:
#         logger.info(f"📰 API Request: Getting {category} news (max {max_articles})")
        
#         # Validate category
#         validate_category(category)
        
#         # Fetch news for the specific category
#         articles = await news_service.get_news_for_category(category, max_articles)
        
#         logger.info(f"✅ Successfully fetched {len(articles)} {category} articles")
        
#         # FastAPI automatically converts ProcessedArticle objects to JSON
#         return {
#             "success": True,
#             "articles": articles,  # No manual conversion needed!
#             "category": category.title(),
#             "count": len(articles),
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise  # Re-raise HTTP exceptions as-is
#     except Exception as e:
#         logger.error(f"❌ Error fetching {category} news: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to fetch {category} news: {str(e)}")


# @router.get("/news/all")
# async def get_all_news(
#     max_per_category: Optional[int] = Query(3, ge=1, le=10)
# ):
#     """
#     Get news for all categories with concurrent processing
#     Returns a small preview of each category for homepage display
#     """
#     try:
#         logger.info(f"📰 API Request: Getting ALL categories (max {max_per_category} per category)")
        
#         async def fetch_category_news(category: str):
#             """Fetch news for a single category with error handling"""
#             try:
#                 logger.info(f"🔄 Processing {category}...")
#                 articles = await news_service.get_news_for_category(category, max_per_category)
#                 return category, articles
#             except Exception as e:
#                 logger.error(f"❌ Error fetching {category}: {str(e)}")
#                 return category, []  # Return empty list on error
        
#         # Use semaphore to limit concurrent requests (avoid overwhelming APIs)
#         semaphore = asyncio.Semaphore(3)
        
#         async def limited_fetch(category):
#             async with semaphore:
#                 return await fetch_category_news(category)
        
#         # Execute all category fetches concurrently
#         tasks = [limited_fetch(cat) for cat in VALID_CATEGORIES]
#         results = await asyncio.gather(*tasks, return_exceptions=True)
        
#         # Process results
#         all_news = {}
#         for result in results:
#             if isinstance(result, Exception):
#                 logger.error(f"❌ Category fetch failed: {result}")
#                 continue
            
#             category, articles = result
#             all_news[category] = articles  # FastAPI handles conversion automatically
        
#         total_articles = sum(len(articles) for articles in all_news.values())
        
#         logger.info(f"✅ Successfully processed ALL categories: {total_articles} total articles")
        
#         return {
#             "success": True,
#             "news_by_category": all_news,  # No manual conversion needed!
#             "total_articles": total_articles,
#             "categories_count": len(all_news),
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"❌ Error fetching ALL news: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to fetch all news: {str(e)}")


# @router.get("/news/breaking")
# async def get_breaking_news(
#     max_articles: Optional[int] = Query(10, ge=1, le=30)
# ):
#     """
#     Get breaking news articles from all categories
#     """
#     try:
#         logger.info(f"🚨 API Request: Getting breaking news (max {max_articles})")
        
#         # Get articles from key categories and filter for breaking news
#         priority_categories = ['politics', 'sports', 'health', 'business', 'technology']
#         all_breaking = []
        
#         for category in priority_categories:
#             try:
#                 articles = await news_service.get_news_for_category(category, 5)
#                 # Filter for breaking news only
#                 breaking_articles = [article for article in articles if getattr(article, 'isBreaking', False)]
#                 all_breaking.extend(breaking_articles)
#             except Exception as e:
#                 logger.warning(f"⚠️  Error fetching breaking news from {category}: {e}")
#                 continue
        
#         # Sort by timestamp (most recent first) and limit results
#         all_breaking.sort(key=lambda x: x.timestamp, reverse=True)
#         breaking_articles = all_breaking[:max_articles]
        
#         logger.info(f"✅ Successfully fetched {len(breaking_articles)} breaking news articles")
        
#         return {
#             "success": True,
#             "articles": breaking_articles,  # FastAPI handles conversion
#             "count": len(breaking_articles),
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except Exception as e:
#         logger.error(f"❌ Error fetching breaking news: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Failed to fetch breaking news: {str(e)}")


# @router.get("/news/search")
# async def search_news(
#     q: str = Query(..., description="Search query"),
#     max_articles: Optional[int] = Query(20, ge=1, le=50)
# ):
#     """
#     Search for news articles by keyword
#     """
#     try:
#         logger.info(f"🔍 API Request: Searching for '{q}' (max {max_articles})")
        
#         # Validate search query
#         if len(q.strip()) < 2:
#             raise HTTPException(
#                 status_code=400, 
#                 detail="Search query must be at least 2 characters long"
#             )
        
#         # Use the news service search functionality
#         search_results = await news_service.search_news(q, max_articles)
        
#         logger.info(f"✅ Search returned {len(search_results)} results for '{q}'")
        
#         return {
#             "success": True,
#             "articles": search_results,  # FastAPI handles conversion
#             "query": q,
#             "count": len(search_results),
#             "timestamp": datetime.now().isoformat()
#         }
        
#     except HTTPException:
#         raise  # Re-raise HTTP exceptions as-is
#     except Exception as e:
#         logger.error(f"❌ Error searching for '{q}': {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


# # Additional utility endpoint for getting available categories
# @router.get("/news/categories")
# async def get_available_categories():
#     """
#     Get list of available news categories
#     Useful for frontend to know what categories are supported
#     """
#     return {
#         "success": True,
#         "categories": VALID_CATEGORIES,
#         "count": len(VALID_CATEGORIES),
#         "timestamp": datetime.now().isoformat()
#     }





# Backend/app/routes/news_routes.py
# Dynamic country-aware news routes - gets country from authenticated user's settings

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
    'KE',  # Kenya  
    'GH',  # Ghana
    'RW',  # Rwanda
    'CD',  # Democratic Republic of Congo
    'ZA',  # South Africa
    'BI'   # Burundi
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

@router.get("/news/{category}")
async def get_news_by_category(
    category: str,
    max_articles: Optional[int] = Query(MAX_ARTICLES_PER_CATEGORY, ge=1, le=20),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get real news articles for a specific category using user's country preference
    
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
        
        # FastAPI automatically converts ProcessedArticle dataclass objects to JSON
        return {
            "success": True,
            "articles": articles,                           # Auto-converted to JSON
            "category": category.title(),                   # Formatted category name
            "count": len(articles),                         # Number of articles returned
            "country": user_country,                        # User's country preference
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
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "news_by_category": news_by_category,           # Auto-converted to JSON
            "total_articles": total_articles,               # Total count across all categories
            "categories_count": successful_categories,      # Number of categories with articles
            "country": user_country,                        # User's current country preference
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
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "articles": final_breaking_news,                # Auto-converted to JSON
            "count": len(final_breaking_news),              # Number of breaking articles
            "country": user_country,                        # User's current country preference
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
        
        # search_news returns dictionaries, so no conversion needed
        return {
            "success": True,
            "articles": search_results,                     # Already in dictionary format
            "query": q,                                     # User's search query
            "count": len(search_results),                   # Number of results found
            "country": user_country,                        # User's current country preference
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
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "articles": trending_articles,                  # Auto-converted to JSON
            "count": len(trending_articles),                # Number of trending articles
            "country": user_country,                        # User's current country preference
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
        
        return {
            "success": True,
            "articles": articles,
            "category": category.title(),
            "count": len(articles),
            "country": country_override,
            "override_used": True,                          # Flag indicating manual override
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