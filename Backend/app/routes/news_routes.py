# Backend/app/routes/news_routes.py
# Add this refresh endpoint to your existing news_routes.py file

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict, List
import asyncio
from datetime import datetime
import logging
from pydantic import BaseModel

# Import our news service
from app.services.news_service import news_service

# Request model for refresh endpoint
class RefreshRequest(BaseModel):
    timestamp: str
    force_refresh: bool = True

# Add this new endpoint to your existing router
@router.post("/news/refresh")
async def refresh_news_data(request: RefreshRequest):
    """
    Trigger backend to fetch fresh news data from external sources
    This tells the news service to refresh all categories with latest data
    """
    try:
        logger.info("🔄 API Request: Backend news refresh requested")
        start_time = datetime.now()
        
        # List of categories to refresh
        categories_to_refresh = [
            'politics', 'sports', 'health', 'business', 'technology',
            'local-trends', 'weather', 'entertainment', 'education'
        ]
        
        refreshed_categories = []
        total_new_articles = 0
        
        logger.info(f"📰 Refreshing {len(categories_to_refresh)} news categories...")
        
        # Refresh each category
        for category in categories_to_refresh:
            try:
                logger.info(f"🔄 Refreshing {category} news...")
                
                # Call news service to fetch fresh data for this category
                # This will force the service to get new data from external APIs
                articles = await news_service.get_news_by_category(
                    category=category, 
                    max_articles=18,  # Get up to 18 fresh articles
                    force_refresh=True  # Force fresh data, ignore any service cache
                )
                
                refreshed_categories.append(category)
                total_new_articles += len(articles)
                
                logger.info(f"✅ Refreshed {category}: {len(articles)} articles")
                
                # Small delay between categories to avoid overwhelming APIs
                await asyncio.sleep(0.5)
                
            except Exception as category_error:
                logger.error(f"❌ Failed to refresh {category}: {str(category_error)}")
                # Continue with other categories even if one fails
                continue
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        success_message = f"Successfully refreshed {len(refreshed_categories)} categories with {total_new_articles} total articles in {duration:.1f}s"
        
        logger.info(f"🎉 Backend refresh completed: {success_message}")
        
        return {
            "success": True,
            "message": success_message,
            "timestamp": end_time.isoformat(),
            "categories_refreshed": refreshed_categories,
            "total_new_articles": total_new_articles,
            "duration_seconds": round(duration, 1)
        }
        
    except Exception as e:
        error_msg = f"Backend news refresh failed: {str(e)}"
        logger.error(f"❌ {error_msg}")
        
        return {
            "success": False,
            "message": error_msg,
            "timestamp": datetime.now().isoformat(),
            "categories_refreshed": [],
            "total_new_articles": 0
        }