# Backend/app/routes/article_routes.py
"""
COMPLETE Article Routes with enhanced error handling and validation
Handles article processing with real web scraping and GPT integration.
MODIFIED: No authentication required for chat functionality
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
import os
import logging
from datetime import datetime
import json
import asyncio
import re

# Set up logging with more detailed formatting
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import OpenAI - handle different versions with better error handling
OPENAI_AVAILABLE = False
OPENAI_VERSION = None
client = None

try:
    # Try new OpenAI client (version 1.0+)
    from openai import OpenAI
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        client = OpenAI(api_key=api_key)
        OPENAI_AVAILABLE = True
        OPENAI_VERSION = "new"
        logger.info("✅ OpenAI client initialized (v1.0+)")
    else:
        logger.warning("⚠️ OpenAI API key not found in environment")
except ImportError:
    try:
        # Fall back to old OpenAI style (version < 1.0)
        import openai
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key:
            openai.api_key = api_key
            OPENAI_AVAILABLE = True
            OPENAI_VERSION = "legacy"
            logger.info("✅ OpenAI legacy client initialized")
        else:
            logger.warning("⚠️ OpenAI API key not found in environment")
    except ImportError:
        logger.warning("⚠️ OpenAI library not installed. AI features will be unavailable.")

# Import our services
try:
    from app.services.article_scraper_service import ArticleScraperService
    scraper_service = ArticleScraperService()
    logger.info("✅ Article scraper service initialized")
except ImportError as e:
    logger.error(f"❌ Failed to import scraper service: {e}")
    scraper_service = None

# Initialize router
router = APIRouter()

# In-memory cache for scraping results (in production, use Redis)
SCRAPE_CACHE: Dict[str, Any] = {}
CACHE_EXPIRY_HOURS = 24  # Cache scraping results for 24 hours

# ==========================================
# REQUEST/RESPONSE MODELS (EXACTLY AS PROVIDED)
# ==========================================

class ArticleEnhanceRequest(BaseModel):
    """
    FIXED: Enhanced request model with validation
    Field names exactly match what frontend sends
    """
    article_id: str = Field(..., min_length=1, description="Unique article identifier")
    article_url: str = Field(..., description="URL of the article to scrape")
    article_title: str = Field(..., min_length=1, description="Article headline")
    article_snippet: str = Field(..., description="Short article preview/summary")
    category: str = Field(..., min_length=1, description="Article category")

    @validator('article_url')
    def validate_url(cls, v):
        """Validate that article_url is a proper URL"""
        if not v:
            return v  # Allow empty URLs (will use snippet fallback)
        
        # Basic URL validation
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if not url_pattern.match(v):
            raise ValueError('Invalid URL format')
        return v

    @validator('category')
    def validate_category(cls, v):
        """Validate category is in allowed list"""
        allowed_categories = [
            'politics', 'sports', 'health', 'business', 'technology',
            'local-trends', 'weather', 'entertainment', 'education'
        ]
        if v.lower() not in allowed_categories:
            logger.warning(f"Unknown category: {v}")
            # Don't raise error, just log warning
        return v.lower()

class ArticleEnhanceResponse(BaseModel):
    """Enhanced response model with better structure"""
    success: bool
    enhanced_summary: str
    key_points: List[str]
    reading_time: str
    confidence_score: int = Field(..., ge=0, le=100)
    scraped_content_preview: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatMessage(BaseModel):
    """Chat message model with enhanced validation"""
    article_id: str = Field(..., min_length=1)
    article_url: str = Field(default="")  # Make optional with default
    message: str = Field(..., min_length=1, max_length=2000)
    context: Optional[str] = Field(default=None, max_length=5000)

class ChatResponse(BaseModel):
    """Chat response model"""
    success: bool
    response: str
    context_used: bool
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# ==========================================
# UTILITY FUNCTIONS (EXACTLY AS PROVIDED)
# ==========================================

def is_cache_valid(cache_entry: Dict[str, Any]) -> bool:
    """Check if cached scraping result is still valid"""
    if not cache_entry or 'timestamp' not in cache_entry:
        return False
    
    cache_time = datetime.fromisoformat(cache_entry['timestamp'])
    now = datetime.now()
    age_hours = (now - cache_time).total_seconds() / 3600
    
    return age_hours < CACHE_EXPIRY_HOURS

async def call_openai_api(
    system_prompt: str,
    user_prompt: str,
    json_response: bool = False
) -> str:
    """
    Enhanced OpenAI API call with better error handling
    Supports both new and legacy OpenAI client versions
    """
    if not OPENAI_AVAILABLE:
        raise Exception("OpenAI API is not available. Check API key configuration.")
    
    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        if OPENAI_VERSION == "new":
            # Use new OpenAI client
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    model="gpt-5",
                    messages=messages,
                )
            )
            return response.choices[0].message.content
            
        else:
            # Use legacy OpenAI client
            import openai
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: openai.ChatCompletion.create(
                    model="gpt-5",
                    messages=messages
                )
            )
            return response.choices[0].message.content
            
    except Exception as e:
        logger.error(f"❌ OpenAI API call failed: {str(e)}")
        raise Exception(f"AI processing failed: {str(e)}")

def create_fallback_response(
    request: ArticleEnhanceRequest, 
    error_message: str = "AI enhancement unavailable"
) -> ArticleEnhanceResponse:
    """Create a fallback response when AI enhancement fails"""
    
    # Create basic enhanced summary from snippet
    fallback_summary = f"""
{request.article_snippet}

This article discusses important developments in {request.category}. While our AI enhancement features are currently unavailable, the original content provides valuable information about recent events.

For complete details and the most up-to-date information, please visit the original source.
    """.strip()

    return ArticleEnhanceResponse(
        success=False,
        enhanced_summary=fallback_summary,
        key_points=[
            f"Key {request.category} development",
            "Original article content available",
            "Enhanced AI features temporarily unavailable",
            "Visit source for complete information"
        ],
        reading_time="3-4 min read",
        confidence_score=40,
        error=error_message,
        metadata={
            "fallback_used": True,
            "original_snippet_length": len(request.article_snippet),
            "timestamp": datetime.now().isoformat()
        }
    )

# ==========================================
# MAIN API ENDPOINTS - NO AUTHENTICATION REQUIRED
# ==========================================

@router.post("/article/enhance-summary", response_model=ArticleEnhanceResponse)
async def enhance_article_summary(request: ArticleEnhanceRequest):
    """
    ENHANCED: Enhance article summary by scraping full content and using AI
    NO AUTHENTICATION REQUIRED
    
    Features:
    - Proper request validation
    - Intelligent caching
    - Fallback mechanisms
    - Detailed error handling
    - Performance monitoring
    """
    start_time = datetime.now()
    
    try:
        logger.info(f"📰 Enhancement request: {request.article_title[:50]}... (ID: {request.article_id})")
        
        # Step 1: Check cache first
        cache_key = f"{request.article_id}_{hash(request.article_url)}"
        cached_result = SCRAPE_CACHE.get(cache_key)
        
        if cached_result and is_cache_valid(cached_result):
            logger.info(f"♻️ Using cached scraping result for {request.article_id}")
            scrape_result = cached_result
            content_source = "cached_full_article"
        else:
            # Step 2: Scrape the article content
            if scraper_service and request.article_url:
                logger.info(f"🔍 Scraping article from: {request.article_url}")
                scrape_result = await scraper_service.scrape_article(request.article_url)
                
                # Cache the result
                scrape_result['timestamp'] = datetime.now().isoformat()
                SCRAPE_CACHE[cache_key] = scrape_result
                
                # Clean old cache entries periodically
                if len(SCRAPE_CACHE) > 1000:
                    old_keys = list(SCRAPE_CACHE.keys())[:100]  # Remove oldest 100 entries
                    for key in old_keys:
                        del SCRAPE_CACHE[key]
                
                content_source = "scraped_full_article" if scrape_result.get('success') else "snippet_fallback"
            else:
                logger.warning(f"⚠️ Scraper not available or no URL provided, using snippet")
                scrape_result = {'success': False, 'content': None}
                content_source = "snippet_only"
        
        # Determine content to use for enhancement
        if scrape_result.get('success') and scrape_result.get('content'):
            article_content = scrape_result['content']
            logger.info(f"✅ Using scraped content: {len(article_content)} characters")
        else:
            article_content = request.article_snippet
            logger.info(f"⚠️ Using snippet fallback: {len(article_content)} characters")
        
        # Step 3: Generate enhanced summary using AI
        if not OPENAI_AVAILABLE:
            logger.warning("⚠️ OpenAI not available, returning fallback response")
            return create_fallback_response(request, "AI enhancement service unavailable")
        
        # Prepare AI prompts (EXACTLY AS PROVIDED)
        system_prompt = """You are **Umamgobhozi**, the ultimate storyteller who mixes the passion of street gossip with the professionalism of a news anchor.

Your role is to summarize and explain news articles in a way that feels like "spilling tea" — energetic, urgent, and dramatic — but always **truthful, accurate, and responsible**.

---

### 🎙️ Voice & Style

* Speak like a **mamgobhozi**: animated, conversational, dramatic, full of urgency, as if you can't wait to tell people what just happened.
* Use **African-style exclamations** and rhetorical flair.
* Paint vivid imagery — make the audience *see and feel* the story.
* Keep it **engaging but clear** — the listener must understand the story quickly.
* **Balance drama with wisdom**: educate while you entertain.

---

### 📰 Rules

1. **Accuracy first**: only summarize from the provided article or source.
2. **No invented gossip** — you "spill tea" but only the *verified truth*.
3. Keep summaries **short, punchy, and memorable**.
4. Add **context** if needed, so people not only hear the tea but also understand the whole pot.

---
---


Do not say 'my people', use pigin english or slang, use african exclamations only.
"""

        user_prompt = f"""Please analyze this article and provide an enhanced summary:

Title: {request.article_title}
Category: {request.category}
Content Source: {content_source}

ARTICLE CONTENT:
{article_content[:8000]}

Please provide your response as JSON with this exact structure:
{{
    "summary": "Your enhanced summary here (2-3 paragraphs, 200-300 words). Write in a conversational yet informative tone. Format as clean paragraphs.",
    "key_points": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
    "reading_time": "X-Y min read"
}}

Make the summary engaging and easy to understand while capturing the main story, key facts, and why this matters."""

        try:
            logger.info("🤖 Sending to AI for enhancement...")
            ai_response_text = await call_openai_api(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                json_response=True
            )
            
            # Parse AI response
            try:
                ai_response = json.loads(ai_response_text)
                logger.info("✅ AI response parsed successfully")
            except json.JSONDecodeError as e:
                logger.warning(f"⚠️ AI response not valid JSON: {e}")
                # Create structured response from text
                ai_response = {
                    "summary": ai_response_text,
                    "key_points": [f"Key insight about {request.category}", "Important development", "Significant implications"],
                    "reading_time": "3-5 min read"
                }
            
            # Calculate confidence score based on content source and AI success
            confidence_score = 95 if content_source.startswith("scraped") else 75
            if content_source == "cached_full_article":
                confidence_score = 90
            
            # Prepare metadata
            processing_time = (datetime.now() - start_time).total_seconds()
            metadata = {
                "content_source": content_source,
                "processing_time_seconds": round(processing_time, 2),
                "scraped_content_length": len(article_content),
                "ai_model_used": "gp-5",
                "cache_used": "cached" in content_source,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"✅ Enhancement completed in {processing_time:.2f}s")
            
            return ArticleEnhanceResponse(
                success=True,
                enhanced_summary=ai_response.get("summary", "Summary generation failed"),
                key_points=ai_response.get("key_points", []),
                reading_time=ai_response.get("reading_time", "3-5 min read"),
                confidence_score=confidence_score,
                scraped_content_preview=article_content[:500] if content_source.startswith("scraped") else None,
                metadata=metadata
            )
            
        except Exception as ai_error:
            logger.error(f"❌ AI processing error: {str(ai_error)}")
            return create_fallback_response(request, f"AI processing failed: {str(ai_error)}")
            
    except Exception as e:
        logger.error(f"❌ Unexpected error enhancing article {request.article_id}: {str(e)}")
        return create_fallback_response(request, f"System error: {str(e)}")

# Updated ChatMessage model to include article snippet
class ChatMessage(BaseModel):
    """Chat message model with enhanced validation"""
    article_id: str = Field(..., min_length=1)
    article_url: str = Field(default="")  # Make optional with default
    article_snippet: str = Field(default="", max_length=2000)  # NEW: Add snippet fallback
    message: str = Field(..., min_length=1, max_length=2000)
    context: Optional[str] = Field(default=None, max_length=5000)


@router.post("/article/chat", response_model=ChatResponse)
async def chat_about_article(message: ChatMessage):
    """
    ENHANCED: Chat with AI about a specific article
    NO AUTHENTICATION REQUIRED
    
    Features:
    - Uses full article content when available
    - ENHANCED: Falls back to article snippet when full content unavailable
    - Intelligent context management
    - Fallback responses
    - Conversation continuity
    """
    try:
        logger.info(f"💬 Chat request for article {message.article_id}: {message.message[:50]}...")
        
        # Check if AI is available
        if not OPENAI_AVAILABLE:
            return ChatResponse(
                success=False,
                response="I'm currently offline. Our AI chat service is temporarily unavailable. Please try again later.",
                context_used=False,
                error="OpenAI API not configured"
            )
        
        # Try to get article content (from cache or scraping)
        cache_key = f"{message.article_id}_{hash(message.article_url)}" if message.article_url else message.article_id
        cached_result = SCRAPE_CACHE.get(cache_key)
        
        if cached_result and is_cache_valid(cached_result) and cached_result.get('content'):
            article_content = cached_result['content']
            content_source = "cached_full_article"
            logger.info(f"♻️ Using cached content for chat context")
        elif scraper_service and message.article_url:
            logger.info(f"🔍 Scraping article for chat context: {message.article_url}")
            scrape_result = await scraper_service.scrape_article(message.article_url)
            if scrape_result.get('success') and scrape_result.get('content'):
                article_content = scrape_result['content']
                content_source = "scraped_full_article"
                # Cache for future use
                scrape_result['timestamp'] = datetime.now().isoformat()
                SCRAPE_CACHE[cache_key] = scrape_result
            else:
                # ENHANCED: Use article snippet as fallback
                if message.article_snippet:
                    article_content = message.article_snippet
                    content_source = "snippet_fallback"
                    logger.info(f"⚠️ Scraping failed, using article snippet fallback: {len(article_content)} chars")
                else:
                    article_content = "Article content not available"
                    content_source = "no_content"
                    logger.warning("⚠️ Failed to scrape article and no snippet provided")
        else:
            # ENHANCED: Use article snippet as fallback when scraper unavailable
            if message.article_snippet:
                article_content = message.article_snippet
                content_source = "snippet_fallback"
                logger.info(f"📝 Using article snippet for chat context: {len(article_content)} chars")
            else:
                article_content = "Article content not available"
                content_source = "no_content"
                logger.warning("⚠️ No article content or snippet available for chat context")
        
        # Determine if we have meaningful content
        content_available = content_source != "no_content"
        
        # Prepare chat prompts
        system_prompt = """You are **Umamgobhozi**, the ultimate storyteller who mixes the passion of street gossip with the professionalism of a news anchor.

Your role is to explain and dialogue with the user about news articles in a way that feels like "spilling tea" — energetic, urgent, and dramatic — but always **truthful, accurate, and responsible**.

---

### 🎙️ Voice & Style

* Speak like a **mamgobhozi**: animated, conversational, dramatic, full of urgency, as if you can't wait to tell people what just happened.
* Use **African-style exclamations** and rhetorical flair
* **Balance drama with wisdom**: educate while you entertain.

---

### 📰 Rules

1. **Accuracy first**: only summarize from the provided article or source.
2. **No invented gossip** — you "spill tea" but only the *verified truth*.
3. Keep summaries **short, punchy, and memorable**.
4. Add **context** if needed, so people not only hear the tea but also understand the whole pot.

---
---


Do not say 'my people', use pigin english or slang, use african exclamations only.
"""
        
        # Enhanced context info with snippet handling
        if content_available:
            content_type = {
                "cached_full_article": "full article content from cache",
                "scraped_full_article": "full article content from web scraping",
                "snippet_fallback": "article summary/snippet"
            }.get(content_source, "article content")
            
            context_info = f"""Article Context Available: Yes ({content_type})

ARTICLE CONTENT: {article_content[:6000]}

Previous Context: {message.context if message.context else 'None'}

User Question: {message.message}

Please provide a helpful, informative response based on the available article content. 
Keep your response conversational and under 300 words."""
        else:
            context_info = f"""Article Context Available: No

Previous Context: {message.context if message.context else 'None'}

User Question: {message.message}

I don't have access to the article content right now. Please acknowledge this limitation and offer to help in other ways, such as:
- Providing general information about the topic
- Explaining news concepts
- Suggesting questions to explore
Keep your response conversational and under 300 words."""

        try:
            # Get AI response
            ai_response = await call_openai_api(
                system_prompt=system_prompt,
                user_prompt=context_info,
                json_response=False
            )
            
            # Clean up response formatting
            ai_response = ai_response.strip()
            ai_response = re.sub(r'\n{3,}', '\n\n', ai_response)
            
            logger.info(f"✅ Chat response generated successfully using {content_source}")
            
            return ChatResponse(
                success=True,
                response=ai_response,
                context_used=content_available,
                metadata={
                    "content_source": content_source,
                    "article_content_available": content_available,
                    "response_length": len(ai_response),
                    "timestamp": datetime.now().isoformat()
                }
            )
            
        except Exception as ai_error:
            logger.error(f"❌ AI chat error: {str(ai_error)}")
            return ChatResponse(
                success=False,
                response="I'm having trouble processing your question right now. Please try rephrasing or try again in a moment.",
                context_used=False,
                error=str(ai_error)
            )
            
    except Exception as e:
        logger.error(f"❌ Error in chat: {str(e)}")
        return ChatResponse(
            success=False,
            response="Something went wrong while processing your message. Please try again.",
            context_used=False,
            error=str(e)
        )
@router.get("/article/health")
async def article_service_health():
    """
    Health check endpoint for article services
    NO AUTHENTICATION REQUIRED
    """
    health_status = {
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }
    
    # Check OpenAI availability
    health_status["services"]["openai"] = {
        "available": OPENAI_AVAILABLE,
        "version": OPENAI_VERSION,
        "configured": bool(os.getenv('OPENAI_API_KEY'))
    }
    
    # Check scraper service
    health_status["services"]["scraper"] = {
        "available": scraper_service is not None,
        "ready": hasattr(scraper_service, 'scrape_article') if scraper_service else False
    }
    
    # Check cache status
    health_status["services"]["cache"] = {
        "entries": len(SCRAPE_CACHE),
        "memory_usage_mb": round(len(str(SCRAPE_CACHE)) / 1024 / 1024, 2)
    }
    
    # Overall health
    all_healthy = (
        health_status["services"]["openai"]["available"] and
        health_status["services"]["scraper"]["available"]
    )
    
    health_status["overall"] = "healthy" if all_healthy else "degraded"
    
    return health_status