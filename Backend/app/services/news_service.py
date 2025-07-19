# Backend/app/services/news_service.py
# Enhanced existing news service with exponential backoff and better error handling

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
import random
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
    Enhanced news service with exponential backoff and fallback data
    Keeps all existing Zimbabwe-focused functionality
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
        
        # Enhanced rate limiting and retry configuration
        self.last_request_time = 0
        self.min_request_interval = 0.1
        self.max_retries = 3  # Maximum number of retry attempts
        self.base_delay = 1   # Base delay for exponential backoff (seconds)
        
        # OpenAI-specific rate limiting
        self.last_openai_request_time = 0
        self.min_openai_interval = 1.0  # 1 second between OpenAI requests
        self.openai_max_retries = 3
        
    async def _wait_for_openai_rate_limit(self):
        """Rate limiting specifically for OpenAI API calls"""
        current_time = time.time()
        time_since_last = current_time - self.last_openai_request_time
        
        if time_since_last < self.min_openai_interval:
            wait_time = self.min_openai_interval - time_since_last
            logger.info(f"🤖 OpenAI rate limiting: waiting {wait_time:.1f}s...")
            await asyncio.sleep(wait_time)
        
        self.last_openai_request_time = time.time()

    async def call_openai_with_backoff(self, messages: list, max_tokens: int = 400, temperature: float = 0.7, retries: int = None) -> Optional[str]:
        """
        Call OpenAI API with exponential backoff and rate limiting
        Handles rate limits, token limits, and other OpenAI-specific errors
        """
        if not self.openai_api_key:
            logger.warning("⚠️  OpenAI API key not available")
            return None
            
        if retries is None:
            retries = self.openai_max_retries
            
        for attempt in range(retries + 1):
            try:
                # OpenAI-specific rate limiting
                await self._wait_for_openai_rate_limit()
                
                logger.info(f"🤖 OpenAI API call attempt {attempt + 1}/{retries + 1}")
                
                # Make OpenAI API call
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                
                content = response.choices[0].message.content.strip()
                logger.info(f"✅ OpenAI API call successful!")
                return content
                
            except openai.error.RateLimitError as e:
                if attempt < retries:
                    # OpenAI rate limit - use exponential backoff
                    delay = self.base_delay * (2 ** attempt) + random.uniform(0, 1)
                    logger.warning(f"⏳ OpenAI rate limit hit. Retrying in {delay:.1f}s... (attempt {attempt + 1}/{retries + 1})")
                    await asyncio.sleep(delay)
                    continue
                else:
                    logger.error(f"❌ OpenAI rate limit exceeded after {retries + 1} attempts")
                    return None
                    
            except openai.error.InvalidRequestError as e:
                # Invalid request - don't retry
                logger.error(f"❌ OpenAI invalid request: {str(e)}")
                return None
                
            except openai.error.AuthenticationError as e:
                # Authentication error - don't retry
                logger.error(f"❌ OpenAI authentication error: {str(e)}")
                return None
                
            except openai.error.ServiceUnavailableError as e:
                if attempt < retries:
                    # Service unavailable - retry with backoff
                    delay = self.base_delay * (2 ** attempt)
                    logger.warning(f"⏳ OpenAI service unavailable. Retrying in {delay}s...")
                    await asyncio.sleep(delay)
                    continue
                else:
                    logger.error(f"❌ OpenAI service unavailable after {retries + 1} attempts")
                    return None
                    
            except openai.error.APIError as e:
                if attempt < retries:
                    # API error - retry with backoff
                    delay = self.base_delay * (2 ** attempt)
                    logger.warning(f"⏳ OpenAI API error. Retrying in {delay}s... Error: {str(e)}")
                    await asyncio.sleep(delay)
                    continue
                else:
                    logger.error(f"❌ OpenAI API error after {retries + 1} attempts: {str(e)}")
                    return None
                    
            except Exception as e:
                logger.error(f"❌ Unexpected OpenAI error: {str(e)}")
                if attempt < retries:
                    delay = self.base_delay * (2 ** attempt)
                    await asyncio.sleep(delay)
                    continue
                else:
                    return None
        
        return None

    async def call_google_api_with_backoff(self, params: dict, retries: int = None) -> Optional[dict]:
        """
        Enhanced Google API call with exponential backoff
        Handles rate limits (429) and other errors gracefully
        """
        if retries is None:
            retries = self.max_retries
            
        for attempt in range(retries + 1):
            try:
                # Rate limiting - ensure we don't make requests too quickly
                self._wait_for_rate_limit()
                
                logger.info(f"🔍 Google API call attempt {attempt + 1}/{retries + 1} for query: {params.get('q', 'unknown')}")
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(self.google_search_url, params=params) as response:
                        
                        # Success case
                        if response.status == 200:
                            data = await response.json()
                            logger.info(f"✅ Google API call successful!")
                            return data
                        
                        # Rate limit case - use exponential backoff
                        elif response.status == 429:
                            if attempt < retries:
                                # Calculate exponential backoff delay with jitter
                                delay = self.base_delay * (2 ** attempt) + random.uniform(0, 1)
                                logger.warning(f"⏳ Rate limit hit (429). Retrying in {delay:.1f}s... (attempt {attempt + 1}/{retries + 1})")
                                await asyncio.sleep(delay)
                                continue
                            else:
                                logger.error(f"❌ Rate limit exceeded after {retries + 1} attempts")
                                return None
                        
                        # Other HTTP errors
                        else:
                            error_text = await response.text()
                            logger.error(f"❌ Google API error {response.status}: {error_text}")
                            
                            # For certain errors, don't retry
                            if response.status in [400, 401, 403]:
                                logger.error("❌ Non-retryable error, stopping attempts")
                                return None
                            
                            # For other errors, retry with backoff
                            if attempt < retries:
                                delay = self.base_delay * (2 ** attempt)
                                logger.warning(f"⏳ Retrying in {delay}s due to error {response.status}")
                                await asyncio.sleep(delay)
                                continue
                            else:
                                return None
                                
            except asyncio.TimeoutError:
                if attempt < retries:
                    delay = self.base_delay * (2 ** attempt)
                    logger.warning(f"⏳ Request timeout. Retrying in {delay}s...")
                    await asyncio.sleep(delay)
                    continue
                else:
                    logger.error("❌ Request timed out after all retries")
                    return None
                    
            except Exception as e:
                logger.error(f"❌ Unexpected error in Google API call: {str(e)}")
                if attempt < retries:
                    delay = self.base_delay * (2 ** attempt)
                    await asyncio.sleep(delay)
                    continue
                else:
                    return None
        
        return None

    def _create_fallback_sources(self, query: str, num_results: int) -> List[NewsSource]:
        """
        Create fallback news sources when API fails
        Zimbabwe-focused fallback data
        """
        logger.info(f"📰 Creating fallback news sources for '{query}'")
        
        # Zimbabwe-focused fallback data
        fallback_data = {
            'politics': [
                ("ZANU-PF Party Meeting Discusses Policy Changes", "Government officials meet to discuss new policy implementations affecting citizens across Zimbabwe..."),
                ("Parliament Debates New Economic Measures", "Parliamentary session focuses on economic recovery strategies and budget allocations..."),
                ("Local Government Elections Preparation Underway", "Electoral commission announces preparations for upcoming local authority elections..."),
            ],
            'sports': [
                ("Zimbabwe Warriors Prepare for Upcoming Match", "National football team intensifies training ahead of crucial international fixture..."),
                ("Cricket Zimbabwe Announces Squad Selection", "New players selected for international cricket series representing Zimbabwe..."),
                ("Local Football League Results and Standings", "Latest scores and updates from Zimbabwe Premier Soccer League matches..."),
            ],
            'business': [
                ("ZSE Market Performance Shows Mixed Results", "Zimbabwe Stock Exchange displays varied performance across different sectors..."),
                ("Mining Sector Reports Production Increases", "Local mining companies announce improved output in key mineral exports..."),
                ("Agricultural Season Shows Promising Yields", "Farmers across Zimbabwe report encouraging crop production this season..."),
            ],
            'technology': [
                ("Digital Transformation Initiatives Launch", "Government and private sector collaborate on technology advancement programs..."),
                ("Telecommunications Infrastructure Expansion", "Mobile network operators invest in improved connectivity across Zimbabwe..."),
                ("Local Tech Startups Gain International Recognition", "Young entrepreneurs showcase innovative solutions at technology expo..."),
            ],
            'health': [
                ("Health Ministry Updates Vaccination Programs", "Public health officials announce expanded immunization coverage across provinces..."),
                ("Medical Facilities Receive Equipment Upgrades", "Hospitals and clinics benefit from new medical technology installations..."),
                ("Community Health Workers Training Program", "Healthcare professionals participate in skills development initiatives..."),
            ],
            'entertainment': [
                ("Local Musicians Release New Albums", "Zimbabwean artists showcase diverse musical talents in latest productions..."),
                ("Film Festival Celebrates Local Talent", "Creative industry professionals gather to promote Zimbabwean cinema..."),
                ("Cultural Events Promote Heritage Preservation", "Traditional arts and crafts receive recognition at cultural celebrations..."),
            ],
            'education': [
                ("Universities Announce New Academic Programs", "Higher education institutions introduce courses aligned with industry needs..."),
                ("ZIMSEC Releases Examination Guidelines", "Education authorities provide updated information for upcoming examinations..."),
                ("School Infrastructure Development Projects", "Government invests in classroom construction and renovation programs..."),
            ]
        }
        
        # Get appropriate fallback data based on query
        category_key = None
        for key in fallback_data.keys():
            if key in query.lower():
                category_key = key
                break
        
        if not category_key:
            # Generic fallback
            category_data = [
                (f"Latest {query.title()} News Update", f"Recent developments in {query} show interesting trends across Zimbabwe..."),
                (f"{query.title()} Sector Analysis", f"Expert analysis of current {query} conditions in Zimbabwe..."),
                (f"Breaking {query.title()} Story", f"Important news affecting {query} community in Zimbabwe today..."),
            ]
        else:
            category_data = fallback_data[category_key]
        
        sources = []
        for i, (title, snippet) in enumerate(category_data[:num_results]):
            source = NewsSource(
                url=f"https://zimbabwe-news.com/{query.replace(' ', '-')}-{i+1}",
                title=title,
                snippet=snippet,
                source_name="Zimbabwe News",
                published_date=datetime.now().isoformat()
            )
            sources.append(source)
        
        logger.info(f"✅ Created {len(sources)} fallback sources for '{query}'")
        return sources
    
    async def search_google_news(self, query: str, num_results: int = 10) -> List[NewsSource]:
        """
        Enhanced Google search with exponential backoff and fallback
        """
        try:
            logger.info(f"🔍 Searching Google for: '{query}' (wanting {num_results} results)")
            
            if not self.google_api_key:
                logger.warning("⚠️  Google API key not found, using fallback data")
                return self._create_fallback_sources(query, num_results)
            
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
            
            # Use enhanced API call with backoff
            data = await self.call_google_api_with_backoff(params)
            
            if not data:
                logger.warning(f"⚠️  Google API failed, using fallback for '{query}'")
                return self._create_fallback_sources(query, num_results)
            
            if 'items' not in data:
                logger.warning(f"⚠️  No results found for '{query}', using fallback")
                return self._create_fallback_sources(query, num_results)
            
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
            
            if not sources:
                logger.warning(f"⚠️  No valid sources found, using fallback for '{query}'")
                return self._create_fallback_sources(query, num_results)
            
            logger.info(f"✅ Found {len(sources)} news sources for '{query}'")
            return sources
                        
        except Exception as e:
            logger.error(f"❌ Error searching Google: {str(e)}")
            return self._create_fallback_sources(query, num_results)
    
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
            'breaking', 'just in', 'crisis', 'developing'
        ]
        
        text_to_check = (title + ' ' + snippet).lower()
        return any(keyword in text_to_check for keyword in breaking_keywords)
    
    async def get_news_for_category(self, category: str, max_articles: int = 12) -> List[ProcessedArticle]:
        """
        Enhanced news retrieval with fallback support
        Creates INDIVIDUAL articles for each source (not one combined summary)
        """
        try:
            logger.info(f"📡 Getting REAL news for category: {category} (max: {max_articles})")
            
            # Zimbabwe-focused search queries for better local relevance
            search_queries = {
                'politics': 'Zimbabwe politics government ZANU-PF CCC election policy',
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
            
            # Enhanced search with fallback
            sources = await self.search_google_news(query, max_articles * 3)  # Get extra sources
            
            if not sources:
                logger.warning(f"⚠️  No sources found for {category}, creating fallback articles")
                sources = self._create_fallback_sources(query, max_articles)
            
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
                return f"{source.snippet}\n\nRead full article at {source.source_name}({source.url})"
            
            # If OpenAI is available and snippet is short, enhance it
            if self.openai_api_key and len(source.snippet) < 100:
                prompt = f"""
                Create a brief news summary (100-150 words) for this article:
                
                Title: {source.title}
                Snippet: {source.snippet}
                Source: {source.source_name}
                Category: {category}

                Make it informative and engaging. Gen z-ish, but accessible to older people and serious enough to maintain the gravity of news reports. Include a link to the source at the end.
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
                return f"{enhanced_summary}\n\nRead more at {source.source_name}({source.url})"
            
            # Fallback: use snippet as-is
            return f"{source.snippet}\n\nRead full article at {source.source_name}({source.url})"
            
        except Exception as e:
            logger.warning(f"⚠️  Error creating individual summary: {e}")
            return f"{source.snippet}\n\nRead more at {source.source_name}({source.url})"
    
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
        Enhanced search with fallback support
        """
        try:
            logger.info(f"🔍 Searching for news: '{query}'")
            
            sources = await self.search_google_news(query, max_results)
            
            if not sources:
                sources = self._create_fallback_sources(query, max_results)
            
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