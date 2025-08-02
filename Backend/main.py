# # Backend/main.py
# # FIXED: Main FastAPI application with /api prefix for all routes

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn
# import logging

# # Import route modules
# from app.routes import health_routes, news_routes

# # Set up logging to see what's happening
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
# )
# logger = logging.getLogger(__name__)

# # Create FastAPI application instance
# app = FastAPI(
#     title="TeaCup News API",
#     description="A real-time news aggregation API with multiple categories",
#     version="1.0.0",
#     docs_url="/docs",  # Swagger UI will be at /docs
#     redoc_url="/redoc"  # ReDoc will be at /redoc
# )

# # Configure CORS - allows frontend to communicate with backend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",  # React dev server
#         "http://localhost:5173",  # Vite dev server
#         "http://127.0.0.1:3000",
#         "http://127.0.0.1:5173",
#     ],
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#     allow_headers=["*"],
# )

# # FIXED: Include routers with /api prefix to match frontend expectations
# app.include_router(
#     health_routes.router,
#     prefix="/api",  # This makes health endpoints available at /api/health/*
#     tags=["Health"]
# )

# app.include_router(
#     news_routes.router,
#     prefix="/api",  # This makes news endpoints available at /api/news/*
#     tags=["News"]
# )

# # Root endpoint - just for testing
# @app.get("/")
# async def root():
#     """
#     Root endpoint - confirms API is running
#     """
#     return {
#         "message": "TeaCup News API is running! 🫖",
#         "version": "1.0.0",
#         "docs": "/docs",
#         "health": "/api/health/ping"
#     }

# # Startup event - runs when server starts
# @app.on_event("startup")
# async def startup_event():
#     """
#     Runs when the FastAPI server starts up
#     """
#     logger.info("🫖 TeaCup News API starting up...")
#     logger.info("📡 API endpoints available at:")
#     logger.info("   Health: /api/health/ping")
#     logger.info("   News: /api/news/{category}")
#     logger.info("   All News: /api/news/all")
#     logger.info("   Documentation: /docs")

# # Shutdown event - runs when server stops
# @app.on_event("shutdown")
# async def shutdown_event():
#     """
#     Runs when the FastAPI server shuts down
#     """
#     logger.info("🫖 TeaCup News API shutting down...")

# # Run the server if this file is executed directly
# if __name__ == "__main__":
#     logger.info("🚀 Starting TeaCup News API server...")
#     uvicorn.run(
#         "main:app",  # Module and application instance
#         host="127.0.0.1",  # Listen on localhost
#         port=8000,  # Port 8000
#         reload=True,  # Auto-reload on code changes (development mode)
#         log_level="info"  # Logging level
#     )


# Backend/main.py
# Main FastAPI application with authentication routes included
# Backend/main.py
# Main FastAPI application - no country defaults, requires user authentication

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import uvicorn
import json
import os
from datetime import datetime

# Import route modules
from app.routes import news_routes, health_routes, auth_routes

# Set up comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application instance
app = FastAPI(
    title="TeaCup News API",
    description="Multi-country news aggregation API with user authentication",
    version="2.0.0",
    docs_url="/docs",  # Swagger UI available at /docs
    redoc_url="/redoc"  # ReDoc available at /redoc
)

# Configure CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://localhost:5173",  # Vite development server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,  # Required for authentication tokens
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],  # Allow all headers including Authorization
)

# Root endpoint - API information
@app.get("/")
async def root():
    """
    Root endpoint providing API information
    Shows that this is a multi-country news API requiring authentication
    """
    return {
        "message": "TeaCup Multi-Country News API 🌍",
        "version": "2.0.0",
        "features": [
            "Multi-country news aggregation",
            "User authentication required",
            "Dynamic country preferences",
            "Real-time news from 7 African countries"
        ],
        "supported_countries": [
            "Zimbabwe (ZW)", "Kenya (KE)", "Ghana (GH)", "Rwanda (RW)",
            "Democratic Republic of Congo (CD)", "South Africa (ZA)", "Burundi (BI)"
        ],
        "authentication": "Required for all news endpoints",
        "endpoints": {
            "docs": "/docs",
            "health": "/api/health",
            "news": "/api/news/* (authentication required)",
            "auth": "/api/auth/*"
        },
        "timestamp": datetime.now().isoformat()
    }

# Include all route modules with proper prefixes
app.include_router(
    health_routes.router,
    prefix="/api",
    tags=["Health Check"]
)

app.include_router(
    news_routes.router,
    prefix="/api",
    tags=["News - Authentication Required"]
)

app.include_router(
    auth_routes.router,
    prefix="/api/auth",
    tags=["User Authentication"]
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Handle unexpected errors consistently
    """
    logger.error(f"💥 Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An internal server error occurred",
            "timestamp": datetime.now().isoformat()
        }
    )

# Startup event handler
@app.on_event("startup")
async def startup_event():
    """
    Initialize the application on startup
    Creates database if needed but with no default users
    """
    logger.info("🚀 TeaCup Multi-Country News API starting up...")
    logger.info("🔧 Initializing authentication system...")
    
    # Check for required dependencies
    try:
        import bcrypt
        logger.info("✅ bcrypt available for password hashing")
    except ImportError:
        logger.error("❌ bcrypt not installed - required for authentication")
        logger.error("   Install with: pip install bcrypt")
        raise Exception("bcrypt is required for authentication")
    
    # Initialize database if needed
    try:
        if os.path.exists("users_db.json"):
            logger.info("✅ User database file found")
            
            # Validate existing database structure
            with open("users_db.json", 'r') as f:
                db_data = json.load(f)
            
            # Check if any users exist
            if db_data.get("users"):
                user_count = len(db_data["users"])
                logger.info(f"👥 Found {user_count} existing users in database")
                
                # Log countries represented in database (for admin visibility)
                countries_in_use = set()
                for user in db_data["users"]:
                    country = user.get("country_of_interest")
                    if country:
                        countries_in_use.add(country)
                
                if countries_in_use:
                    logger.info(f"🌍 Countries represented: {', '.join(sorted(countries_in_use))}")
                else:
                    logger.warning("⚠️  No users have country preferences set")
            else:
                logger.info("📝 Database exists but no users registered yet")
        else:
            logger.info("📝 Creating new user database...")
            
            # Create empty database structure (no default users)
            initial_db = {
                "users": [],        # Empty - users must register with country selection
                "sessions": []      # Empty sessions array
            }
            
            # Save empty database
            with open("users_db.json", "w") as f:
                json.dump(initial_db, f, indent=2)
            
            logger.info("✅ Empty user database created")
            logger.info("📝 Users must register and select a country to access news")
            
    except Exception as e:
        logger.error(f"❌ Database initialization error: {e}")
        raise Exception(f"Failed to initialize user database: {e}")
    
    # Validate API credentials - FIXED: Don't re-import os
    try:
        # Use the os module that's already imported at the top
        google_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        google_cse = os.getenv("GOOGLE_CSE_ID")
        openai_key = os.getenv("OPENAI_API_KEY")
        
        if google_key and google_cse:
            logger.info("✅ Google Custom Search API configured")
        else:
            logger.error("❌ Google Search API credentials missing")
            logger.error("   News service requires GOOGLE_SEARCH_API_KEY and GOOGLE_CSE_ID")
        
        if openai_key:
            logger.info("✅ OpenAI API configured for enhanced summaries")
        else:
            logger.info("ℹ️  OpenAI API not configured - using basic summaries")
            
    except Exception as e:
        logger.error(f"❌ API validation error: {e}")
    
    # Log startup completion
    logger.info("🌍 Multi-country news system ready!")
    logger.info("🔐 All news endpoints require user authentication")
    logger.info("📍 Supported countries: ZW, KE, GH, RW, CD, ZA, BI")
    logger.info("🫖 TeaCup API ready to serve personalized news!")

# Shutdown event handler
@app.on_event("shutdown")
async def shutdown_event():
    """
    Clean shutdown of the application
    """
    logger.info("🛑 TeaCup API shutting down...")
    logger.info("👋 Goodbye from the multi-country news service!")

# Development server entry point
if __name__ == "__main__":
    """
    Start the development server
    For production, use: uvicorn main:app --host 0.0.0.0 --port 8000
    """
    logger.info("🔧 Starting development server...")
    logger.info("🌍 Multi-country news API with authentication")
    
    uvicorn.run(
        "main:app",                    # Application module and variable
        host="0.0.0.0",               # Listen on all network interfaces
        port=8000,                    # Standard port
        reload=True,                  # Auto-reload on code changes (dev only)
        log_level="info"              # Detailed logging
    )