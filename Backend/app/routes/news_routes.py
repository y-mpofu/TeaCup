# Backend/app/routes/news_routes.py
# News API endpoints that serve your mock data

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import asyncio
from datetime import datetime

# Import our mock data service
from app.data.mock_data import MockNewsData

router = APIRouter()

# Initialize mock data service
mock_data = MockNewsData()

@router.get("/news/{category}")
async def get_news_by_category(
    category: str,
    max_articles: Optional[int] = Query(6, ge=1, le=50)
):
    """Get news articles for a specific category"""
    try:
        print(f"📰 API Request: Fetching {category} news (max: {max_articles})")
        
        # Simulate network delay
        await asyncio.sleep(0.2)
        
        # Get articles for the category
        articles = await mock_data.get_articles_by_category(category, max_articles)
        
        if not articles:
            return {
                "success": True,
                "articles": [],
                "category": category,
                "count": 0,
                "message": f"No articles available for category: {category}",
                "timestamp": datetime.now().isoformat()
            }
        
        print(f"✅ Successfully returned {len(articles)} articles for {category}")
        
        return {
            "success": True,
            "articles": articles,
            "category": category,
            "count": len(articles),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error fetching {category} news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch {category} news: {str(e)}")

@router.get("/news/all")
async def get_all_news(
    max_per_category: Optional[int] = Query(6, ge=1, le=20)
):
    """Get news for all categories at once"""
    try:
        print(f"📰 API Request: Fetching all news (max {max_per_category} per category)")
        
        await asyncio.sleep(0.5)  # Simulate processing time
        
        all_news = await mock_data.get_all_news(max_per_category)
        total_articles = sum(len(articles) for articles in all_news.values())
        
        print(f"✅ Successfully returned {total_articles} total articles across {len(all_news)} categories")
        
        return {
            "success": True,
            "news_by_category": all_news,
            "total_articles": total_articles,
            "categories_count": len(all_news),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error fetching all news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch all news: {str(e)}")

@router.get("/news/breaking")
async def get_breaking_news(
    max_articles: Optional[int] = Query(10, ge=1, le=50)
):
    """Get breaking news articles"""
    try:
        print(f"🚨 API Request: Fetching breaking news (max: {max_articles})")
        
        await asyncio.sleep(0.1)
        
        breaking_articles = await mock_data.get_breaking_news(max_articles)
        
        print(f"✅ Successfully returned {len(breaking_articles)} breaking news articles")
        
        return {
            "success": True,
            "articles": breaking_articles,
            "count": len(breaking_articles),
            "type": "breaking_news",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error fetching breaking news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch breaking news: {str(e)}")

@router.get("/news/search")
async def search_news(
    q: str = Query(..., min_length=1),
    max_articles: Optional[int] = Query(20, ge=1, le=100)
):
    """Search for news articles by keyword"""
    try:
        print(f"🔍 API Request: Searching for '{q}' (max: {max_articles})")
        
        await asyncio.sleep(0.3)
        
        search_results = await mock_data.search_articles(q, max_articles)
        
        print(f"✅ Search returned {len(search_results)} results for '{q}'")
        
        return {
            "success": True,
            "articles": search_results,
            "query": q,
            "count": len(search_results),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error searching for '{q}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")