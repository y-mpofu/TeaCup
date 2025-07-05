# Backend/main.py
# Main entry point for the Vuka Unzwe backend server
# This file sets up the Flask app and registers all route blueprints

from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

# Set up logging for better debugging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """
    Application factory pattern - creates and configures the Flask app
    This is a good practice for organizing larger Flask applications
    """
    # Create Flask application instance
    app = Flask(__name__)
    
    # Enable CORS so our React frontend can communicate with this backend
    # This allows requests from http://localhost:3000 (where React runs)
    CORS(app, origins=['http://localhost:3000'])
    
    # Basic app configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-for-development')
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Register all route blueprints from the routes folder
    register_blueprints(app)
    
    return app

def register_blueprints(app):
    """
    Register all route blueprints - this keeps our routes organized in separate files
    Each blueprint handles a specific group of related endpoints
    """
    try:
        # Import route blueprints from the routes folder
        from routes.news_routes import news_bp
        from routes.health_routes import health_bp
        
        # Register the blueprints with URL prefixes
        app.register_blueprint(health_bp, url_prefix='/api')
        app.register_blueprint(news_bp, url_prefix='/api/news')
        
        logger.info("Successfully registered all route blueprints")
        
    except ImportError as e:
        logger.error(f"Error importing route blueprints: {e}")
        raise

def check_environment():
    """
    Check that all required environment variables are set
    This helps catch configuration issues early
    """
    required_vars = ['NEWS_API_KEY', 'OPENAI_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.warning(f"Missing environment variables: {', '.join(missing_vars)}")
        logger.warning("Some features may not work properly. Please check your .env file.")
        return False
    
    logger.info("All required environment variables are set")
    return True

if __name__ == '__main__':
    # Check environment configuration
    check_environment()
    
    # Create the Flask app
    app = create_app()
    
    # Print startup information
    logger.info("=" * 50)
    logger.info("🫖 Starting TeaCup Backend Server")
    logger.info("=" * 50)
    logger.info("Server will be available at: http://localhost:5000")
    logger.info("Health check endpoint: http://localhost:5000/api/health")
    logger.info("News API endpoints: http://localhost:5000/api/news/")
    logger.info("Press Ctrl+C to stop the server")
    logger.info("=" * 50)
    
    # Run the Flask development server
    app.run(
        debug=True,
        host='0.0.0.0',  # Accept connections from any IP (allows frontend to connect)
        port=5000,       # Standard port for our backend
        threaded=True    # Handle multiple requests simultaneously
    )