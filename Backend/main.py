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
# FIXED: Add search routes to the main FastAPI application

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

# Import all route modules - INCLUDING search routes
from app.routes import health_routes, news_routes, auth_routes, article_routes, search_routes

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="TeaCup Multi-Country News API",
    description="News aggregation API with search and authentication",
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
            "Article search functionality",  # <-- Added search feature
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
            "search": "/api/search (authentication optional)",  # <-- Added search endpoint info
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

app.include_router(
    article_routes.router,
    prefix="/api",
    tags=["Article Processing"]
)

# **CRITICAL FIX: Include search routes**
app.include_router(
    search_routes.router,
    prefix="/api",  # This makes search available at /api/search
    tags=["Search Functionality"]
)

# Debug endpoint to check what routes are available
@app.get("/debug/routes")
async def debug_routes():
    """
    Debug endpoint to see all available routes
    Useful for troubleshooting routing issues
    """
    routes = []
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": getattr(route, 'name', 'Unknown')
            })
    
    return {
        "total_routes": len(routes),
        "routes": routes,
        "search_routes": [r for r in routes if 'search' in r['path'].lower()],
        "timestamp": datetime.now().isoformat()
    }

# If running directly with python (not recommended for production)
if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting TeaCup News API...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)