# Backend/app/models/api_requests.py
# Pydantic models for FastAPI API requests
# These define and validate the structure of data that your API receives

from pydantic import BaseModel, Field, validator
from typing import Optional
from enum import Enum

# ============================================
# ENUMS FOR VALIDATION
# ============================================

class NewsCategory(str, Enum):
    """
    Valid news categories that your API accepts
    This ensures only valid categories are used in requests
    """
    GENERAL = "general"
    POLITICS = "politics"
    BUSINESS = "business"
    ENTERTAINMENT = "entertainment"
    HEALTH = "health"
    SCIENCE = "science"
    SPORTS = "sports"
    TECHNOLOGY = "technology"
    
    # Custom categories specific to your TeaCup app
    LOCAL_TRENDS = "local-trends"
    WEATHER = "weather"

class CountryCode(str, Enum):
    """
    Valid country codes for news fetching
    Based on News API supported countries
    """
    US = "us"          # United States
    ZW = "zw"          # Zimbabwe (your main focus)
    GB = "gb"          # United Kingdom
    CA = "ca"          # Canada
    AU = "au"          # Australia
    ZA = "za"          # South Africa
    KE = "ke"          # Kenya
    NG = "ng"          # Nigeria
    GH = "gh"          # Ghana
    UG = "ug"          # Uganda
    TZ = "tz"          # Tanzania
    # Add more as needed

# ============================================
# REQUEST MODELS
# ============================================

class SearchRequest(BaseModel):
    """
    Search request model for POST /api/news/search endpoint
    Allows users to search for specific news topics
    """
    query: str = Field(
        ..., 
        min_length=1, 
        max_length=200, 
        description="Search query (1-200 characters)"
    )
    max_articles: Optional[int] = Field(
        10, 
        ge=1, 
        le=50, 
        description="Maximum number of articles to return (1-50)"
    )
    category: Optional[str] = Field(
        None, 
        description="Specific category to search within (optional)"
    )

    @validator('query')
    def validate_query(cls, v):
        """
        Validate and clean the search query
        """
        if not v or not v.strip():
            raise ValueError('Search query cannot be empty')
        
        # Remove extra whitespace
        v = ' '.join(v.split())
        
        # Basic validation - no special characters that could cause issues
        forbidden_chars = ['<', '>', '{', '}', '[', ']']
        if any(char in v for char in forbidden_chars):
            raise ValueError('Search query contains invalid characters')
        
        return v

    class Config:
        schema_extra = {
            "example": {
                "query": "artificial intelligence in healthcare",
                "max_articles": 10,
                "category": "technology"
            }
        }

class CategoryNewsRequest(BaseModel):
    """
    Request model for category-specific news
    Used as query parameters for GET /api/news/{category}
    """
    max_articles: Optional[int] = Field(
        5, 
        ge=1, 
        le=20, 
        description="Maximum number of articles to return (1-20)"
    )
    country: Optional[CountryCode] = Field(
        CountryCode.US, 
        description="Country code for regional news"
    )

    class Config:
        schema_extra = {
            "example": {
                "max_articles": 5,
                "country": "zw"
            }
        }

class AllNewsRequest(BaseModel):
    """
    Request model for getting all news categories
    Used as query parameters for GET /api/news/all
    """
    max_articles_per_category: Optional[int] = Field(
        5, 
        ge=1, 
        le=10, 
        description="Maximum number of articles per category (1-10)"
    )
    country: Optional[CountryCode] = Field(
        CountryCode.US, 
        description="Country code for regional news"
    )
    categories: Optional[str] = Field(
        None,
        description="Comma-separated list of categories to include (optional)"
    )

    @validator('categories')
    def validate_categories(cls, v):
        """
        Validate the categories list if provided
        """
        if v is None:
            return v
        
        # Split by comma and validate each category
        category_list = [cat.strip().lower() for cat in v.split(',')]
        valid_categories = [cat.value for cat in NewsCategory]
        
        invalid_categories = [cat for cat in category_list if cat not in valid_categories]
        if invalid_categories:
            raise ValueError(f'Invalid categories: {invalid_categories}. Valid options: {valid_categories}')
        
        return ','.join(category_list)

    class Config:
        schema_extra = {
            "example": {
                "max_articles_per_category": 3,
                "country": "zw",
                "categories": "politics,sports,health,business"
            }
        }

class RefreshRequest(BaseModel):
    """
    Request model for refreshing news cache
    Used by POST /api/news/refresh endpoint
    """
    categories: Optional[str] = Field(
        None,
        description="Specific categories to refresh (comma-separated), or all if not specified"
    )
    force: Optional[bool] = Field(
        False,
        description="Force refresh even if cache is still valid"
    )

    class Config:
        schema_extra = {
            "example": {
                "categories": "politics,sports",
                "force": False
            }
        }

# ============================================
# VALIDATION HELPERS
# ============================================

class QueryParameterValidator:
    """
    Helper class for validating query parameters
    Can be used in route handlers for additional validation
    """
    
    @staticmethod
    def validate_category(category: str) -> str:
        """
        Validate that a category string is valid
        """
        try:
            # Try to match with enum
            return NewsCategory(category.lower()).value
        except ValueError:
            valid_categories = [cat.value for cat in NewsCategory]
            raise ValueError(f"Invalid category '{category}'. Valid options: {valid_categories}")
    
    @staticmethod
    def validate_country_code(country: str) -> str:
        """
        Validate that a country code is valid
        """
        try:
            return CountryCode(country.lower()).value
        except ValueError:
            valid_countries = [country.value for country in CountryCode]
            raise ValueError(f"Invalid country code '{country}'. Valid options: {valid_countries}")
    
    @staticmethod
    def validate_max_articles(max_articles: int, min_val: int = 1, max_val: int = 50) -> int:
        """
        Validate max_articles parameter
        """
        if max_articles < min_val:
            raise ValueError(f"max_articles must be at least {min_val}")
        if max_articles > max_val:
            raise ValueError(f"max_articles cannot exceed {max_val}")
        return max_articles

# ============================================
# UTILITY MODELS
# ============================================

class PaginationRequest(BaseModel):
    """
    Basic pagination model for future use
    """
    page: Optional[int] = Field(1, ge=1, description="Page number (starting from 1)")
    page_size: Optional[int] = Field(10, ge=1, le=100, description="Number of items per page")
    
    @validator('page_size')
    def validate_page_size(cls, v):
        if v > 100:
            raise ValueError('Page size cannot exceed 100 items')
        return v

class SortingRequest(BaseModel):
    """
    Sorting options for future use
    """
    sort_by: Optional[str] = Field("timestamp", description="Field to sort by")
    sort_order: Optional[str] = Field("desc", description="Sort order: 'asc' or 'desc'")
    
    @validator('sort_order')
    def validate_sort_order(cls, v):
        if v.lower() not in ['asc', 'desc']:
            raise ValueError("sort_order must be 'asc' or 'desc'")
        return v.lower()
    
    @validator('sort_by')
    def validate_sort_by(cls, v):
        valid_fields = ['timestamp', 'title', 'category', 'source']
        if v not in valid_fields:
            raise ValueError(f"sort_by must be one of: {valid_fields}")
        return v