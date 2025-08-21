# Backend/app/routes/search_routes.py
# Simplified search routes that work with your existing auth system

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import re
from urllib.parse import quote_plus
import json
import os

# Set up router and logging
router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)  # Make auth optional for now

# Constants for search functionality
MIN_SEARCH_QUERY_LENGTH = 2
MAX_SEARCH_RESULTS = 50
DEFAULT_SEARCH_RESULTS = 20

class SearchResult(BaseModel):
    """Model for search results"""
    success: bool
    query: str
    results_found: int
    source: str  # "cached" or "web"
    articles: List[Dict[str, Any]]
    web_search_suggestion: Optional[Dict[str, str]] = None
    timestamp: str

# Simple in-memory cache for processed articles
processed_articles_cache: List[Dict[str, Any]] = []

def update_articles_cache(articles: List[Dict[str, Any]]) -> None:
    """
    Update the in-memory cache with new processed articles
    
    Args:
        articles: List of processed article dictionaries to add to cache
    """
    global processed_articles_cache
    
    # Add timestamp to articles if not present
    for article in articles:
        if 'cached_at' not in article:
            article['cached_at'] = datetime.now().isoformat()
    
    # Add new articles to cache (avoiding duplicates by ID)
    existing_ids = {article.get('id') for article in processed_articles_cache}
    new_articles = [article for article in articles if article.get('id') not in existing_ids]
    
    processed_articles_cache.extend(new_articles)
    
    # Keep cache size reasonable - keep only last 1000 articles
    if len(processed_articles_cache) > 1000:
        processed_articles_cache = processed_articles_cache[-1000:]
    
    logger.info(f"📦 Cache updated: {len(new_articles)} new articles, {len(processed_articles_cache)} total")

def search_cached_articles(query: str, max_results: int = 20) -> List[Dict[str, Any]]:
    """
    Search through cached processed articles for matching content
    
    Args:
        query: Search query string
        max_results: Maximum number of results to return
        
    Returns:
        List of matching articles from cache
    """
    if not processed_articles_cache:
        logger.info("📦 No articles in cache to search")
        return []
    
    # Convert query to lowercase for case-insensitive search
    search_terms = query.lower().split()
    matching_articles = []
    
    logger.info(f"🔍 Searching {len(processed_articles_cache)} cached articles for: '{query}'")
    
    # Search through each cached article
    for article in processed_articles_cache:
        score = 0
        
        # Search in title (higher weight)
        title = article.get('title', '').lower()
        for term in search_terms:
            if term in title:
                score += 3  # Title matches get higher score
        
        # Search in summary/content (medium weight)
        summary = article.get('summary', '').lower()
        for term in search_terms:
            if term in summary:
                score += 2  # Summary matches get medium score
        
        # Search in category (lower weight)
        category = article.get('category', '').lower()
        for term in search_terms:
            if term in category:
                score += 1  # Category matches get lower score
        
        # If we found any matches, add to results
        if score > 0:
            article_copy = article.copy()
            article_copy['search_score'] = score
            matching_articles.append(article_copy)
    
    # Sort by relevance score (highest first)
    matching_articles.sort(key=lambda x: x['search_score'], reverse=True)
    
    # Return top results
    results = matching_articles[:max_results]
    logger.info(f"✅ Found {len(results)} cached articles matching '{query}'")
    
    return results

def generate_web_search_links(query: str, country_code: str = 'ZW') -> Dict[str, str]:
    """
    Generate web search URLs for different search engines
    
    Args:
        query: Search query string
        country_code: User's country code for localized search
        
    Returns:
        Dictionary with URLs for different search engines
    """
    # Country mapping for better search context
    country_map = {
        'ZW': 'Zimbabwe', 'KE': 'Kenya', 'GH': 'Ghana', 'RW': 'Rwanda',
        'CD': 'Democratic Republic of Congo', 'ZA': 'South Africa', 'BI': 'Burundi'
    }
    country_name = country_map.get(country_code, country_code)
    
    # Enhance query with country context for better results
    enhanced_query = f"{query} {country_name} news"
    encoded_query = quote_plus(enhanced_query)
    
    return {
        "message": f"No cached articles found for '{query}'. Try these web searches:",
        "google_url": f"https://www.google.com/search?q={encoded_query}&tbm=nws",
        "bing_url": f"https://www.bing.com/news/search?q={encoded_query}",
        "duckduckgo_url": f"https://duckduckgo.com/?q={encoded_query}&iar=news",
        "country_context": country_name,
        "tip": f"Search results will be localized to {country_name}"
    }

def get_user_country_simple(credentials: Optional[HTTPAuthorizationCredentials]) -> str:
    """
    Simple function to get user country with fallback to default
    
    Args:
        credentials: Optional HTTP Bearer token credentials
        
    Returns:
        User's country code or default 'ZW'
    """
    try:
        if not credentials or not credentials.credentials:
            logger.info("📍 No credentials provided, using default country: ZW")
            return 'ZW'
        
        # Try to load user data from the simple JSON database
        if os.path.exists("users_db.json"):
            with open("users_db.json", 'r') as f:
                db_data = json.load(f)
            
            # Find active session
            token = credentials.credentials
            for session in db_data.get("sessions", []):
                if session.get("session_id") == token and session.get("is_active"):
                    # Find user
                    user_id = session.get("user_id")
                    for user in db_data.get("users", []):
                        if user.get("id") == user_id:
                            country = user.get("country_of_interest", "ZW")
                            logger.info(f"📍 User country found: {country}")
                            return country
        
        # Fallback to default
        logger.info("📍 Could not determine user country, using default: ZW")
        return 'ZW'
        
    except Exception as e:
        logger.warning(f"⚠️  Error getting user country: {e}, using default: ZW")
        return 'ZW'

@router.get("/search", response_model=SearchResult)
async def search_articles(
    q: str = Query(..., description="Search query - minimum 2 characters"),
    max_results: int = Query(DEFAULT_SEARCH_RESULTS, ge=1, le=MAX_SEARCH_RESULTS),
    search_web: bool = Query(False, description="Force web search instead of cached search"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """
    Search endpoint that searches cached articles first, then suggests web search
    
    Args:
        q: Search query string (minimum 2 characters)
        max_results: Maximum number of results to return (1-50)
        search_web: If True, skip cached search and go straight to web search
        credentials: Optional user authentication token
        
    Returns:
        SearchResult containing either cached articles or web search suggestions
    """
    try:
        # Get user country (with fallback to default)
        user_country = get_user_country_simple(credentials)
        
        logger.info(f"🔍 Search request: '{q}' (country: {user_country})")
        
        # Validate search query
        if len(q.strip()) < MIN_SEARCH_QUERY_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Search query must be at least {MIN_SEARCH_QUERY_LENGTH} characters long"
            )
        
        # Clean the search query
        clean_query = q.strip()
        
        # If not forcing web search, try cached articles first
        if not search_web:
            cached_results = search_cached_articles(clean_query, max_results)
            
            # If we found cached results, return them
            if cached_results:
                logger.info(f"✅ Returning {len(cached_results)} cached results for '{clean_query}'")
                
                return SearchResult(
                    success=True,
                    query=clean_query,
                    results_found=len(cached_results),
                    source="cached",
                    articles=cached_results,
                    web_search_suggestion=None,  # No need for web search
                    timestamp=datetime.now().isoformat()
                )
        
        # No cached results found OR web search was forced
        logger.info(f"📡 No cached results for '{clean_query}' - generating web search suggestions")
        
        web_suggestions = generate_web_search_links(clean_query, user_country)
        
        return SearchResult(
            success=True,
            query=clean_query,
            results_found=0,
            source="web_suggestion",
            articles=[],  # No cached articles found
            web_search_suggestion=web_suggestions,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException:
        # Re-raise validation errors (400 status codes)
        raise
    except Exception as search_error:
        logger.error(f"❌ Search error for '{q}': {search_error}")
        raise HTTPException(
            status_code=500,
            detail=f"Search failed for '{q}'. Please try again later."
        )

@router.post("/cache/update")
async def update_search_cache(
    articles: List[Dict[str, Any]]
):
    """
    Update the search cache with new processed articles
    Simplified version without strict authentication requirements
    
    Args:
        articles: List of processed article dictionaries to add to cache
        
    Returns:
        Success confirmation with cache statistics
    """
    try:
        # Update the cache with new articles
        update_articles_cache(articles)
        
        logger.info(f"📦 Cache updated: {len(articles)} articles added")
        
        return {
            "success": True,
            "message": f"Successfully added {len(articles)} articles to search cache",
            "total_cached_articles": len(processed_articles_cache),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Cache update error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update search cache"
        )

@router.get("/cache/stats")
async def get_cache_statistics():
    """
    Get statistics about the current search cache
    
    Returns:
        Cache statistics and information
    """
    try:
        # Calculate cache statistics
        total_articles = len(processed_articles_cache)
        categories = {}
        
        # Count articles by category
        for article in processed_articles_cache:
            category = article.get('category', 'Unknown')
            categories[category] = categories.get(category, 0) + 1
        
        # Find newest and oldest articles
        timestamps = [article.get('cached_at') for article in processed_articles_cache if article.get('cached_at')]
        newest = max(timestamps) if timestamps else None
        oldest = min(timestamps) if timestamps else None
        
        logger.info(f"📊 Cache stats requested")
        
        return {
            "success": True,
            "cache_statistics": {
                "total_articles": total_articles,
                "categories": categories,
                "newest_article": newest,
                "oldest_article": oldest,
                "cache_size_mb": len(str(processed_articles_cache)) / (1024 * 1024)  # Rough estimate
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Cache stats error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get cache statistics"
        )