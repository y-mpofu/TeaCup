# Backend/app/routes/news_routes.py
# COMPLETE: All news routes including missing individual category endpoints

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, List
import asyncio
from datetime import datetime
import logging
max_articles_per_section = 18  # Import our config for max articles

# Import our REAL news service
from app.services.news_service import news_service

router = APIRouter()

# Set up logging
logger = logging.getLogger(__name__)

# FIXED: Add all the individual category endpoints that frontend is calling
@router.get("/news/{category}")
async def get_news_by_category(
    category: str,
    max_articles: Optional[int] = Query(max_articles_per_section, ge=1, le=20)
):
    """
    Get news for a specific category
    This is the endpoint your frontend is calling: /api/news/politics, /api/news/sports, etc.
    """
    try:
        logger.info(f"📰 API Request: Getting {category} news (max {max_articles})")
        
        # Validate category
        valid_categories = [
            'politics', 'sports', 'health', 'business', 'technology',
            'local-trends', 'weather', 'entertainment', 'education'
        ]
        
        if category not in valid_categories:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid category '{category}'. Valid categories: {', '.join(valid_categories)}"
            )
        
        # Fetch news for the specific category
        articles = await news_service.get_news_for_category(category, max_articles)
        
        # Convert articles to dict format
        articles_dict = []
        for article in articles:
            if hasattr(article, '__dict__'):  # ProcessedArticle object
                article_dict = {
                    'id': article.id,
                    'title': article.title,
                    'summary': article.summary,
                    'category': article.category,
                    'timestamp': article.timestamp,
                    'readTime': article.readTime,
                    'isBreaking': article.isBreaking,
                    'imageUrl': article.imageUrl,
                    'sourceUrl': article.sourceUrl,
                    'source': article.source,
                    'linked_sources': article.linked_sources
                }
                articles_dict.append(article_dict)
        
        logger.info(f"✅ Successfully fetched {len(articles_dict)} {category} articles")
        
        return {
            "success": True,
            "articles": articles_dict,
            "category": category.title(),  # Format for frontend
            "count": len(articles_dict),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"❌ Error fetching {category} news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch {category} news: {str(e)}")

@router.get("/news/all")
async def get_all_news(
    max_per_category: Optional[int] = Query(3, ge=1, le=10)
):
    """
    Get real news for all categories
    COMPLETELY REPLACED: Now processes multiple categories concurrently
    """
    try:
        logger.info(f"📰 API Request: Getting REAL news for ALL categories (max {max_per_category} per category)")
        
        # All available categories
        categories = [
            'politics', 'sports', 'health', 'business', 'technology',
            'local-trends', 'weather', 'entertainment', 'education'
        ]
        
        # Function to fetch news for a single category
        async def fetch_category_news(category: str):
            try:
                logger.info(f"🔄 Processing {category}...")
                articles = await news_service.get_news_for_category(category, max_per_category)
                return category, articles
            except Exception as e:
                logger.error(f"❌ Error fetching {category}: {str(e)}")
                return category, []
        
        # Process categories concurrently (but limit concurrency to avoid overwhelming APIs)
        semaphore = asyncio.Semaphore(3)  # Only 3 concurrent requests
        
        async def limited_fetch(category):
            async with semaphore:
                return await fetch_category_news(category)
        
        # Execute all category fetches
        tasks = [limited_fetch(cat) for cat in categories]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        all_news = {}
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"❌ Category fetch failed: {result}")
                continue
                
            category, articles = result
            
            # Convert articles to dict format
            articles_dict = []
            for article in articles:
                if hasattr(article, '__dict__'):  # ProcessedArticle object
                    article_dict = {
                        'id': article.id,
                        'title': article.title,
                        'summary': article.summary,
                        'category': article.category,
                        'timestamp': article.timestamp,
                        'readTime': article.readTime,
                        'isBreaking': article.isBreaking,
                        'imageUrl': article.imageUrl,
                        'sourceUrl': article.sourceUrl,
                        'source': article.source,
                        'linked_sources': article.linked_sources
                    }
                    articles_dict.append(article_dict)
            
            all_news[category] = articles_dict
        
        total_articles = sum(len(articles) for articles in all_news.values())
        
        logger.info(f"✅ Successfully processed ALL categories: {total_articles} total REAL articles")
        
        return {
            "success": True,
            "news_by_category": all_news,
            "total_articles": total_articles,
            "categories_count": len(all_news),
            "data_source": "real_news",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching ALL news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch all news: {str(e)}")

@router.get("/news/breaking")
async def get_breaking_news(
    max_articles: Optional[int] = Query(10, ge=1, le=30)
):
    """
    Get breaking news articles from all categories
    """
    try:
        logger.info(f"🚨 API Request: Getting breaking news (max {max_articles})")
        
        # Get articles from multiple categories and filter for breaking news
        categories = ['politics', 'sports', 'health', 'business', 'technology']
        all_breaking = []
        
        for category in categories:
            try:
                articles = await news_service.get_news_for_category(category, 5)
                # Filter for breaking news only
                breaking_articles = [article for article in articles if getattr(article, 'isBreaking', False)]
                all_breaking.extend(breaking_articles)
            except Exception as e:
                logger.warning(f"⚠️  Error fetching breaking news from {category}: {e}")
                continue
        
        # Sort by timestamp and limit results
        all_breaking.sort(key=lambda x: x.timestamp, reverse=True)
        breaking_articles = all_breaking[:max_articles]
        
        # Convert to dict format
        articles_dict = []
        for article in breaking_articles:
            if hasattr(article, '__dict__'):
                article_dict = {
                    'id': article.id,
                    'title': article.title,
                    'summary': article.summary,
                    'category': article.category,
                    'timestamp': article.timestamp,
                    'readTime': article.readTime,
                    'isBreaking': True,  # All are breaking news
                    'imageUrl': article.imageUrl,
                    'sourceUrl': article.sourceUrl,
                    'source': article.source,
                    'linked_sources': article.linked_sources
                }
                articles_dict.append(article_dict)
        
        logger.info(f"✅ Successfully fetched {len(articles_dict)} breaking news articles")
        
        return {
            "success": True,
            "articles": articles_dict,
            "count": len(articles_dict),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching breaking news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch breaking news: {str(e)}")

@router.get("/news/search")
async def search_news(
    q: str = Query(..., description="Search query"),
    max_articles: Optional[int] = Query(20, ge=1, le=50)
):
    """
    Search for news articles by keyword
    """
    try:
        logger.info(f"🔍 API Request: Searching for '{q}' (max {max_articles})")
        
        if len(q.strip()) < 2:
            raise HTTPException(status_code=400, detail="Search query must be at least 2 characters long")
        
        # Use the news service search functionality
        search_results = await news_service.search_news(q, max_articles)
        
        logger.info(f"✅ Search returned {len(search_results)} results for '{q}'")
        
        return {
            "success": True,
            "articles": search_results,
            "query": q,
            "count": len(search_results),
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"❌ Error searching for '{q}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")