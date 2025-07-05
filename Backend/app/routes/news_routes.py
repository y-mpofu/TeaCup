# Backend/app/routes/news_routes.py
# News-related API endpoints for FastAPI
# These handle all news fetching, processing, and serving

from fastapi import APIRouter, HTTPException, status, Query, Depends
from datetime import datetime
import logging
from typing import Optional, Dict, List
import asyncio

# Import our models from the models folder
from models import (
    NewsResponse, 
    AllNewsResponse, 
    NewsArticleResponse, 
    SearchRequest,
    CategoryNewsRequest,
    AllNewsRequest,
    NewsCategory,
    CountryCode,
    ErrorResponse,
    QueryParameterValidator
)
from services.news_processor import NewsProcessor

# Set up logging
logger = logging.getLogger(__name__)

# Create router for news endpoints
router = APIRouter()

# Create a global news processor instance
# This will be reused across requests for efficiency
news_processor = NewsProcessor()

@router.get("/news/{category}", response_model=NewsResponse, status_code=status.HTTP_200_OK)
async def get_news_by_category(
    category: NewsCategory,  # This validates the category automatically
    max_articles: int = Query(5, ge=1, le=20, description="Maximum number of articles to return"),
    country: CountryCode = Query(CountryCode.US, description="Country code for news")
):
    """
    Get news articles for a specific category
    
    This endpoint fetches, processes, and returns news articles for a given category.
    It goes through the complete pipeline: fetch -> scrape -> summarize -> format.
    
    Args:
        category: News category (politics, sports, health, etc.)
        max_articles: Number of articles to return (1-20)
        country: Country code for regional news
        
    Returns:
        NewsResponse: Processed news articles for the category
    """
    try:
        logger.info(f"Fetching {max_articles} articles for category: {category} (country: {country})")
        
        # Process articles through the complete pipeline
        processed_articles = await asyncio.to_thread(
            news_processor.process_articles_for_category,
            category.value,  # Convert enum to string
            max_articles
        )
        
        if not processed_articles:
            logger.warning(f"No articles found for category: {category}")
            
            # Return empty but successful response
            return NewsResponse(
                success=True,
                message=f"No articles available for {category} at the moment",
                articles=[],
                category=category.value,
                total_count=0,
                timestamp=datetime.now().isoformat()
            )
        
        logger.info(f"Successfully processed {len(processed_articles)} articles for {category}")
        
        return NewsResponse(
            success=True,
            message=f"Successfully fetched {len(processed_articles)} {category} articles",
            articles=processed_articles,
            category=category.value,
            total_count=len(processed_articles),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error fetching news for category {category}: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "CATEGORY_FETCH_ERROR",
                "message": f"Failed to fetch {category} news",
                "details": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@router.get("/news/all", response_model=AllNewsResponse, status_code=status.HTTP_200_OK)
async def get_all_news(
    max_articles_per_category: int = Query(5, ge=1, le=10, description="Max articles per category"),
    country: CountryCode = Query(CountryCode.US, description="Country code for news")
):
    """
    Get news from all categories
    
    This endpoint fetches news from multiple categories and returns them organized.
    It's what your frontend calls to populate the main news feed.
    
    Args:
        max_articles_per_category: Number of articles per category
        country: Country code for regional news
        
    Returns:
        AllNewsResponse: News articles organized by category
    """
    try:
        logger.info(f"Fetching all news categories with {max_articles_per_category} articles each")
        
        # Define the categories we want to fetch
        # These match what your frontend expects
        categories = [
            NewsCategory.POLITICS,
            NewsCategory.SPORTS, 
            NewsCategory.HEALTH,
            NewsCategory.BUSINESS,
            NewsCategory.TECHNOLOGY,
            NewsCategory.ENTERTAINMENT
        ]
        
        # Custom categories specific to your app
        custom_categories = [
            "local-trends",  # You'll need to implement this
            "weather"        # You'll need to implement this
        ]
        
        # Process all categories concurrently for better performance
        news_data = {}
        total_articles = 0
        
        # Process standard categories
        for category in categories:
            try:
                logger.info(f"Processing category: {category.value}")
                
                articles = await asyncio.to_thread(
                    news_processor.process_articles_for_category,
                    category.value,
                    max_articles_per_category
                )
                
                news_data[category.value] = articles
                total_articles += len(articles)
                
                logger.info(f"Processed {len(articles)} articles for {category.value}")
                
            except Exception as e:
                logger.error(f"Error processing category {category.value}: {str(e)}")
                # Continue with other categories even if one fails
                news_data[category.value] = []
        
        # Handle custom categories (you can implement these later)
        for custom_cat in custom_categories:
            try:
                if custom_cat == "local-trends":
                    # For now, use general news for local trends
                    articles = await asyncio.to_thread(
                        news_processor.process_articles_for_category,
                        "general",
                        2  # Fewer articles for custom categories
                    )
                    news_data[custom_cat] = articles[:2]  # Take only first 2
                    total_articles += len(news_data[custom_cat])
                    
                elif custom_cat == "weather":
                    # For now, return empty - you can implement weather API later
                    news_data[custom_cat] = []
                    
            except Exception as e:
                logger.error(f"Error processing custom category {custom_cat}: {str(e)}")
                news_data[custom_cat] = []
        
        categories_list = [cat.value for cat in categories] + custom_categories
        
        logger.info(f"Successfully processed all categories. Total articles: {total_articles}")
        
        return AllNewsResponse(
            success=True,
            message=f"Successfully fetched news from {len(categories_list)} categories",
            news=news_data,
            categories=categories_list,
            total_articles=total_articles,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error fetching all news: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "ALL_NEWS_FETCH_ERROR",
                "message": "Failed to fetch news from all categories",
                "details": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@router.post("/news/search", response_model=NewsResponse, status_code=status.HTTP_200_OK)
async def search_news(search_request: SearchRequest):
    """
    Search for news articles based on keywords
    
    This endpoint allows users to search for specific topics or keywords.
    It uses the News API's everything endpoint for broader search capabilities.
    
    Args:
        search_request: Search parameters (query, max_articles, category)
        
    Returns:
        NewsResponse: Search results matching the query
    """
    try:
        logger.info(f"Searching for: '{search_request.query}' (max: {search_request.max_articles})")
        
        # Use the search functionality from news processor
        search_results = await asyncio.to_thread(
            news_processor.search_articles,
            search_request.query,
            search_request.max_articles
        )
        
        if not search_results:
            logger.warning(f"No search results found for query: '{search_request.query}'")
            
            return NewsResponse(
                success=True,
                message=f"No articles found for '{search_request.query}'",
                articles=[],
                category="Search Results",
                total_count=0,
                timestamp=datetime.now().isoformat()
            )
        
        logger.info(f"Found {len(search_results)} articles for query: '{search_request.query}'")
        
        return NewsResponse(
            success=True,
            message=f"Found {len(search_results)} articles for '{search_request.query}'",
            articles=search_results,
            category="Search Results",
            total_count=len(search_results),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error searching for '{search_request.query}': {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "SEARCH_ERROR",
                "message": f"Failed to search for '{search_request.query}'",
                "details": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@router.get("/news/breaking", response_model=NewsResponse, status_code=status.HTTP_200_OK)
async def get_breaking_news(
    max_articles: int = Query(10, ge=1, le=20, description="Maximum number of breaking news articles")
):
    """
    Get breaking news articles
    
    Fetches the most recent and important news articles marked as breaking news.
    These are typically from the general category with high priority.
    
    Args:
        max_articles: Maximum number of breaking news articles to return
        
    Returns:
        NewsResponse: Breaking news articles
    """
    try:
        logger.info(f"Fetching {max_articles} breaking news articles")
        
        # Get general news and mark first few as breaking
        breaking_articles = await asyncio.to_thread(
            news_processor.process_articles_for_category,
            "general",
            max_articles
        )
        
        # Mark articles as breaking news
        for i, article in enumerate(breaking_articles):
            article['isBreaking'] = True
            article['category'] = 'Breaking News'
        
        logger.info(f"Successfully fetched {len(breaking_articles)} breaking news articles")
        
        return NewsResponse(
            success=True,
            message=f"Successfully fetched {len(breaking_articles)} breaking news articles",
            articles=breaking_articles,
            category="Breaking News",
            total_count=len(breaking_articles),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error fetching breaking news: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "BREAKING_NEWS_ERROR",
                "message": "Failed to fetch breaking news",
                "details": str(e),
                "timestamp": datetime.now().isoformat() 
            }
        )

@router.get("/news/categories", status_code=status.HTTP_200_OK)
async def get_available_categories():
    """
    Get list of available news categories
    
    Returns all supported news categories that can be used with other endpoints.
    Useful for frontend dropdown menus and validation.
    
    Returns:
        List of available categories with descriptions
    """
    try:
        categories = [
            {"value": "general", "label": "General", "description": "Top headlines and breaking news"},
            {"value": "politics", "label": "Politics", "description": "Political news and government updates"},
            {"value": "business", "label": "Business", "description": "Business, finance, and economic news"},
            {"value": "entertainment", "label": "Entertainment", "description": "Celebrity news and entertainment"},
            {"value": "health", "label": "Health", "description": "Health, medicine, and wellness news"},
            {"value": "science", "label": "Science", "description": "Scientific discoveries and research"},
            {"value": "sports", "label": "Sports", "description": "Sports news and updates"},
            {"value": "technology", "label": "Technology", "description": "Tech news and innovations"},
            {"value": "local-trends", "label": "Local Trends", "description": "Local and trending topics"},
            {"value": "weather", "label": "Weather", "description": "Weather updates and forecasts"}
        ]
        
        return {
            "success": True,
            "message": "Available news categories",
            "categories": categories,
            "total_count": len(categories),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting categories: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "CATEGORIES_ERROR",
                "message": "Failed to get available categories",
                "details": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

# Background task endpoint for testing
@router.post("/news/refresh", status_code=status.HTTP_202_ACCEPTED)
async def refresh_news_cache():
    """
    Refresh news cache (Background task)
    
    Triggers a background refresh of news articles for all categories.
    This can be called periodically to keep the news fresh.
    
    Returns:
        Acknowledgment that refresh has started
    """
    try:
        logger.info("News cache refresh requested")
        
        # In a real implementation, you might use Celery or similar for background tasks
        # For now, we'll just acknowledge the request
        
        return {
            "success": True,
            "message": "News cache refresh initiated",
            "status": "accepted",
            "timestamp": datetime.now().isoformat(),
            "note": "Refresh will complete in the background"
        }
        
    except Exception as e:
        logger.error(f"Error initiating news refresh: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "error": "REFRESH_ERROR",
                "message": "Failed to initiate news refresh",
                "details": str(e),
                "timestamp": datetime.now().isoformat()
        }
    )