# Backend/services/__init__.py
# This file makes the services directory a Python package
# It allows us to import modules from this directory

"""
Services package for TeaCup backend

This package contains all the core business logic services:
- news_processor: Handles news fetching, scraping, and GPT summarization
"""

from .news_processor import NewsProcessor

__all__ = ['NewsProcessor']