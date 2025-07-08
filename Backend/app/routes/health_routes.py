# Backend/app/routes/health_routes.py
# Health check endpoints for monitoring the backend

from fastapi import APIRouter, HTTPException
from datetime import datetime
import asyncio

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    try:
        await asyncio.sleep(0.05)  # Simulate processing
        
        return {
            "status": "healthy",
            "message": "TeaCup Backend is brewing smoothly! 🫖",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.get("/health/ping")
async def ping():
    """Quick ping endpoint"""
    return {
        "status": "pong",
        "timestamp": datetime.now().isoformat()
    }