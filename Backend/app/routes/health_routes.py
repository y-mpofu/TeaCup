# Backend/routes/health_routes.py
# Health check and system status routes
# These endpoints help monitor if the backend is working properly

from flask import Blueprint, jsonify
from datetime import datetime
import os
import sys
import psutil  # You'll need to add this to requirements.txt

# Create a blueprint for health-related routes
# Blueprints help organize routes into logical groups
health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Basic health check endpoint - tells the frontend if the backend is running
    Frontend calls this to check if the server is available
    
    Returns:
        JSON response with status information
    """
    try:
        return jsonify({
            'status': 'healthy',
            'message': 'TeaCup Backend is running smoothly',
            'timestamp': datetime.now().isoformat(),
            'version': '1.0.0'
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Health check failed: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@health_bp.route('/status', methods=['GET'])
def system_status():
    """
    Detailed system status endpoint - provides more information about the server
    Useful for debugging and monitoring
    """
    try:
        # Get system information
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Check if required environment variables are set
        env_status = {
            'news_api_configured': bool(os.getenv('NEWS_API_KEY')),
            'openai_configured': bool(os.getenv('OPENAI_API_KEY'))
        }
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'system_info': {
                'python_version': sys.version,
                'cpu_usage_percent': cpu_percent,
                'memory_usage_percent': memory.percent,
                'disk_usage_percent': disk.percent,
                'available_memory_gb': round(memory.available / (1024**3), 2)
            },
            'environment': env_status,
            'services': {
                'news_scraping': 'operational',
                'gpt_summarization': 'operational' if env_status['openai_configured'] else 'not_configured',
                'news_api': 'operational' if env_status['news_api_configured'] else 'not_configured'
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Status check failed: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@health_bp.route('/config', methods=['GET'])
def config_check():
    """
    Configuration check endpoint - helps debug setup issues
    Returns which API keys are configured (without exposing the actual keys)
    """
    try:
        config_status = {
            'news_api_key': {
                'configured': bool(os.getenv('NEWS_API_KEY')),
                'length': len(os.getenv('NEWS_API_KEY', '')) if os.getenv('NEWS_API_KEY') else 0
            },
            'openai_api_key': {
                'configured': bool(os.getenv('OPENAI_API_KEY')),
                'length': len(os.getenv('OPENAI_API_KEY', '')) if os.getenv('OPENAI_API_KEY') else 0
            },
            'flask_env': os.getenv('FLASK_ENV', 'not_set'),
            'debug_mode': os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        }
        
        # Calculate overall configuration health
        required_configs = ['news_api_key', 'openai_api_key']
        configured_count = sum(1 for key in required_configs if config_status[key]['configured'])
        config_health = 'complete' if configured_count == len(required_configs) else 'partial'
        
        return jsonify({
            'status': 'success',
            'configuration_health': config_health,
            'configured_services': f"{configured_count}/{len(required_configs)}",
            'details': config_status,
            'recommendations': get_config_recommendations(config_status),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Configuration check failed: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

def get_config_recommendations(config_status):
    """
    Helper function to provide configuration recommendations
    Helps users understand what they need to set up
    """
    recommendations = []
    
    if not config_status['news_api_key']['configured']:
        recommendations.append({
            'issue': 'News API key not configured',
            'solution': 'Get a free API key from https://newsapi.org/ and add it to your .env file as NEWS_API_KEY',
            'impact': 'Cannot fetch real news articles'
        })
    
    if not config_status['openai_api_key']['configured']:
        recommendations.append({
            'issue': 'OpenAI API key not configured',
            'solution': 'Get an API key from https://platform.openai.com/ and add it to your .env file as OPENAI_API_KEY',
            'impact': 'Cannot generate AI summaries for articles'
        })
    
    if not recommendations:
        recommendations.append({
            'status': 'All configurations are properly set up!',
            'next_step': 'Your backend is ready to process news articles'
        })
    
    return recommendations