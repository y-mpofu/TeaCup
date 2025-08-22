# Backend/app/routes/article_routes.py
"""
Enhanced Article Routes with correct OpenAI implementation
Handles article processing with real web scraping and GPT integration.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict
import os
import logging
from datetime import datetime
import json
import asyncio

# Set up logging
logger = logging.getLogger(__name__)

# Import OpenAI - handle different versions
try:
    # Try new OpenAI client (version 1.0+)
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    OPENAI_AVAILABLE = True
    OPENAI_VERSION = "new"
    logger.info("Using new OpenAI client (v1.0+)")
except ImportError:
    try:
        # Fall back to old OpenAI style (version < 1.0)
        import openai
        openai.api_key = os.getenv('OPENAI_API_KEY')
        OPENAI_AVAILABLE = True
        OPENAI_VERSION = "legacy"
        logger.info("Using legacy OpenAI client")
    except ImportError:
        OPENAI_AVAILABLE = False
        OPENAI_VERSION = None
        print("⚠️ OpenAI library not installed. Install with: pip install openai")

# Import our scraper service
from app.services.article_scraper_service import ArticleScraperService
from app.routes.auth_routes import get_user_from_token

# Initialize router and security
router = APIRouter()
security = HTTPBearer()

# Initialize services
scraper_service = ArticleScraperService()

# Check if OpenAI is properly configured
if OPENAI_AVAILABLE and not os.getenv('OPENAI_API_KEY'):
    logger.warning("⚠️ OpenAI library installed but API key not found in environment")
    OPENAI_AVAILABLE = False

# Request/Response models
class ArticleEnhanceRequest(BaseModel):
    """Request model for article enhancement"""
    article_id: str
    article_url: str
    article_title: str
    article_snippet: str
    category: str

class ArticleEnhanceResponse(BaseModel):
    """Response model for enhanced article"""
    success: bool
    enhanced_summary: str
    key_points: List[str]
    reading_time: str
    confidence_score: int
    scraped_content_preview: Optional[str] = None
    error: Optional[str] = None

class ChatMessage(BaseModel):
    """Chat message model"""
    article_id: str
    article_url: str
    message: str
    context: Optional[str] = None

class ChatResponse(BaseModel):
    """Chat response model"""
    success: bool
    response: str
    context_used: bool
    error: Optional[str] = None


# Simple in-memory cache for scraped articles
SCRAPE_CACHE: Dict[str, Dict] = {}


async def call_openai_api(system_prompt: str, user_prompt: str, temperature: float = 0.7, max_tokens: int = 800, json_response: bool = True):
    """
    Unified function to call OpenAI API that works with both old and new versions
    
    Args:
        system_prompt: System message for GPT
        user_prompt: User message for GPT
        temperature: Creativity parameter (0-1)
        max_tokens: Maximum response length
        json_response: Whether to expect JSON response
        
    Returns:
        Response text from GPT
    """
    if not OPENAI_AVAILABLE:
        raise Exception("OpenAI not available")
    
    try:
        if OPENAI_VERSION == "new":
            # New OpenAI client (v1.0+)
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            
            # Build the request
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            # Add JSON mode if requested
            kwargs = {
                "model": "gpt-3.5-turbo",
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            if json_response:
                kwargs["response_format"] = {"type": "json_object"}
            
            # Make the API call
            response = client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
            
        else:
            # Legacy OpenAI (version < 1.0)
            import openai
            openai.api_key = os.getenv('OPENAI_API_KEY')
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            # For legacy version, we need to handle JSON differently
            if json_response:
                # Add instruction to return JSON in the prompt
                user_prompt += "\n\nIMPORTANT: Return your response as valid JSON only, with no additional text."
                messages[1]["content"] = user_prompt
            
            # Make the API call using the legacy method
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
            )
            
            return response.choices[0].message.content
            
    except Exception as e:
        logger.error(f"OpenAI API call failed: {str(e)}")
        raise


@router.post("/article/enhance-summary", response_model=ArticleEnhanceResponse)
async def enhance_article_summary(
    request: ArticleEnhanceRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Enhance article summary by scraping the full article content
    and using GPT to generate a comprehensive summary.
    """
    try:
        # Verify user authentication
        current_user = get_user_from_token(credentials.credentials)
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token"
            )
        
        logger.info(f"📰 Enhancing article: {request.article_title[:50]}...")
        
        # Step 1: Scrape the actual article content
        logger.info(f"🔍 Scraping article from: {request.article_url}")
        scrape_result = await scraper_service.scrape_article(request.article_url)
        
        # Check if scraping was successful
        if not scrape_result['success'] or not scrape_result['content']:
            logger.warning(f"⚠️ Scraping failed, using snippet fallback")
            article_content = request.article_snippet
            content_source = "snippet"
        else:
            article_content = scrape_result['content']
            content_source = "full_article"
            logger.info(f"✅ Scraped {len(article_content)} characters of content")
        
        # Cache result for reuse
        SCRAPE_CACHE[request.article_id] = scrape_result
        
        # Step 2: Generate enhanced summary using GPT
        if not OPENAI_AVAILABLE:
            return ArticleEnhanceResponse(
                success=False,
                enhanced_summary="AI summarization is currently unavailable. Please configure OpenAI API key.",
                key_points=[],
                reading_time="N/A",
                confidence_score=0,
                error="OpenAI API not configured"
            )
        
        # Prepare prompts
        system_prompt = """You are Mam'gobozi, a friendly and knowledgeable news assistant who helps people understand news articles better. 
        Your task is to create an enhanced summary that is informative, engaging, and easy to understand.
        Format your response as clean, single-spaced paragraphs without excessive formatting or line breaks."""
        
        user_prompt = f"""Please analyze this article and provide an enhanced summary:

Title: {request.article_title}
Category: {request.category}
Content Source: {content_source}

ARTICLE CONTENT:
{article_content[:8000]}

Please provide:
1. A comprehensive summary (2-3 paragraphs, 200-300 words) that captures the main story, key facts, and why this matters. Write in a conversational yet informative tone. Format as clean paragraphs with single spacing.

2. Extract 4-5 key takeaway points from the article.

3. Estimate the reading time for the full article.

Format your response as JSON with this structure:
{{
    "summary": "Your enhanced summary here as clean paragraphs",
    "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
    "reading_time": "X-Y min read"
}}"""

        try:
            # Call OpenAI API
            logger.info("🤖 Sending to GPT for enhancement...")
            gpt_response_text = await call_openai_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.7,
                max_tokens=800,
                json_response=True
            )
            
            # Parse the response
            try:
                gpt_response = json.loads(gpt_response_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, create a basic response
                gpt_response = {
                    "summary": gpt_response_text,
                    "key_points": [],
                    "reading_time": "3-5 min read"
                }
            
            # Calculate confidence score
            confidence_score = 95 if content_source == "full_article" else 70
            
            logger.info("✅ Successfully generated enhanced summary")
            
            return ArticleEnhanceResponse(
                success=True,
                enhanced_summary=gpt_response.get("summary", "Summary generation failed"),
                key_points=gpt_response.get("key_points", []),
                reading_time=gpt_response.get("reading_time", "3-5 min read"),
                confidence_score=confidence_score,
                scraped_content_preview=article_content[:500] if content_source == "full_article" else None
            )
            
        except Exception as gpt_error:
            logger.error(f"❌ GPT API error: {str(gpt_error)}")
            return ArticleEnhanceResponse(
                success=False,
                enhanced_summary="Failed to generate enhanced summary",
                key_points=[],
                reading_time="N/A",
                confidence_score=0,
                error=f"AI processing error: {str(gpt_error)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error enhancing article: {str(e)}")
        return ArticleEnhanceResponse(
            success=False,
            enhanced_summary="An error occurred while processing the article",
            key_points=[],
            reading_time="N/A",
            confidence_score=0,
            error=str(e)
        )


@router.post("/article/chat", response_model=ChatResponse)
async def chat_about_article(
    message: ChatMessage,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Chat with AI about a specific article using the full article content.
    """
    try:
        # Verify user authentication
        current_user = get_user_from_token(credentials.credentials)
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token"
            )
        
        logger.info(f"💬 Chat request for article {message.article_id}: {message.message[:50]}...")
        
        # Check if OpenAI is available
        if not OPENAI_AVAILABLE:
            return ChatResponse(
                success=False,
                response="I'm currently offline. Please configure the OpenAI API to enable chat functionality.",
                context_used=False,
                error="OpenAI API not configured"
            )
                
        # Try cache first
        scrape_result = SCRAPE_CACHE.get(message.article_id)

        if not scrape_result:
            logger.info(f"♻️ No cached scrape, scraping {message.article_url}")
            scrape_result = await scraper_service.scrape_article(message.article_url)
            if not scrape_result['success'] or not scrape_result['content']:
                logger.warning("⚠️ Scraping failed, using snippet fallback")
                article_content = message.article_snippet
                content_source = "snippet"
            else:
                article_content = scrape_result['content']
                content_source = "full_article"
                logger.info(f"✅ Scraped {len(article_content)} characters of content")
            # Save to cache
            SCRAPE_CACHE[message.article_id] = scrape_result
        else:
            logger.info(f"♻️ Using cached scrape for {message.article_id}")
            article_content = scrape_result['content']
            content_source = "full_article"
            logger.info(f"✅ Scraped {len(article_content)} characters of content")
            # Save to cache
            SCRAPE_CACHE[message.article_id] = scrape_result

        # Prepare prompts
        system_prompt = """You are Mam'gobozi, a friendly and insightful news assistant. 
        You help users understand news articles better by answering their questions, 
        providing additional context, and offering different perspectives.
        Keep responses conversational, informative, and formatted as clean single-spaced paragraphs."""
        
        context_prompt = f"""Article Context:
Title: {scrape_result.get('title', 'Unknown Title')}
Author: {scrape_result.get('author', 'Unknown Author')}
Published: {scrape_result.get('publish_date', 'Unknown Date')}

Article Content:
{article_content[:6000]}

Previous Context: {message.context if message.context else 'None'}

User Question: {message.message}

Please provide a helpful, informative response based on the article content. 
Format your response as clean, single-spaced paragraphs without excessive formatting."""

        try:
            # Get response from GPT
            ai_response = await call_openai_api(
                system_prompt=system_prompt,
                user_prompt=context_prompt,
                temperature=0.8,
                max_tokens=500,
                json_response=False
            )
            
            # Clean up formatting
            ai_response = ai_response.strip()
            import re
            ai_response = re.sub(r'\n{3,}', '\n\n', ai_response)
            ai_response = re.sub(r'\n\n+', '\n\n', ai_response)
            
            logger.info("✅ Chat response generated successfully")
            
            return ChatResponse(
                success=True,
                response=ai_response,
                context_used=content_available,
                error=None
            )
            
        except Exception as gpt_error:
            logger.error(f"❌ GPT chat error: {str(gpt_error)}")
            return ChatResponse(
                success=False,
                response="I encountered an error while processing your question. Please try again.",
                context_used=False,
                error=str(gpt_error)
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error in chat: {str(e)}")
        return ChatResponse(
            success=False,
            response="This is a placeHolder response, I can't read the article quite well, contact support, tell em to give me access to the tea!",
            context_used=False,
            error=str(e)
        )


@router.get("/article/scrape-test")
async def test_scraping(
    url: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Test endpoint to verify scraping functionality.
    """
    try:
        # Verify user authentication
        current_user = get_user_from_token(credentials.credentials)
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session token"
            )
        
        logger.info(f"🧪 Testing scraping for: {url}")
        
        # Scrape the article
        result = await scraper_service.scrape_article(url)
        
        # Return detailed results
        return {
            "success": result.get('success', False),
            "url": url,
            "title": result.get('title'),
            "author": result.get('author'),
            "publish_date": result.get('publish_date'),
            "content_length": len(result.get('content', '')) if result.get('content') else 0,
            "content_preview": result.get('content', '')[:1000] if result.get('content') else None,
            "error": result.get('error'),
            "openai_status": "Available" if OPENAI_AVAILABLE else "Not Available",
            "openai_version": OPENAI_VERSION
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Scraping test failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scraping test failed: {str(e)}"
        )