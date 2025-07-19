# Backend/main.py
# FIXED: Main FastAPI application with /api prefix for all routes

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

# Import route modules
from app.routes import health_routes, news_routes

# Set up logging to see what's happening
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application instance
app = FastAPI(
    title="TeaCup News API",
    description="A real-time news aggregation API with multiple categories",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI will be at /docs
    redoc_url="/redoc"  # ReDoc will be at /redoc
)

# Configure CORS - allows frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# FIXED: Include routers with /api prefix to match frontend expectations
app.include_router(
    health_routes.router,
    prefix="/api",  # This makes health endpoints available at /api/health/*
    tags=["Health"]
)

app.include_router(
    news_routes.router,
    prefix="/api",  # This makes news endpoints available at /api/news/*
    tags=["News"]
)

# Root endpoint - just for testing
@app.get("/")
async def root():
    """
    Root endpoint - confirms API is running
    """
    return {
        "message": "TeaCup News API is running! 🫖",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health/ping"
    }

# Startup event - runs when server starts
@app.on_event("startup")
async def startup_event():
    """
    Runs when the FastAPI server starts up
    """
    logger.info("🫖 TeaCup News API starting up...")
    logger.info("📡 API endpoints available at:")
    logger.info("   Health: /api/health/ping")
    logger.info("   News: /api/news/{category}")
    logger.info("   All News: /api/news/all")
    logger.info("   Documentation: /docs")

# Shutdown event - runs when server stops
@app.on_event("shutdown")
async def shutdown_event():
    """
    Runs when the FastAPI server shuts down
    """
    logger.info("🫖 TeaCup News API shutting down...")

# Run the server if this file is executed directly
if __name__ == "__main__":
    logger.info("🚀 Starting TeaCup News API server...")
    uvicorn.run(
        "main:app",  # Module and application instance
        host="127.0.0.1",  # Listen on localhost
        port=8000,  # Port 8000
        reload=True,  # Auto-reload on code changes (development mode)
        log_level="info"  # Logging level
    )