# Backend/app/services/cache_integration_service.py
# Service to automatically populate search cache when articles are processed

import logging
from typing import List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class CacheIntegrationService:
    """
    Service to automatically populate the search cache when new articles are processed
    This ensures that search results are always up-to-date with the latest news
    """
    
    def __init__(self):
        """Initialize the cache integration service"""
        self.cache_update_enabled = True
        logger.info("📦 Cache Integration Service initialized")
    
    async def update_search_cache_from_news(self, processed_articles, category: str, country_code: str) -> bool:
        """
        Update search cache with newly processed articles
        This should be called by news_service after processing articles
        
        Args:
            processed_articles: List of ProcessedArticle objects from news_service
            category: News category that was processed
            country_code: Country code for the articles
            
        Returns:
            Boolean indicating success/failure of cache update
        """
        try:
            if not self.cache_update_enabled:
                return True
                
            # Import the search cache update function
            from app.routes.search_routes import update_articles_cache
            
            # Convert ProcessedArticle objects to dictionaries for cache storage
            articles_for_cache = []
            
            for article in processed_articles:
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
                        'linked_sources': article.linked_sources,
                        'country_code': country_code,  # Add country context for better search
                        'processed_at': datetime.now().isoformat(),
                        'search_enabled': True  # Flag for search eligibility
                    }
                    articles_for_cache.append(article_dict)
                elif isinstance(article, dict):  # Already a dictionary
                    # Add missing fields if needed
                    article_copy = article.copy()
                    article_copy.update({
                        'country_code': country_code,
                        'processed_at': datetime.now().isoformat(),
                        'search_enabled': True
                    })
                    articles_for_cache.append(article_copy)
            
            # Update the search cache
            if articles_for_cache:
                update_articles_cache(articles_for_cache)
                
                logger.info(
                    f"✅ Search cache updated: {len(articles_for_cache)} {category} "
                    f"articles from {country_code} added to cache"
                )
                return True
            else:
                logger.warning(f"⚠️  No articles to add to cache for {category} in {country_code}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to update search cache for {category} in {country_code}: {e}")
            return False
    
    def enable_cache_updates(self) -> None:
        """Enable automatic cache updates"""
        self.cache_update_enabled = True
        logger.info("📦 Search cache updates enabled")
    
    def disable_cache_updates(self) -> None:
        """Disable automatic cache updates (for maintenance)"""
        self.cache_update_enabled = False
        logger.info("📦 Search cache updates disabled")

# Global instance for use across the application
cache_integration_service = CacheIntegrationService()