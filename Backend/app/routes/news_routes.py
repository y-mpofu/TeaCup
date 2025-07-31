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
# Clean, efficient news API routes with no redundancy
# All routes work with real data from news_service

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, List
import asyncio
from datetime import datetime
import logging

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

# Create router instance for news endpoints
router = APIRouter()
logger = logging.getLogger(__name__)

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
    country: Optional[str] = Query('ZW', description="Country code (ZW, KE, GH, etc.)")
):
    """
    Get real news articles for a specific category
    
    This endpoint is called by your frontend: /api/news/politics, /api/news/sports, etc.
    Returns individual articles for the requested category
    
    Args:
        category: News category (politics, sports, health, etc.)
        max_articles: Maximum number of articles to return (1-20)
        country: Country code for localized news (default: ZW for Zimbabwe)
        
    Returns:
        JSON response with success status and list of articles
    """
    try:
        logger.info(f"📰 API Request: {category} news for {country} (max: {max_articles})")
        
        # Validate the requested category
        validate_category(category)
        
        # Fetch real news articles from Google Custom Search
        # The news_service returns ProcessedArticle objects
        articles = await news_service.get_news_for_category(category, max_articles, country)
        
        logger.info(f"✅ Retrieved {len(articles)} real {category} articles for {country}")
        
        # FastAPI automatically converts ProcessedArticle dataclass objects to JSON
        # No manual conversion needed - FastAPI handles this seamlessly
        return {
            "success": True,
            "articles": articles,                           # Auto-converted to JSON
            "category": category.title(),                   # Formatted category name
            "count": len(articles),                         # Number of articles returned
            "country": country,                             # Country code used
            "timestamp": datetime.now().isoformat()        # When this response was generated
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (400, 404, etc.) without modification
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
    country: Optional[str] = Query('ZW', description="Country code")
):
    """
    Get news for all categories simultaneously
    
    Optimized for homepage/dashboard that displays multiple categories
    Uses concurrent processing to fetch all categories efficiently
    
    Args:
        max_per_category: Number of articles per category (1-10)
        country: Country code for localized news
        
    Returns:
        JSON with news organized by category
    """
    try:
        logger.info(f"📊 API Request: ALL categories for {country} ({max_per_category} per category)")
        
        # Use the news service's optimized concurrent fetching
        # This method handles all the async complexity internally
        news_by_category = await news_service.get_all_categories_news(max_per_category, country)
        
        # Calculate total statistics
        total_articles = sum(len(articles) for articles in news_by_category.values())
        successful_categories = sum(1 for articles in news_by_category.values() if len(articles) > 0)
        
        logger.info(f"✅ Dashboard complete: {total_articles} articles across {successful_categories} categories")
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "news_by_category": news_by_category,           # Auto-converted to JSON
            "total_articles": total_articles,               # Total count across all categories
            "categories_count": successful_categories,      # Number of categories with articles
            "country": country,                             # Country used for search
            "timestamp": datetime.now().isoformat()        # Response generation time
        }
        
    except Exception as dashboard_error:
        logger.error(f"❌ Error fetching all categories for {country}: {dashboard_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch news dashboard. Please try again later."
        )

@router.get("/news/breaking")
async def get_breaking_news(
    max_articles: Optional[int] = Query(15, ge=1, le=MAX_BREAKING_NEWS),
    country: Optional[str] = Query('ZW', description="Country code")
):
    """
    Get breaking news articles from across all categories
    
    Searches multiple categories and filters for articles marked as breaking news
    Sorted by recency to show the most urgent news first
    
    Args:
        max_articles: Maximum breaking news articles to return
        country: Country code for localized breaking news
        
    Returns:
        JSON response with breaking news articles
    """
    try:
        logger.info(f"🚨 API Request: Breaking news for {country} (max: {max_articles})")
        
        # Priority categories most likely to have breaking news
        priority_categories = ['politics', 'business', 'health', 'sports', 'technology']
        
        # Collect breaking news from multiple categories concurrently
        async def get_breaking_from_category(category: str):
            """Get articles from one category and filter for breaking news"""
            try:
                # Get a small number of recent articles from this category
                articles = await news_service.get_news_for_category(category, 5, country)
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
        
        logger.info(f"✅ Found {len(final_breaking_news)} breaking news articles for {country}")
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "articles": final_breaking_news,                # Auto-converted to JSON
            "count": len(final_breaking_news),              # Number of breaking articles
            "country": country,                             # Country code used
            "timestamp": datetime.now().isoformat()        # Response time
        }
        
    except Exception as breaking_error:
        logger.error(f"❌ Error fetching breaking news for {country}: {breaking_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch breaking news. Please try again later."
        )

@router.get("/news/search")
async def search_news_articles(
    q: str = Query(..., description="Search query - minimum 2 characters"),
    max_articles: Optional[int] = Query(20, ge=1, le=MAX_SEARCH_RESULTS),
    country: Optional[str] = Query('ZW', description="Country code for localized search")
):
    """
    Search for news articles by keyword across all sources
    
    Uses Google Custom Search to find articles matching the user's query
    Returns articles in the same format as category endpoints
    
    Args:
        q: Search query string (minimum 2 characters)
        max_articles: Maximum search results to return (1-50)
        country: Country code for localized search results
        
    Returns:
        JSON response with search results
    """
    try:
        logger.info(f"🔍 API Request: Search '{q}' in {country} (max: {max_articles})")
        
        # Validate search query length
        if len(q.strip()) < 2:
            raise HTTPException(
                status_code=400, 
                detail="Search query must be at least 2 characters long"
            )
        
        # Use news service to search for real articles
        # Returns list of dictionaries (already in correct format)
        search_results = await news_service.search_news(q, max_articles, country)
        
        logger.info(f"✅ Search completed: {len(search_results)} results for '{q}'")
        
        # search_news returns dictionaries, so no conversion needed
        return {
            "success": True,
            "articles": search_results,                     # Already in dictionary format
            "query": q,                                     # User's search query
            "count": len(search_results),                   # Number of results found
            "country": country,                             # Country used for search
            "timestamp": datetime.now().isoformat()        # Search completion time
        }
        
    except HTTPException:
        # Re-raise validation errors (400 status codes)
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
    country: Optional[str] = Query('ZW', description="Country code")
):
    """
    Get trending news articles from across all categories
    
    Uses optimized search queries to find trending topics and viral stories
    Different from breaking news - focuses on popular/trending content
    
    Args:
        max_articles: Maximum trending articles to return
        country: Country code for localized trending news
        
    Returns:
        JSON response with trending articles
    """
    try:
        logger.info(f"📈 API Request: Trending news for {country} (max: {max_articles})")
        
        # Use the news service's trending functionality
        trending_articles = await news_service.get_trending_news(max_articles, country)
        
        logger.info(f"✅ Retrieved {len(trending_articles)} trending articles for {country}")
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "articles": trending_articles,                  # Auto-converted to JSON
            "count": len(trending_articles),                # Number of trending articles
            "country": country,                             # Country code used
            "timestamp": datetime.now().isoformat()        # Response generation time
        }
        
    except Exception as trending_error:
        logger.error(f"❌ Error fetching trending news for {country}: {trending_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch trending news. Please try again later."
        )

@router.get("/news/categories")
async def get_available_categories():
    """
    Get list of all supported news categories
    
    Useful for frontend applications to dynamically build navigation
    or validate user requests against supported categories
    
    Returns:
        JSON with list of valid categories and metadata
    """
    try:
        logger.info("📋 API Request: Getting available categories")
        
        # Return the list of valid categories with descriptions
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
        
        return {
            "success": True,
            "categories": category_info,                    # Detailed category information
            "simple_list": VALID_CATEGORIES,               # Simple list for validation
            "count": len(VALID_CATEGORIES),                # Total number of categories
            "timestamp": datetime.now().isoformat()       # Response time
        }
        
    except Exception as categories_error:
        logger.error(f"❌ Error getting categories: {categories_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch available categories"
        )