# Backend/app/main.py
# Main FastAPI application - this is the entry point of your backend server
# Run this file to start your backend: uvicorn main:app --reload --host 0.0.0.0 --port 5000

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

# Import our route modules
from routes.health_routes import router as health_router
from routes.news_routes import router as news_router

# Load environment variables from .env file
load_dotenv()

# Set up logging so we can see what's happening
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan manager - runs when the app starts and shuts down
    This is where we initialize services and clean up resources
    """
    # Startup code
    logger.info("🚀 TeaCup Backend is starting up...")
    
    # Check if required environment variables are set
    required_env_vars = ['NEWS_API_KEY', 'OPENAI_API_KEY']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.warning(f"⚠️  Missing environment variables: {missing_vars}")
        logger.warning("Backend will run but some features may not work properly")
    else:
        logger.info("✅ All environment variables are configured")
    
    # App is ready
    logger.info("✅ TeaCup Backend is ready to serve!")
    
    yield  # This is where the app runs
    
    # Shutdown code
    logger.info("🛑 TeaCup Backend is shutting down...")

# Create the main FastAPI application instance
app = FastAPI(
    title="TeaCup News Backend",
    description="Backend API for TeaCup - AI-powered news aggregation and summarization",
    version="1.0.0",
    docs_url="/docs",  # Automatic API documentation at http://localhost:5000/docs
    redoc_url="/redoc",  # Alternative API docs at http://localhost:5000/redoc
    lifespan=lifespan
)

# Configure CORS (Cross-Origin Resource Sharing)
# This allows your frontend (running on port 3000) to talk to your backend (port 5000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://localhost:5173",  # Vite development server (if you switch)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add custom middleware for logging requests
@app.middleware("http")
async def log_requests(request, call_next):
    """
    Middleware to log all incoming requests
    Helps with debugging and monitoring
    """
    start_time = time.time()
    logger.info(f"📥 {request.method} {request.url}")
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"📤 {request.method} {request.url} - {response.status_code} - {process_time:.2f}s")
    
    return response

# Include our route modules
# All health-related endpoints will be available at /api/health/*
app.include_router(health_router, prefix="/api", tags=["Health"])

# All news-related endpoints will be available at /api/news/*
app.include_router(news_router, prefix="/api", tags=["News"])

# Root endpoint - just a simple welcome message
@app.get("/")
async def root():
    """
    Root endpoint - shows basic info about the API
    Visit http://localhost:5000/ to see this
    """
    return {
        "message": "Welcome to TeaCup Backend API! 🫖",
        "version": "1.0.0",
        "status": "running",
        "documentation": "/docs",
        "health_check": "/api/health"
    }

# Global exception handler for unexpected errors
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Catches any unexpected errors and returns a proper JSON response
    This prevents the server from crashing and gives useful error info
    """
    logger.error(f"💥 Unexpected error: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": "Something went wrong on our end. Please try again later.",
            "details": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else None
        }
    )

# Add import for time module (needed for middleware)
import time

if __name__ == "__main__":
    # This allows you to run the server with: python main.py
    # But it's better to use: uvicorn main:app --reload --host 0.0.0.0 --port 5000
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,  # Auto-restart when code changes
        log_level="info"
    )