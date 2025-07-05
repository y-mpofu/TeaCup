# Backend/app/models/api_responses.py
# Pydantic models for FastAPI API responses
# These define the structure of data that your API sends back to the frontend

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class NewsArticleResponse(BaseModel):
    """
    News article response model that matches your frontend NewsArticle interface
    This ensures your backend sends exactly what your frontend expects
    """
    id: str = Field(..., description="Unique identifier for the article")
    title: str = Field(..., description="Article headline")
    summary: str = Field(..., description="AI-generated summary of the article")
    category: str = Field(..., description="News category (Politics, Sports, etc.)")
    timestamp: str = Field(..., description="When the article was published (ISO format)")
    imageUrl: Optional[str] = Field(None, description="URL of the article's main image")
    readTime: str = Field(..., description="Estimated reading time (e.g., '3 min read')")
    isBreaking: Optional[bool] = Field(False, description="Whether this is breaking news")
    sourceUrl: Optional[str] = Field(None, description="Original article URL")
    source: Optional[str] = Field(None, description="News source name")

    class Config:
        # Example for automatic API documentation
        schema_extra = {
            "example": {
                "id": "politics-1-1704067200",
                "title": "Major Political Development Unfolds",
                "summary": "A comprehensive AI-generated summary of the latest political news that captures the key points and makes readers want to learn more.",
                "category": "Politics",
                "timestamp": "2024-01-01T12:00:00Z",
                "imageUrl": "https://example.com/image.jpg",
                "readTime": "3 min read",
                "isBreaking": True,
                "sourceUrl": "https://example.com/article",
                "source": "Example News"
            }
        }

class NewsResponse(BaseModel):
    """
    Standard response wrapper for single-category news endpoints
    Used by endpoints like GET /api/news/{category}
    """
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Human-readable status message")
    articles: List[NewsArticleResponse] = Field(..., description="List of news articles")
    category: Optional[str] = Field(None, description="Category of news (if specific)")
    total_count: int = Field(..., description="Total number of articles returned")
    timestamp: str = Field(..., description="When this response was generated")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Successfully fetched 5 politics articles",
                "articles": [],  # Would contain NewsArticleResponse objects
                "category": "politics",
                "total_count": 5,
                "timestamp": "2024-01-01T12:00:00Z"
            }
        }

class AllNewsResponse(BaseModel):
    """
    Response model for the GET /api/news/all endpoint
    Returns news organized by category - what your MainBody.tsx calls
    """
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Human-readable status message")
    news: Dict[str, List[NewsArticleResponse]] = Field(..., description="News articles organized by category")
    categories: List[str] = Field(..., description="List of available categories")
    total_articles: int = Field(..., description="Total number of articles across all categories")
    timestamp: str = Field(..., description="When this response was generated")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Successfully fetched news from 8 categories",
                "news": {
                    "politics": [],  # Would contain NewsArticleResponse objects
                    "sports": [],
                    "health": [],
                    "business": [],
                    "technology": [],
                    "local-trends": [],
                    "entertainment": [],
                    "weather": []
                },
                "categories": ["politics", "sports", "health", "business", "technology", "local-trends", "entertainment", "weather"],
                "total_articles": 40,
                "timestamp": "2024-01-01T12:00:00Z"
            }
        }

class HealthResponse(BaseModel):
    """
    Basic health check response
    Used by GET /api/health endpoint
    """
    status: str = Field(..., description="Health status (healthy/error)")
    message: str = Field(..., description="Status message")
    timestamp: str = Field(..., description="Timestamp of health check")
    version: str = Field(..., description="API version")

    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "message": "TeaCup Backend is running smoothly",
                "timestamp": "2024-01-01T12:00:00Z",
                "version": "1.0.0"
            }
        }

class SystemStatusResponse(BaseModel):
    """
    Detailed system status response
    Used by GET /api/status endpoint for monitoring
    """
    status: str = Field(..., description="Overall system status")
    timestamp: str = Field(..., description="Status check timestamp")
    system_info: Dict[str, Any] = Field(..., description="System resource information")
    environment: Dict[str, bool] = Field(..., description="Environment configuration status")
    services: Dict[str, str] = Field(..., description="Service status information")

    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "timestamp": "2024-01-01T12:00:00Z",
                "system_info": {
                    "python_version": "3.11.0",
                    "cpu_usage_percent": 15.2,
                    "memory_usage_percent": 45.8,
                    "disk_usage_percent": 67.3,
                    "available_memory_gb": 4.2
                },
                "environment": {
                    "news_api_configured": True,
                    "openai_configured": True,
                    "debug_mode": True
                },
                "services": {
                    "news_scraping": "operational",
                    "gpt_summarization": "operational",
                    "news_api": "operational"
                }
            }
        }

class ConfigurationResponse(BaseModel):
    """
    Configuration check response
    Used by GET /api/config endpoint to validate setup
    """
    status: str = Field(..., description="Configuration check status")
    configuration_health: str = Field(..., description="Overall config health (complete/partial)")
    configured_services: str = Field(..., description="Number of configured services (e.g., '2/2')")
    details: Dict[str, Any] = Field(..., description="Detailed configuration status")
    recommendations: List[Dict[str, str]] = Field(..., description="Setup recommendations")
    timestamp: str = Field(..., description="Configuration check timestamp")

    class Config:
        schema_extra = {
            "example": {
                "status": "success",
                "configuration_health": "complete",
                "configured_services": "2/2",
                "details": {
                    "news_api_key": {
                        "configured": True,
                        "length": 32,
                        "masked_value": "abcd****wxyz"
                    },
                    "openai_api_key": {
                        "configured": True,
                        "length": 56,
                        "masked_value": "sk-****1234"
                    }
                },
                "recommendations": [],
                "timestamp": "2024-01-01T12:00:00Z"
            }
        }

class ErrorResponse(BaseModel):
    """
    Standard error response format
    Used when something goes wrong
    """
    success: bool = Field(False, description="Always false for error responses")
    error: str = Field(..., description="Error type or code")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[str] = Field(None, description="Additional error details (if available)")
    timestamp: str = Field(..., description="When the error occurred")

    class Config:
        schema_extra = {
            "example": {
                "success": False,
                "error": "API_KEY_MISSING",
                "message": "News API key is not configured",
                "details": "Please set NEWS_API_KEY in your environment variables",
                "timestamp": "2024-01-01T12:00:00Z"
            }
        }