# Backend/routes/__init__.py
# This file makes the routes directory a Python package

"""
Routes package for TeaCup backend

This package contains all the API route definitions:
- health_routes: Health check and system status endpoints
- news_routes: News processing and serving endpoints
"""

from .health_routes import health_bp
from .news_routes import news_bp

__all__ = ['health_bp', 'news_bp']