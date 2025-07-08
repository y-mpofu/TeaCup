# Backend/main.py
# Updated main FastAPI application with all routes

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime

# Import our route modules
from app.routes.news_routes import router as news_router
from app.routes.health_routes import router as health_router

# Create the FastAPI application
app = FastAPI(
    title="TeaCup News API",
    description="Backend API for TeaCup news application - serving fresh news like a perfect cup of tea",
    version="1.0.0"
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # React default port
        "http://localhost:5173",    # Vite default port  
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include our route modules with proper prefixes
app.include_router(news_router, prefix="/api", tags=["news"])
app.include_router(health_router, prefix="/api", tags=["health"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to TeaCup News API! 🫖",
        "description": "High Quality Tea Served Hot - Your AI-powered news companion",
        "timestamp": datetime.now().isoformat(),
        "docs": "Visit /docs for API documentation",
        "available_endpoints": {
            "health": "/api/health",
            "all_news": "/api/news/all",
            "politics": "/api/news/politics",
            "sports": "/api/news/sports",
            "breaking": "/api/news/breaking",
            "search": "/api/news/search?q=keyword"
        }
    }

# Run the server
if __name__ == "__main__":
    print("🫖 Starting TeaCup News API server...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔗 Frontend connects to: http://localhost:8000/api")
    print("🧪 Test endpoints:")
    print("   - Health: http://localhost:8000/api/health")
    print("   - All News: http://localhost:8000/api/news/all")
    print("   - Politics: http://localhost:8000/api/news/politics")
    
    uvicorn.run(
        "main:app", 
        host="0.0.0.0",
        port=8000,
        reload=True
    )