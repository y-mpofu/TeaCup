# Backend/app/services/news_service.py
# Fixed news service - uses Google search snippets instead of full scraping

import asyncio
import aiohttp
import openai
from typing import List, Dict, Optional
from datetime import datetime
import os
from urllib.parse import urlparse
import logging
from dataclasses import dataclass
import time
from dotenv import load_dotenv

load_dotenv()

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
    """Fully processed news article"""
    id: str
    title: str
    summary: str
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
    Fixed news service that uses Google search snippets
    Much more reliable than web scraping
    """
    
    def __init__(self):
        # Load API keys
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        self.google_cse_id = os.getenv("GOOGLE_CSE_ID")
        
        # Initialize OpenAI
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Google Custom Search endpoint
        self.google_search_url = "https://www.googleapis.com/customsearch/v1"
        
        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 0.1
        
    def _wait_for_rate_limit(self):
        """Simple rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < self.min_request_interval:
            time.sleep(self.min_request_interval - time_since_last)
        self.last_request_time = time.time()
    
    async def search_google_news(self, query: str, num_results: int = 10) -> List[NewsSource]:
        """
        Search Google for news articles using Custom Search API
        """
        try:
            logger.info(f"🔍 Searching Google for: '{query}' (wanting {num_results} results)")
            
            if not self.google_api_key:
                logger.error("❌ Google API key not found")
                return []
            
            # Build search parameters for Zimbabwe-focused news
            params = {
                'key': self.google_api_key,
                'cx': self.google_cse_id,
                'q': f"{query} Zimbabwe news",  # Focus on Zimbabwe
                'num': min(num_results, 10),
                'dateRestrict': 'd7',  # Last 7 days for more Zimbabwe content
                'sort': 'date',
                'lr': 'lang_en',
                'gl': 'zw',  # Geographic location: Zimbabwe
                'cr': 'countryZW',  # Country restrict to Zimbabwe
            }
            
            self._wait_for_rate_limit()
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.google_search_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if 'items' not in data:
                            logger.warning(f"⚠️  No results found for '{query}'")
                            return []
                        
                        sources = []
                        for item in data['items']:
                            try:
                                # Clean up the title and snippet
                                title = item.get('title', '').replace(' - ' + self._extract_domain(item.get('link', '')), '')
                                snippet = item.get('snippet', '')
                                
                                source = NewsSource(
                                    url=item.get('link', ''),
                                    title=title,
                                    snippet=snippet,
                                    source_name=self._extract_domain(item.get('link', ''))
                                )
                                sources.append(source)
                            except Exception as e:
                                logger.warning(f"⚠️  Error parsing search result: {e}")
                                continue
                        
                        logger.info(f"✅ Found {len(sources)} news sources for '{query}'")
                        return sources
                    
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
            if domain.startswith('www.'):
                domain = domain[4:]
            return domain.title()  # Make it look nicer
        except:
            return "News Source"
    
    async def create_summary_from_snippets(self, sources: List[NewsSource], topic: str) -> str:
        """
        Create a summary using Google search snippets and OpenAI
        Much more reliable than web scraping
        """
        try:
            logger.info(f"🤖 Creating summary from {len(sources)} sources about '{topic}'")
            
            if not self.openai_api_key:
                logger.warning("⚠️  OpenAI not available, using basic summary")
                return self._create_basic_summary_from_snippets(sources, topic)
            
            # Prepare snippets for OpenAI
            snippets_text = ""
            for i, source in enumerate(sources[:5], 1):  # Use top 5 sources
                snippets_text += f"\nSource {i} - {source.source_name}:\n"
                snippets_text += f"Title: {source.title}\n"
                snippets_text += f"Snippet: {source.snippet}\n"
                snippets_text += f"URL: {source.url}\n"
            
            # Create prompt for OpenAI
            prompt = f"""
            Create a comprehensive news summary about "{topic}" using these news snippets.
            
            Requirements:
            1. Write 2-3 engaging paragraphs (200-250 words)
            2. Include embedded links using this format: [text](URL)
            3. Combine information from multiple sources
            4. Make it informative and well-written
            5. Include 3-4 source links throughout the text
            6. Focus on the most important and recent developments
            
            News snippets:
            {snippets_text}
            
            Write the summary now:
            """
            
            # Call OpenAI
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional news writer. Create engaging summaries with embedded source links."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            summary = response.choices[0].message.content.strip()
            logger.info(f"✅ OpenAI summary created successfully")
            return summary
            
        except Exception as e:
            logger.error(f"❌ OpenAI error: {str(e)}")
            return self._create_basic_summary_from_snippets(sources, topic)
    
    def _create_basic_summary_from_snippets(self, sources: List[NewsSource], topic: str) -> str:
        """
        Create a basic summary without OpenAI using just the snippets
        """
        if not sources:
            return f"No recent news found about {topic}."
        
        # Create summary from snippets
        summary_parts = []
        for i, source in enumerate(sources[:3]):
            title = source.title
            snippet = source.snippet
            url = source.url
            source_name = source.source_name
            
            # Combine title and snippet for a richer summary
            if snippet and len(snippet) > 50:
                summary_parts.append(f"[{title}]({url}) - {snippet} (Source: {source_name})")
            else:
                summary_parts.append(f"[{title}]({url}) from {source_name}")
        
        intro = f"Latest updates on {topic}:\n\n"
        return intro + "\n\n".join(summary_parts)
    
    def _calculate_reading_time(self, text: str) -> str:
        """Calculate reading time"""
        words = len(text.split())
        minutes = max(1, round(words / 200))
        return f"{minutes} min read"
    
    def _detect_breaking_news(self, title: str, snippet: str) -> bool:
        """Detect breaking news from title and snippet"""
        breaking_keywords = [
            'breaking', 'urgent', 'just in', 'developing', 'live', 
            'alert', 'update', 'emergency', 'major', 'significant'
        ]
        
        text_to_check = (title + ' ' + snippet).lower()
        return any(keyword in text_to_check for keyword in breaking_keywords)
    
    async def get_news_for_category(self, category: str, max_articles: int = 12) -> List[ProcessedArticle]:
        """
        Get processed news for a category using search snippets
        Creates INDIVIDUAL articles for each source (not one combined summary)
        """
        try:
            logger.info(f"📡 Getting REAL news for category: {category} (max: {max_articles})")
            
            # Zimbabwe-focused search queries for better local relevance
            search_queries = {
                'politics': 'Zimbabwe politics government ZANU-PF CCC election policy Blessed Geza',
                'sports': 'Zimbabwe sports cricket rugby football soccer Warriors',
                'health': 'Zimbabwe health medical healthcare hospitals clinics',
                'business': 'Zimbabwe business economy ZSE stock exchange mining agriculture',
                'technology': 'Zimbabwe technology innovation digital transformation ICT',
                'local-trends': 'Zimbabwe trending social media local news events',
                'weather': 'Zimbabwe weather climate forecast rain season',
                'entertainment': 'Zimbabwe entertainment music movies celebrities arts',
                'education': 'Zimbabwe education schools universities ZIMSEC'
            }
            
            query = search_queries.get(category, f'{category} news')
            
            # Search Google for news sources
            sources = await self.search_google_news(query, max_articles * 3)  # Get extra sources
            
            if not sources:
                logger.warning(f"⚠️  No sources found for {category}")
                return []
            
            # Create INDIVIDUAL articles for each source (not one combined summary)
            processed_articles = []
            
            for i, source in enumerate(sources[:max_articles]):
                try:
                    # Create individual article for each source
                    is_breaking = self._detect_breaking_news(source.title, source.snippet)
                    
                    # Enhanced snippet as summary (could be improved with OpenAI for individual articles)
                    summary = await self._create_individual_summary(source, category)
                    
                    processed_article = ProcessedArticle(
                        id=f"{category}_{i}_{int(time.time())}",
                        title=source.title,  # Use the actual news title
                        summary=summary,
                        category=self._format_category_for_frontend(category),  # Format for frontend
                        timestamp=datetime.now().isoformat(),
                        readTime=self._calculate_reading_time(summary),
                        isBreaking=is_breaking,
                        imageUrl=None,
                        sourceUrl=source.url,
                        source=source.source_name,
                        linked_sources=[source.url]
                    )
                    
                    processed_articles.append(processed_article)
                    
                except Exception as e:
                    logger.warning(f"⚠️  Error processing source {i}: {e}")
                    continue
            
            logger.info(f"✅ Successfully created {len(processed_articles)} individual articles for {category}")
            return processed_articles
            
        except Exception as e:
            logger.error(f"❌ Error processing {category} news: {str(e)}")
            return []
    
    async def _create_individual_summary(self, source: NewsSource, category: str) -> str:
        """
        Create a summary for an individual article
        Uses the snippet and optionally enhances it with OpenAI
        """
        try:
            # If snippet is good enough, use it directly
            if len(source.snippet) > 100:
                return f"{source.snippet}\n\n[Read full article at {source.source_name}]({source.url})"
            
            # If OpenAI is available and snippet is short, enhance it
            if self.openai_api_key and len(source.snippet) < 100:
                prompt = f"""
                Create a brief news summary (100-150 words) for this article:
                
                Title: {source.title}
                Snippet: {source.snippet}
                Source: {source.source_name}
                Category: {category}
                
                Make it informative and engaging. Include a link to the source at the end.
                """
                
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a news writer. Create brief, engaging summaries."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=200,
                    temperature=0.7
                )
                
                enhanced_summary = response.choices[0].message.content.strip()
                return f"{enhanced_summary}\n\n[Read more at {source.source_name}]({source.url})"
            
            # Fallback: use snippet as-is
            return f"{source.snippet}\n\n[Read full article at {source.source_name}]({source.url})"
            
        except Exception as e:
            logger.warning(f"⚠️  Error creating individual summary: {e}")
            return f"{source.snippet}\n\n[Read more at {source.source_name}]({source.url})"
    
    def _format_category_for_frontend(self, category: str) -> str:
        """
        Format category names to match frontend CSS classes
        Backend: 'politics' -> Frontend: 'Politics'
        Backend: 'local-trends' -> Frontend: 'Local Trends'
        """
        category_mapping = {
            'politics': 'Politics',
            'sports': 'Sports', 
            'health': 'Health',
            'business': 'Business',
            'technology': 'Technology',
            'local-trends': 'Local Trends',
            'weather': 'Weather',
            'entertainment': 'Entertainment',
            'education': 'Education'
        }
        
        return category_mapping.get(category, category.title())
    
    async def search_news(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search for news articles by query using snippets
        """
        try:
            logger.info(f"🔍 Searching for news: '{query}'")
            
            sources = await self.search_google_news(query, max_results)
            
            if not sources:
                return []
            
            # Convert to article format using snippets
            articles = []
            for i, source in enumerate(sources):
                article = {
                    'id': f"search_{hash(query)}_{i}_{int(time.time())}",
                    'title': source.title,
                    'summary': source.snippet,
                    'category': 'Search',  # Format for frontend
                    'timestamp': datetime.now().isoformat(),
                    'readTime': '2 min read',
                    'isBreaking': self._detect_breaking_news(source.title, source.snippet),
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