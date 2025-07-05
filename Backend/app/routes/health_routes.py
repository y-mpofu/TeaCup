# Backend/app/routes/health_routes.py
# Health check and system monitoring endpoints for FastAPI
# These help monitor if your backend is working properly

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import os
import sys
import psutil  # For system monitoring - add to requirements.txt
import logging
from typing import Dict, Any, List

# Import our response models from the models folder
from models import (
    HealthResponse, 
    SystemStatusResponse, 
    ConfigurationResponse, 
    ErrorResponse
)

# Set up logging
logger = logging.getLogger(__name__)

# Create a router for health-related endpoints
# This is like a mini-app that handles all health routes
router = APIRouter()

@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check():
    """
    Basic health check endpoint
    
    This is the simplest way for your frontend to check if the backend is running.
    Returns basic status information.
    
    Returns:
        HealthResponse: Basic health status
    """
    try:
        logger.info("Health check requested")
        
        return HealthResponse(
            status="healthy",
            message="TeaCup Backend is running smoothly",
            timestamp=datetime.now().isoformat(),
            version="1.0.0"
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        
        # Return error response with proper HTTP status
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "message": f"Health check failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        )

@router.get("/status", response_model=SystemStatusResponse, status_code=status.HTTP_200_OK)
async def system_status():
    """
    Detailed system status endpoint
    
    Provides comprehensive information about server resources and service status.
    Useful for monitoring, debugging, and DevOps.
    
    Returns:
        SystemStatusResponse: Detailed system information
    """
    try:
        logger.info("System status check requested")
        
        # Get system resource information
        cpu_percent = psutil.cpu_percent(interval=1)  # Check CPU usage over 1 second
        memory = psutil.virtual_memory()  # Memory usage stats
        disk = psutil.disk_usage('/')  # Disk usage for root directory
        
        # Check which environment variables are configured
        env_status = {
            'news_api_configured': bool(os.getenv('NEWS_API_KEY')),
            'openai_configured': bool(os.getenv('OPENAI_API_KEY')),
            'debug_mode': os.getenv('DEBUG', 'false').lower() == 'true'
        }
        
        # Determine service statuses based on configuration
        services = {
            'news_scraping': 'operational',
            'gpt_summarization': 'operational' if env_status['openai_configured'] else 'not_configured',
            'news_api': 'operational' if env_status['news_api_configured'] else 'not_configured'
        }
        
        return SystemStatusResponse(
            status="healthy",
            timestamp=datetime.now().isoformat(),
            system_info={
                'python_version': sys.version,
                'cpu_usage_percent': round(cpu_percent, 2),
                'memory_usage_percent': round(memory.percent, 2),
                'disk_usage_percent': round(disk.percent, 2),
                'available_memory_gb': round(memory.available / (1024**3), 2),
                'total_memory_gb': round(memory.total / (1024**3), 2),
                'uptime_info': 'System monitoring active'
            },
            environment=env_status,
            services=services
        )
        
    except Exception as e:
        logger.error(f"System status check failed: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "message": f"Status check failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        )

@router.get("/config", response_model=ConfigurationResponse, status_code=status.HTTP_200_OK)
async def config_check():
    """
    Configuration validation endpoint
    
    Checks which API keys and environment variables are properly configured.
    Provides recommendations for missing configurations.
    Helps with setup and troubleshooting.
    
    Returns:
        ConfigurationResponse: Configuration status and recommendations
    """
    try:
        logger.info("Configuration check requested")
        
        # Check each required configuration
        config_status = {
            'news_api_key': {
                'configured': bool(os.getenv('NEWS_API_KEY')),
                'length': len(os.getenv('NEWS_API_KEY', '')),
                'masked_value': _mask_api_key(os.getenv('NEWS_API_KEY', ''))
            },
            'openai_api_key': {
                'configured': bool(os.getenv('OPENAI_API_KEY')),
                'length': len(os.getenv('OPENAI_API_KEY', '')),
                'masked_value': _mask_api_key(os.getenv('OPENAI_API_KEY', ''))
            },
            'environment': {
                'debug_mode': os.getenv('DEBUG', 'false').lower() == 'true',
                'python_env': os.getenv('PYTHON_ENV', 'development')
            }
        }
        
        # Calculate overall configuration health
        required_configs = ['news_api_key', 'openai_api_key']
        configured_count = sum(1 for key in required_configs if config_status[key]['configured'])
        config_health = 'complete' if configured_count == len(required_configs) else 'partial'
        
        # Generate recommendations for missing configurations
        recommendations = _get_config_recommendations(config_status)
        
        return ConfigurationResponse(
            status="success",
            configuration_health=config_health,
            configured_services=f"{configured_count}/{len(required_configs)}",
            details=config_status,
            recommendations=recommendations,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Configuration check failed: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "message": f"Configuration check failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        )

# Helper functions

def _mask_api_key(api_key: str) -> str:
    """
    Masks API key for safe logging and display
    Shows only first 4 and last 4 characters
    
    Args:
        api_key: The API key to mask
        
    Returns:
        Masked API key string
    """
    if not api_key:
        return "Not configured"
    
    if len(api_key) < 8:
        return "****"
    
    return f"{api_key[:4]}{'*' * (len(api_key) - 8)}{api_key[-4:]}"

def _get_config_recommendations(config_status: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Generates configuration recommendations based on current status
    
    Args:
        config_status: Current configuration status
        
    Returns:
        List of recommendation dictionaries
    """
    recommendations = []
    
    # Check News API configuration
    if not config_status['news_api_key']['configured']:
        recommendations.append({
            'issue': 'News API key not configured',
            'solution': 'Get a free API key from https://newsapi.org/ and add it to your .env file as NEWS_API_KEY',
            'impact': 'Cannot fetch real news articles - will use sample data',
            'priority': 'high'
        })
    
    # Check OpenAI API configuration
    if not config_status['openai_api_key']['configured']:
        recommendations.append({
            'issue': 'OpenAI API key not configured',
            'solution': 'Get an API key from https://platform.openai.com/ and add it to your .env file as OPENAI_API_KEY',
            'impact': 'Cannot generate AI summaries - will use article descriptions',
            'priority': 'medium'
        })
    
    # All good case
    if not recommendations:
        recommendations.append({
            'status': 'All configurations are properly set up!',
            'next_step': 'Your backend is ready to process news articles',
            'suggestion': 'Consider monitoring API usage limits',
            'priority': 'low'
        })
    
    return recommendations

@router.get("/ping", status_code=status.HTTP_200_OK)
async def ping():
    """
    Ultra-simple ping endpoint
    
    Fastest way to check if server is responsive.
    Useful for load balancers and monitoring tools.
    
    Returns:
        Simple pong response
    """
    return {"ping": "pong", "timestamp": datetime.now().isoformat()}

@router.get("/version", status_code=status.HTTP_200_OK)
async def get_version():
    """
    Get API version information
    
    Returns version and build information.
    Useful for deployment tracking and debugging.
    
    Returns:
        Version information
    """
    return {
        "version": "1.0.0",
        "api_name": "TeaCup Backend",
        "python_version": sys.version.split()[0],
        "build_timestamp": datetime.now().isoformat(),
        "features": [
            "News fetching from NewsAPI",
            "Web scraping with Beautiful Soup",
            "AI summarization with OpenAI GPT",
            "Multi-category news processing",
            "Real-time health monitoring"
        ]
    }# Backend/app/routes/health_routes.py
# Health check and system monitoring endpoints for FastAPI
# These help monitor if your backend is working properly

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import os
import sys
import psutil  # For system monitoring - add to requirements.txt
import logging
from typing import Dict, Any, List

# Import our response models
from models import (
    HealthResponse, 
    SystemStatusResponse, 
    ConfigurationResponse, 
    ErrorResponse
)

# Set up logging
logger = logging.getLogger(__name__)

# Create a router for health-related endpoints
# This is like a mini-app that handles all health routes
router = APIRouter()

@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check():
    """
    Basic health check endpoint
    
    This is the simplest way for your frontend to check if the backend is running.
    Returns basic status information.
    
    Returns:
        HealthResponse: Basic health status
    """
    try:
        logger.info("Health check requested")
        
        return HealthResponse(
            status="healthy",
            message="TeaCup Backend is running smoothly",
            timestamp=datetime.now().isoformat(),
            version="1.0.0"
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        
        # Return error response with proper HTTP status
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "message": f"Health check failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        )

@router.get("/status", response_model=SystemStatusResponse, status_code=status.HTTP_200_OK)
async def system_status():
    """
    Detailed system status endpoint
    
    Provides comprehensive information about server resources and service status.
    Useful for monitoring, debugging, and DevOps.
    
    Returns:
        SystemStatusResponse: Detailed system information
    """
    try:
        logger.info("System status check requested")
        
        # Get system resource information
        cpu_percent = psutil.cpu_percent(interval=1)  # Check CPU usage over 1 second
        memory = psutil.virtual_memory()  # Memory usage stats
        disk = psutil.disk_usage('/')  # Disk usage for root directory
        
        # Check which environment variables are configured
        env_status = {
            'news_api_configured': bool(os.getenv('NEWS_API_KEY')),
            'openai_configured': bool(os.getenv('OPENAI_API_KEY')),
            'debug_mode': os.getenv('DEBUG', 'false').lower() == 'true'
        }
        
        # Determine service statuses based on configuration
        services = {
            'news_scraping': 'operational',
            'gpt_summarization': 'operational' if env_status['openai_configured'] else 'not_configured',
            'news_api': 'operational' if env_status['news_api_configured'] else 'not_configured'
        }
        
        return SystemStatusResponse(
            status="healthy",
            timestamp=datetime.now().isoformat(),
            system_info={
                'python_version': sys.version,
                'cpu_usage_percent': round(cpu_percent, 2),
                'memory_usage_percent': round(memory.percent, 2),
                'disk_usage_percent': round(disk.percent, 2),
                'available_memory_gb': round(memory.available / (1024**3), 2),
                'total_memory_gb': round(memory.total / (1024**3), 2),
                'uptime_info': 'System monitoring active'
            },
            environment=env_status,
            services=services
        )
        
    except Exception as e:
        logger.error(f"System status check failed: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "message": f"Status check failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        )

@router.get("/config", response_model=ConfigurationResponse, status_code=status.HTTP_200_OK)
async def config_check():
    """
    Configuration validation endpoint
    
    Checks which API keys and environment variables are properly configured.
    Provides recommendations for missing configurations.
    Helps with setup and troubleshooting.
    
    Returns:
        ConfigurationResponse: Configuration status and recommendations
    """
    try:
        logger.info("Configuration check requested")
        
        # Check each required configuration
        config_status = {
            'news_api_key': {
                'configured': bool(os.getenv('NEWS_API_KEY')),
                'length': len(os.getenv('NEWS_API_KEY', '')),
                'masked_value': _mask_api_key(os.getenv('NEWS_API_KEY', ''))
            },
            'openai_api_key': {
                'configured': bool(os.getenv('OPENAI_API_KEY')),
                'length': len(os.getenv('OPENAI_API_KEY', '')),
                'masked_value': _mask_api_key(os.getenv('OPENAI_API_KEY', ''))
            },
            'environment': {
                'debug_mode': os.getenv('DEBUG', 'false').lower() == 'true',
                'python_env': os.getenv('PYTHON_ENV', 'development')
            }
        }
        
        # Calculate overall configuration health
        required_configs = ['news_api_key', 'openai_api_key']
        configured_count = sum(1 for key in required_configs if config_status[key]['configured'])
        config_health = 'complete' if configured_count == len(required_configs) else 'partial'
        
        # Generate recommendations for missing configurations
        recommendations = _get_config_recommendations(config_status)
        
        return ConfigurationResponse(
            status="success",
            configuration_health=config_health,
            configured_services=f"{configured_count}/{len(required_configs)}",
            details=config_status,
            recommendations=recommendations,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Configuration check failed: {str(e)}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "message": f"Configuration check failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        )

# Helper functions

def _mask_api_key(api_key: str) -> str:
    """
    Masks API key for safe logging and display
    Shows only first 4 and last 4 characters
    
    Args:
        api_key: The API key to mask
        
    Returns:
        Masked API key string
    """
    if not api_key:
        return "Not configured"
    
    if len(api_key) < 8:
        return "****"
    
    return f"{api_key[:4]}{'*' * (len(api_key) - 8)}{api_key[-4:]}"

def _get_config_recommendations(config_status: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Generates configuration recommendations based on current status
    
    Args:
        config_status: Current configuration status
        
    Returns:
        List of recommendation dictionaries
    """
    recommendations = []
    
    # Check News API configuration
    if not config_status['news_api_key']['configured']:
        recommendations.append({
            'issue': 'News API key not configured',
            'solution': 'Get a free API key from https://newsapi.org/ and add it to your .env file as NEWS_API_KEY',
            'impact': 'Cannot fetch real news articles - will use sample data',
            'priority': 'high'
        })
    
    # Check OpenAI API configuration
    if not config_status['openai_api_key']['configured']:
        recommendations.append({
            'issue': 'OpenAI API key not configured',
            'solution': 'Get an API key from https://platform.openai.com/ and add it to your .env file as OPENAI_API_KEY',
            'impact': 'Cannot generate AI summaries - will use article descriptions',
            'priority': 'medium'
        })
    
    # All good case
    if not recommendations:
        recommendations.append({
            'status': 'All configurations are properly set up!',
            'next_step': 'Your backend is ready to process news articles',
            'suggestion': 'Consider monitoring API usage limits',
            'priority': 'low'
        })
    
    return recommendations

@router.get("/ping", status_code=status.HTTP_200_OK)
async def ping():
    """
    Ultra-simple ping endpoint
    
    Fastest way to check if server is responsive.
    Useful for load balancers and monitoring tools.
    
    Returns:
        Simple pong response
    """
    return {"ping": "pong", "timestamp": datetime.now().isoformat()}

@router.get("/version", status_code=status.HTTP_200_OK)
async def get_version():
    """
    Get API version information
    
    Returns version and build information.
    Useful for deployment tracking and debugging.
    
    Returns:
        Version information
    """
    return {
        "version": "1.0.0",
        "api_name": "TeaCup Backend",
        "python_version": sys.version.split()[0],
        "build_timestamp": datetime.now().isoformat(),
        "features": [
            "News fetching from NewsAPI",
            "Web scraping with Beautiful Soup",
            "AI summarization with OpenAI GPT",
            "Multi-category news processing",
            "Real-time health monitoring"
        ]
    }