# Backend/app/models/__init__.py
# Models package initialization
# This makes the models directory a Python package and provides easy imports

"""
Models package for TeaCup Backend

This package contains all data models used throughout the application:
- api_requests: Pydantic models for FastAPI request validation
- api_responses: Pydantic models for FastAPI response formatting
- (future) database models for data persistence
- (future) user models for authentication
"""

# Import all the models we want to make available when someone imports from models
from .api_requests import (
    SearchRequest,
    CategoryNewsRequest,
    AllNewsRequest,
    RefreshRequest,
    NewsCategory,
    CountryCode,
    QueryParameterValidator,
    PaginationRequest,
    SortingRequest
)

from .api_responses import (
    NewsArticleResponse,
    NewsResponse,
    AllNewsResponse,
    HealthResponse,
    SystemStatusResponse,
    ConfigurationResponse,
    ErrorResponse
)

# Make these available when someone does: from models import NewsCategory
__all__ = [
    # Request models
    'SearchRequest',
    'CategoryNewsRequest',
    'AllNewsRequest',
    'RefreshRequest',
    'PaginationRequest',
    'SortingRequest',
    
    # Response models
    'NewsArticleResponse',
    'NewsResponse',
    'AllNewsResponse',
    'HealthResponse',
    'SystemStatusResponse',
    'ConfigurationResponse',
    'ErrorResponse',
    
    # Enums
    'NewsCategory',
    'CountryCode',
    
    # Utilities
    'QueryParameterValidator'
]

# Version information
__version__ = "1.0.0"

# Package metadata
__author__ = "TeaCup Development Team"
__description__ = "Data models for TeaCup news backend API"

# You can add convenience functions here if needed
def get_valid_categories():
    """
    Get list of all valid news categories
    Convenience function for route handlers
    """
    return [category.value for category in NewsCategory]

def get_valid_countries():
    """
    Get list of all valid country codes
    Convenience function for route handlers
    """
    return [country.value for country in CountryCode]

def validate_news_request(category: str, max_articles: int = 5, country: str = "us"):
    """
    Convenience function to validate common news request parameters
    
    Args:
        category: News category string
        max_articles: Maximum number of articles
        country: Country code string
    
    Returns:
        dict: Validated parameters
    
    Raises:
        ValueError: If any parameter is invalid
    """
    # Validate category
    validated_category = QueryParameterValidator.validate_category(category)
    
    # Validate max_articles
    validated_max_articles = QueryParameterValidator.validate_max_articles(max_articles)
    
    # Validate country
    validated_country = QueryParameterValidator.validate_country_code(country)
    
    return {
        'category': validated_category,
        'max_articles': validated_max_articles,
        'country': validated_country
    }