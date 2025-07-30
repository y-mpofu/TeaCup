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

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import uvicorn
from datetime import datetime

# Import route modules
from app.routes import news_routes, health_routes, auth_routes

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application instance
app = FastAPI(
    title="TeaCup News API",
    description="Backend API for TeaCup news application with authentication",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI available at /docs
    redoc_url="/redoc"  # ReDoc available at /redoc
)

# Configure CORS middleware for frontend communication
# This allows your React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://localhost:5173",  # Vite development server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,  # Allow cookies and authentication headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # HTTP methods
    allow_headers=["*"],  # Allow all headers including Authorization
)

# Root endpoint - basic API information
@app.get("/")
async def root():
    """
    Root endpoint that provides basic API information
    """
    return {
        "message": "TeaCup News API is running! 🫖",
        "version": "1.0.0",
        "features": [
            "Real-time news aggregation",
            "User authentication",
            "Personalized settings",
            "Category-based news filtering"
        ],
        "endpoints": {
            "docs": "/docs",
            "health": "/api/health",
            "news": "/api/news",
            "auth": "/api/auth"
        },
        "timestamp": datetime.now().isoformat()
    }

# Include all route modules with proper prefixes
# Each route module handles a specific area of functionality

# Health check routes - for monitoring backend status
app.include_router(
    health_routes.router,
    prefix="/api",  # Routes will be available at /api/health/*
    tags=["Health"]
)

# News routes - for fetching and searching news articles
app.include_router(
    news_routes.router,
    prefix="/api",  # Routes will be available at /api/news/*
    tags=["News"]
)

# Authentication routes - for user login, registration, and settings
app.include_router(
    auth_routes.router,
    prefix="/api/auth",  # Routes will be available at /api/auth/*
    tags=["Authentication"]
)

# Global exception handler for unexpected errors
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler to catch any unhandled errors
    and return a consistent error response
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

# Startup event - runs when the server starts
@app.on_event("startup")
async def startup_event():
    """
    Startup event handler
    Runs when the FastAPI server starts up
    """
    logger.info("🚀 TeaCup Backend starting up...")
    logger.info("🔧 Initializing services...")
    
    # Check if required dependencies are available
    try:
        import bcrypt
        logger.info("✅ bcrypt library available for password hashing")
    except ImportError:
        logger.warning("⚠️  bcrypt not available - install with: pip install bcrypt")
    
    try:
        import json
        import os
        # Check if users database file exists
        if os.path.exists("users_db.json"):
            logger.info("✅ User database file found")
        else:
            logger.info("📝 Creating initial user database file...")
            # Create initial database structure
            initial_db = {
                "users": [
                    {
                        "id": "1",
                        "username": "demo_user",
                        "email": "demo@teacup.com",
                        "password_hash": "$2b$12$LQv3c1yqBwlVHpPqr5wW.eS3nvN6oHdOh2Bkd9a5Xa7G1Nx2EHrSW",
                        "first_name": "Demo",
                        "last_name": "User",
                        "profile_picture": None,
                        "created_at": "2025-01-15T10:30:00Z",
                        "last_login": "2025-01-20T08:15:00Z",
                        "is_active": True,
                        "settings": {
                            "notifications": {
                                "email": True,
                                "push": False,
                                "sms": True
                            },
                            "privacy": {
                                "profile_visibility": "public",
                                "data_collection": True,
                                "analytics": False
                            },
                            "preferences": {
                                "theme": "dark",
                                "language": "english",
                                "autoplay": False,
                                "font_size": "medium"
                            }
                        }
                    }
                ],
                "sessions": []
            }
            
            with open("users_db.json", "w") as f:
                json.dump(initial_db, f, indent=2)
            
            logger.info("✅ Initial user database created with demo user")
            logger.info("🔑 Demo credentials: username='demo_user', password='password123'")
            
    except Exception as e:
        logger.error(f"❌ Error during startup: {e}")
    
    logger.info("🫖 TeaCup Backend ready to serve!")

# Shutdown event - runs when the server stops
@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event handler
    Runs when the FastAPI server is shutting down
    """
    logger.info("🛑 TeaCup Backend shutting down...")
    logger.info("👋 Goodbye!")

# Development server configuration
if __name__ == "__main__":
    # This block runs when you execute: python main.py
    # For production, use: uvicorn main:app --host 0.0.0.0 --port 8000
    
    logger.info("🔧 Starting development server...")
    
    uvicorn.run(
        "main:app",  # Application module and variable
        host="0.0.0.0",  # Listen on all network interfaces
        port=8000,  # Port number
        reload=True,  # Auto-reload on code changes (development only)
        log_level="info"  # Logging level
    )