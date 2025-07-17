# Backend/app/routes/news_routes.py
# COMPLETELY REPLACED: Now uses only real news service (no more mock data)

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, List
import asyncio
from datetime import datetime
import logging

# Import our REAL news service (completely replacing mock data)
from app.services.news_service import news_service

router = APIRouter()

# Set up logging
logger = logging.getLogger(__name__)

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