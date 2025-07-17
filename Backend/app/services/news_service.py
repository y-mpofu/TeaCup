# Backend/app/services/news_service.py
# Real news service using Google Custom Search API + Beautiful Soup + OpenAI

import asyncio
import aiohttp
import requests
from bs4 import BeautifulSoup
import openai
from typing import List, Dict, Optional, Any
from datetime import datetime
import os
from urllib.parse import urljoin, urlparse
import json
import logging
from dataclasses import dataclass
import re
import time
from dotenv import load_dotenv
load_dotenv()  # Now .env variables are loaded into environment

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NewsSource:
    """Single news source from Google search"""
    url: str
    title: str
    snippet: str
    source_name: str
    published_date: Optional[str] = None

@dataclass
class ProcessedArticle:
    """Fully processed news article with GPT summary"""
    id: str
    title: str
    summary: str  # This will contain embedded links
    category: str
    timestamp: str
    readTime: str
    isBreaking: bool
    imageUrl: Optional[str]
    sourceUrl: str
    source: str
    linked_sources: List[str]

class NewsService:
    """
    Complete news service that replaces mock data
    Uses Google Custom Search + Web Scraping + OpenAI for summaries
    """
    
    def __init__(self):
        # Load API keys from environment
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        
        # You'll need to create a Custom Search Engine and get this ID
        # Instructions will be provided below
        self.google_cse_id = os.getenv("GOOGLE_CSE_ID")
        
        # Initialize OpenAI
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        else:
            logger.warning("⚠️  OpenAI API key not found!")
        
        # Google Custom Search endpoint
        self.google_search_url = "https://www.googleapis.com/customsearch/v1"
        
        # Headers for web scraping (act like a real browser)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 0.1  # 100ms between requests
        
    def _wait_for_rate_limit(self):
        """Simple rate limiting to avoid overwhelming APIs"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()
    
    async def search_google_news(self, query: str, num_results: int = 10) -> List[NewsSource]:
        """
        Search Google for news articles using Custom Search API
        Returns list of NewsSource objects
        """
        try:
            logger.info(f"🔍 Searching Google for: '{query}' (wanting {num_results} results)")
            
            # Check API key
            if not self.google_api_key:
                logger.error("❌ Google API key not found in environment variables")
                return []
            
            # Build search parameters
            params = {
                'key': self.google_api_key,
                'cx': self.google_cse_id,
                'q': query,
                'num': min(num_results, 10),  # Google allows max 10 per request
                'dateRestrict': 'd3',  # Last 3 days for fresh news
                'sort': 'date',
                'siteSearch': 'bbc.com OR cnn.com OR reuters.com OR apnews.com OR npr.org',  # Focus on news sites
                'fileType': '',
                'lr': 'lang_en',  # English language results
            }
            
            # Add a small delay to respect rate limits
            self._wait_for_rate_limit()
            
            # Make the API request
            async with aiohttp.ClientSession() as session:
                async with session.get(self.google_search_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Check if we have results
                        if 'items' not in data:
                            logger.warning(f"⚠️  No results found for '{query}'")
                            return []
                        
                        # Parse results into NewsSource objects
                        sources = []
                        for item in data['items']:
                            try:
                                source = NewsSource(
                                    url=item.get('link', ''),
                                    title=item.get('title', ''),
                                    snippet=item.get('snippet', ''),
                                    source_name=self._extract_domain(item.get('link', '')),
                                    published_date=item.get('pagemap', {}).get('metatags', [{}])[0].get('article:published_time')
                                )
                                sources.append(source)
                            except Exception as e:
                                logger.warning(f"⚠️  Error parsing search result: {e}")
                                continue
                        
                        logger.info(f"✅ Found {len(sources)} news sources for '{query}'")
                        return sources
                    
                    elif response.status == 429:
                        logger.error("❌ Google API rate limit exceeded")
                        return []
                    else:
                        logger.error(f"❌ Google Search API error: {response.status}")
                        return []
                        
        except Exception as e:
            logger.error(f"❌ Error searching Google: {str(e)}")
            return []
    
    def _extract_domain(self, url: str) -> str:
        """Extract clean domain name from URL"""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            # Remove www. prefix
            if domain.startswith('www.'):
                domain = domain[4:]
            return domain
        except:
            return "Unknown Source"
    
    async def scrape_article_content(self, url: str) -> Optional[str]:
        """
        Scrape article content using Beautiful Soup
        Returns cleaned article text or None
        """
        try:
            logger.info(f"📰 Scraping content from: {url}")
            
            # Add delay for rate limiting
            self._wait_for_rate_limit()
            
            # Make request with proper headers
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, timeout=10) as response:
                    if response.status != 200:
                        logger.error(f"❌ Failed to fetch {url}: HTTP {response.status}")
                        return None
                    
                    html = await response.text()
                    
                    # Parse with Beautiful Soup
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Remove unwanted elements
                    for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', 'form', 'iframe']):
                        tag.decompose()
                    
                    # Try different selectors for article content
                    content_selectors = [
                        'article',
                        '[role="main"]',
                        '.article-content',
                        '.post-content',
                        '.entry-content',
                        '.story-body',
                        '.article-body',
                        'main',
                        '.content',
                        '.story-content'
                    ]
                    
                    article_text = ""
                    
                    # Try each selector
                    for selector in content_selectors:
                        elements = soup.select(selector)
                        if elements:
                            article_text = elements[0].get_text(strip=True)
                            break
                    
                    # If no specific content found, try paragraphs
                    if not article_text:
                        paragraphs = soup.find_all('p')
                        if paragraphs:
                            article_text = ' '.join([p.get_text(strip=True) for p in paragraphs])
                    
                    # Clean up the text
                    article_text = re.sub(r'\s+', ' ', article_text).strip()
                    
                    # Check if we got substantial content
                    if len(article_text) > 200:
                        logger.info(f"✅ Scraped {len(article_text)} characters from {url}")
                        return article_text
                    else:
                        logger.warning(f"⚠️  Insufficient content from {url} (only {len(article_text)} chars)")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error scraping {url}: {str(e)}")
            return None
    
    async def create_summary_with_openai(self, sources_data: List[Dict], topic: str) -> str:
        """
        Create embedded summary using OpenAI
        Returns summary with embedded source links
        """
        try:
            logger.info(f"🤖 Creating OpenAI summary for {len(sources_data)} sources about '{topic}'")
            
            if not self.openai_api_key:
                logger.error("❌ OpenAI API key not available")
                return "Summary unavailable - OpenAI API key not configured"
            
            # Prepare content for OpenAI
            sources_text = ""
            for i, source in enumerate(sources_data, 1):
                sources_text += f"\n--- Source {i}: {source['title']} ---\n"
                sources_text += f"URL: {source['url']}\n"
                sources_text += f"Source: {source['source']}\n"
                sources_text += f"Content: {source['content'][:1500]}...\n"  # Limit to avoid token limits
            
            # Create prompt for OpenAI
            prompt = f"""
            Create a comprehensive news summary about "{topic}" using the following sources.
            
            Requirements:
            1. Write 2-3 paragraphs (200-300 words total)
            2. Include embedded links using this format: [link text](URL)
            3. Make it engaging and informative
            4. Combine information from multiple sources
            5. Highlight key developments and facts
            6. Use professional news writing style
            7. Include at least 3-4 embedded links to sources
            
            Sources:
            {sources_text}
            
            Write the summary now:
            """
            
            # Make OpenAI API call
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional news writer. Create engaging summaries with embedded source links."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,
                temperature=0.7
            )
            
            summary = response.choices[0].message.content.strip()
            logger.info(f"✅ OpenAI summary created successfully ({len(summary)} chars)")
            return summary
            
        except Exception as e:
            logger.error(f"❌ OpenAI error: {str(e)}")
            # Return a basic summary without OpenAI
            return self._create_basic_summary(sources_data, topic)
    
    def _create_basic_summary(self, sources_data: List[Dict], topic: str) -> str:
        """
        Fallback summary creation without OpenAI
        """
        if not sources_data:
            return f"No recent news found about {topic}."
        
        summary_parts = []
        for i, source in enumerate(sources_data[:3]):  # Use first 3 sources
            title = source['title']
            url = source['url']
            source_name = source['source']
            
            summary_parts.append(f"[{title}]({url}) from {source_name}")
        
        return f"Latest news about {topic}:\n\n" + "\n\n".join(summary_parts)
    
    def _calculate_reading_time(self, text: str) -> str:
        """Calculate reading time based on word count"""
        words = len(text.split())
        minutes = max(1, round(words / 200))  # 200 words per minute
        return f"{minutes} min read"
    
    def _detect_breaking_news(self, title: str, content: str) -> bool:
        """Simple breaking news detection"""
        breaking_keywords = [
            'breaking', 'urgent', 'just in', 'developing', 'live', 
            'alert', 'update', 'emergency', 'major', 'significant'
        ]
        
        text_to_check = (title + ' ' + content).lower()
        return any(keyword in text_to_check for keyword in breaking_keywords)
    
    async def get_news_for_category(self, category: str, max_articles: int = 3) -> List[ProcessedArticle]:
        """
        Main function: Get processed news for a category
        This completely replaces mock data
        """
        try:
            logger.info(f"📡 Getting REAL news for category: {category} (max: {max_articles})")
            
            # Map categories to search queries
            search_queries = {
                'politics': 'politics news government election',
                'sports': 'sports news games results',
                'health': 'health news medical healthcare',
                'business': 'business news economy finance',
                'technology': 'technology news tech innovation',
                'local-trends': 'trending news viral social media',
                'weather': 'weather news climate forecast',
                'entertainment': 'entertainment news celebrity movies',
                'education': 'education news schools university'
            }
            
            query = search_queries.get(category, f'{category} news')
            
            # Step 1: Search Google for news sources
            sources = await self.search_google_news(query, max_articles * 3)  # Get extra to account for scraping failures
            
            if not sources:
                logger.warning(f"⚠️  No sources found for {category}")
                return []
            
            # Step 2: Scrape content from sources
            scraped_articles = []
            for source in sources[:max_articles * 2]:  # Try more than we need
                content = await self.scrape_article_content(source.url)
                if content:
                    scraped_articles.append({
                        'title': source.title,
                        'content': content,
                        'url': source.url,
                        'source': source.source_name,
                        'snippet': source.snippet
                    })
                    
                    # Stop when we have enough
                    if len(scraped_articles) >= max_articles:
                        break
            
            if not scraped_articles:
                logger.warning(f"⚠️  No content could be scraped for {category}")
                return []
            
            # Step 3: Create summary with OpenAI
            summary = await self.create_summary_with_openai(scraped_articles, f"{category} news")
            
            # Step 4: Create the processed article
            first_article = scraped_articles[0]
            is_breaking = self._detect_breaking_news(first_article['title'], first_article['content'])
            
            processed_article = ProcessedArticle(
                id=f"{category}_{int(time.time())}",
                title=f"Latest {category.replace('-', ' ').title()} News",
                summary=summary,
                category=category,
                timestamp=datetime.now().isoformat(),
                readTime=self._calculate_reading_time(summary),
                isBreaking=is_breaking,
                imageUrl=None,  # Could add image extraction later
                sourceUrl=first_article['url'],
                source=first_article['source'],
                linked_sources=[article['url'] for article in scraped_articles]
            )
            
            logger.info(f"✅ Successfully processed {category} news with {len(scraped_articles)} sources")
            return [processed_article]
            
        except Exception as e:
            logger.error(f"❌ Error processing {category} news: {str(e)}")
            return []
    
    async def search_news(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search for news articles by query
        Returns list of article dictionaries
        """
        try:
            logger.info(f"🔍 Searching for news: '{query}'")
            
            # Search Google
            sources = await self.search_google_news(query, max_results)
            
            if not sources:
                return []
            
            # Convert to article format
            articles = []
            for i, source in enumerate(sources):
                article = {
                    'id': f"search_{hash(query)}_{i}_{int(time.time())}",
                    'title': source.title,
                    'summary': source.snippet,
                    'category': 'search',
                    'timestamp': datetime.now().isoformat(),
                    'readTime': '2 min read',
                    'isBreaking': False,
                    'imageUrl': None,
                    'sourceUrl': source.url,
                    'source': source.source_name,
                    'linked_sources': [source.url]
                }
                articles.append(article)
            
            logger.info(f"✅ Found {len(articles)} search results for '{query}'")
            return articles
            
        except Exception as e:
            logger.error(f"❌ Error searching for '{query}': {str(e)}")
            return []

# Create singleton instance
news_service = NewsService()