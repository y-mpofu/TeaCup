# # Backend/app/services/news_service.py
# # Fixed news service - uses Google search snippets instead of full scraping

# import asyncio
# import aiohttp
# import openai
# from typing import List, Dict, Optional
# from datetime import datetime
# import os
# from urllib.parse import urlparse
# import logging
# from dataclasses import dataclass
# import time
# from dotenv import load_dotenv

# load_dotenv()

# # Set up logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# @dataclass
# class NewsSource:
#     """Single news source from Google search"""
#     url: str
#     title: str
#     snippet: str
#     source_name: str
#     published_date: Optional[str] = None

# @dataclass
# class ProcessedArticle:
#     """Fully processed news article"""
#     id: str
#     title: str
#     summary: str
#     category: str
#     timestamp: str
#     readTime: str
#     isBreaking: bool
#     imageUrl: Optional[str]
#     sourceUrl: str
#     source: str
#     linked_sources: List[str]

# class NewsService:
#     """
#     Fixed news service that uses Google search snippets
#     Much more reliable than web scraping
#     """
    
#     def __init__(self):
#         # Load API keys
#         self.openai_api_key = os.getenv("OPENAI_API_KEY")
#         self.google_api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
#         self.google_cse_id = os.getenv("GOOGLE_CSE_ID")
        
#         # Initialize OpenAI
#         if self.openai_api_key:
#             openai.api_key = self.openai_api_key
        
#         # Google Custom Search endpoint
#         self.google_search_url = "https://www.googleapis.com/customsearch/v1"
        
#         # Rate limiting
#         self.last_request_time = 0
#         self.min_request_interval = 0.1
        
#     def _wait_for_rate_limit(self):
#         """Simple rate limiting"""
#         current_time = time.time()
#         time_since_last = current_time - self.last_request_time
#         if time_since_last < self.min_request_interval:
#             time.sleep(self.min_request_interval - time_since_last)
#         self.last_request_time = time.time()
    
#     async def search_google_news(self, query: str, num_results: int = 10) -> List[NewsSource]:
#         """
#         Search Google for news articles using Custom Search API
#         """
#         try:
#             logger.info(f"🔍 Searching Google for: '{query}' (wanting {num_results} results)")
            
#             if not self.google_api_key:
#                 logger.error("❌ Google API key not found")
#                 return []
            
#             # Build search parameters for Zimbabwe-focused news
#             params = {
#                 'key': self.google_api_key,
#                 'cx': self.google_cse_id,
#                 'q': f"{query} {country_of_interest} news",  # Focus on Zimbabwe
#                 'num': min(num_results, 10),
#                 'dateRestrict': 'd7',  # Last 7 days for more Zimbabwe content
#                 'sort': 'date',
#                 'lr': 'lang_en',
#                 'gl': 'zw',  # Geographic location: Zimbabwe
#                 'cr': 'countryZW',  # Country restrict to Zimbabwe
#             }
            
#             self._wait_for_rate_limit()
            
#             async with aiohttp.ClientSession() as session:
#                 async with session.get(self.google_search_url, params=params) as response:
#                     if response.status == 200:
#                         data = await response.json()
                        
#                         if 'items' not in data:
#                             logger.warning(f"⚠️  No results found for '{query}'")
#                             return []
                        
#                         sources = []
#                         for item in data['items']:
#                             try:
#                                 # Clean up the title and snippet
#                                 title = item.get('title', '').replace(' - ' + self._extract_domain(item.get('link', '')), '')
#                                 snippet = item.get('snippet', '')
                                
#                                 source = NewsSource(
#                                     url=item.get('link', ''),
#                                     title=title,
#                                     snippet=snippet,
#                                     source_name=self._extract_domain(item.get('link', ''))
#                                 )
#                                 sources.append(source)
#                             except Exception as e:
#                                 logger.warning(f"⚠️  Error parsing search result: {e}")
#                                 continue
                        
#                         logger.info(f"✅ Found {len(sources)} news sources for '{query}'")
#                         return sources
                    
#                     else:
#                         logger.error(f"❌ Google Search API error: {response.status}")
#                         return []
                        
#         except Exception as e:
#             logger.error(f"❌ Error searching Google: {str(e)}")
#             return []
    
#     def _extract_domain(self, url: str) -> str:
#         """Extract clean domain name from URL"""
#         try:
#             parsed = urlparse(url)
#             domain = parsed.netloc.lower()
#             if domain.startswith('www.'):
#                 domain = domain[4:]
#             return domain.title()  # Make it look nicer
#         except:
#             return "News Source"
    
#     async def create_summary_from_snippets(self, sources: List[NewsSource], topic: str) -> str:
#         """
#         Create a summary using Google search snippets and OpenAI
#         Much more reliable than web scraping
#         """
#         try:
#             logger.info(f"🤖 Creating summary from {len(sources)} sources about '{topic}'")
            
#             if not self.openai_api_key:
#                 logger.warning("⚠️  OpenAI not available, using basic summary")
#                 return self._create_basic_summary_from_snippets(sources, topic)
            
#             # Prepare snippets for OpenAI
#             snippets_text = ""
#             for i, source in enumerate(sources[:5], 1):  # Use top 5 sources
#                 snippets_text += f"\nSource {i} - {source.source_name}:\n"
#                 snippets_text += f"Title: {source.title}\n"
#                 snippets_text += f"Snippet: {source.snippet}\n"
#                 snippets_text += f"URL: {source.url}\n"
            
#             # Create prompt for OpenAI
#             prompt = f"""
#             Create a comprehensive news summary about "{topic}" using these news snippets.
            
#             Requirements:
#             1. Write 2-3 engaging paragraphs (200-250 words)
#             2. Include embedded links using this format: [text](URL)
#             3. Combine information from multiple sources
#             4. Make it informative and well-written
#             5. Include 3-4 source links throughout the text
#             6. Focus on the most important and recent developments
            
#             News snippets:
#             {snippets_text}
            
#             Write the summary now:
#             """
            
#             # Call OpenAI
#             response = openai.ChatCompletion.create(
#                 model="gpt-3.5-turbo",
#                 messages=[
#                     {"role": "system", "content": "You are a professional news writer. Create engaging summaries with embedded source links."},
#                     {"role": "user", "content": prompt}
#                 ],
#                 max_tokens=400,
#                 temperature=0.7
#             )
            
#             summary = response.choices[0].message.content.strip()
#             logger.info(f"✅ OpenAI summary created successfully")
#             return summary
            
#         except Exception as e:
#             logger.error(f"❌ OpenAI error: {str(e)}")
#             return self._create_basic_summary_from_snippets(sources, topic)
    
#     def _create_basic_summary_from_snippets(self, sources: List[NewsSource], topic: str) -> str:
#         """
#         Create a basic summary without OpenAI using just the snippets
#         """
#         if not sources:
#             return f"No recent news found about {topic}."
        
#         # Create summary from snippets
#         summary_parts = []
#         for i, source in enumerate(sources[:3]):
#             title = source.title
#             snippet = source.snippet
#             url = source.url
#             source_name = source.source_name
            
#             # Combine title and snippet for a richer summary
#             if snippet and len(snippet) > 50:
#                 summary_parts.append(f"[{title}]({url}) - {snippet} (Source: {source_name})")
#             else:
#                 summary_parts.append(f"[{title}]({url}) from {source_name}")
        
#         intro = f"Latest updates on {topic}:\n\n"
#         return intro + "\n\n".join(summary_parts)
    
#     def _calculate_reading_time(self, text: str) -> str:
#         """Calculate reading time"""
#         words = len(text.split())
#         minutes = max(1, round(words / 200))
#         return f"{minutes} min read"
    
#     def _detect_breaking_news(self, title: str, snippet: str) -> bool:
#         """Detect breaking news from title and snippet"""
#         breaking_keywords = [
#             'breaking', 'urgent', 'just in', 'developing', 'live', 
#             'alert', 'update', 'emergency', 'major', 'significant'
#         ]
        
#         text_to_check = (title + ' ' + snippet).lower()
#         return any(keyword in text_to_check for keyword in breaking_keywords)
    
#     async def get_news_for_category(self, category: str, max_articles: int = 12) -> List[ProcessedArticle]:
#         """
#         Get processed news for a category using search snippets
#         Creates INDIVIDUAL articles for each source (not one combined summary)
#         """
#         try:
#             logger.info(f"📡 Getting REAL news for category: {category} (max: {max_articles})")
            
#             # Zimbabwe-focused search queries for better local relevance
#             search_queries = {
#                 'politics': f'{country_of_interest} politics government ZANU-PF CCC election policy Blessed Geza',
#                 'sports': f'{country_of_interest} sports cricket rugby football soccer Warriors',
#                 'health': f'{country_of_interest} health medical healthcare hospitals clinics',
#                 'business': f'{country_of_interest} business economy ZSE stock exchange mining agriculture',
#                 'technology': f'{country_of_interest} technology innovation digital transformation ICT',
#                 'local-trends': f'{country_of_interest} trending social media local news events',
#                 'weather': f'{country_of_interest} weather climate forecast rain season',
#                 'entertainment': f'{country_of_interest} entertainment music movies celebrities arts',
#                 'education': f'{country_of_interest} education schools universities ZIMSEC'
#             }
            
#             query = search_queries.get(category, f'{category} news')
            
#             # Search Google for news sources
#             sources = await self.search_google_news(query, max_articles * 3)  # Get extra sources
            
#             if not sources:
#                 logger.warning(f"⚠️  No sources found for {category}")
#                 return []
            
#             # Create INDIVIDUAL articles for each source (not one combined summary)
#             processed_articles = []
            
#             for i, source in enumerate(sources[:max_articles]):
#                 try:
#                     # Create individual article for each source
#                     is_breaking = self._detect_breaking_news(source.title, source.snippet)
                    
#                     # Enhanced snippet as summary (could be improved with OpenAI for individual articles)
#                     summary = await self._create_individual_summary(source, category)
                    
#                     processed_article = ProcessedArticle(
#                         id=f"{category}_{i}_{int(time.time())}",
#                         title=source.title,  # Use the actual news title
#                         summary=summary,
#                         category=self._format_category_for_frontend(category),  # Format for frontend
#                         timestamp=datetime.now().isoformat(),
#                         readTime=self._calculate_reading_time(summary),
#                         isBreaking=is_breaking,
#                         imageUrl=None,
#                         sourceUrl=source.url,
#                         source=source.source_name,
#                         linked_sources=[source.url]
#                     )
                    
#                     processed_articles.append(processed_article)
                    
#                 except Exception as e:
#                     logger.warning(f"⚠️  Error processing source {i}: {e}")
#                     continue
            
#             logger.info(f"✅ Successfully created {len(processed_articles)} individual articles for {category}")
#             return processed_articles
            
#         except Exception as e:
#             logger.error(f"❌ Error processing {category} news: {str(e)}")
#             return []
    
#     async def _create_individual_summary(self, source: NewsSource, category: str) -> str:
#         """
#         Create a summary for an individual article
#         Uses the snippet and optionally enhances it with OpenAI
#         """
#         try:
#             # If snippet is good enough, use it directly
#             if len(source.snippet) > 100:
#                 return f"{source.snippet}\n\n[Read full article at {source.source_name}]({source.url})"
            
#             # If OpenAI is available and snippet is short, enhance it
#             if self.openai_api_key and len(source.snippet) < 100:
#                 prompt = f"""
#                 Create a brief news summary (100-150 words) for this article:
                
#                 Title: {source.title}
#                 Snippet: {source.snippet}
#                 Source: {source.source_name}
#                 Category: {category}
                
#                 Make it informative and engaging. Include a link to the source at the end.
#                 """
                
#                 response = openai.ChatCompletion.create(
#                     model="gpt-3.5-turbo",
#                     messages=[
#                         {"role": "system", "content": "You are a news writer. Create brief, engaging summaries."},
#                         {"role": "user", "content": prompt}
#                     ],
#                     max_tokens=200,
#                     temperature=0.7
#                 )
                
#                 enhanced_summary = response.choices[0].message.content.strip()
#                 return f"{enhanced_summary}\n\n[Read more at {source.source_name}]({source.url})"
            
#             # Fallback: use snippet as-is
#             return f"{source.snippet}\n\n[Read full article at {source.source_name}]({source.url})"
            
#         except Exception as e:
#             logger.warning(f"⚠️  Error creating individual summary: {e}")
#             return f"{source.snippet}\n\n[Read more at {source.source_name}]({source.url})"
    
#     def _format_category_for_frontend(self, category: str) -> str:
#         """
#         Format category names to match frontend CSS classes
#         Backend: 'politics' -> Frontend: 'Politics'
#         Backend: 'local-trends' -> Frontend: 'Local Trends'
#         """
#         category_mapping = {
#             'politics': 'Politics',
#             'sports': 'Sports', 
#             'health': 'Health',
#             'business': 'Business',
#             'technology': 'Technology',
#             'local-trends': 'Local Trends',
#             'weather': 'Weather',
#             'entertainment': 'Entertainment',
#             'education': 'Education'
#         }
        
#         return category_mapping.get(category, category.title())
    
#     async def search_news(self, query: str, max_results: int = 10) -> List[Dict]:
#         """
#         Search for news articles by query using snippets
#         """
#         try:
#             logger.info(f"🔍 Searching for news: '{query}'")
            
#             sources = await self.search_google_news(query, max_results)
            
#             if not sources:
#                 return []
            
#             # Convert to article format using snippets
#             articles = []
#             for i, source in enumerate(sources):
#                 article = {
#                     'id': f"search_{hash(query)}_{i}_{int(time.time())}",
#                     'title': source.title,
#                     'summary': source.snippet,
#                     'category': 'Search',  # Format for frontend
#                     'timestamp': datetime.now().isoformat(),
#                     'readTime': '2 min read',
#                     'isBreaking': self._detect_breaking_news(source.title, source.snippet),
#                     'imageUrl': None,
#                     'sourceUrl': source.url,
#                     'source': source.source_name,
#                     'linked_sources': [source.url]
#                 }
#                 articles.append(article)
            
#             logger.info(f"✅ Found {len(articles)} search results for '{query}'")
#             return articles
            
#         except Exception as e:
#             logger.error(f"❌ Error searching for '{query}': {str(e)}")
#             return []

# # Create singleton instance
# news_service = NewsService()

# Backend/app/services/news_service.py
# Fixed news service with proper country handling

# import asyncio
# import aiohttp
# import time
# import hashlib
# from datetime import datetime
# from typing import List, Dict, Any, Optional
# import logging
# from dataclasses import dataclass

# logger = logging.getLogger(__name__)

# @dataclass
# class NewsSource:
#     """Simple data structure for news sources from search"""
#     title: str
#     snippet: str
#     url: str
#     source_name: str
#     timestamp: str = ""

# @dataclass
# class ProcessedArticle:
#     """Data structure for processed news articles"""
#     id: str
#     title: str
#     summary: str
#     category: str
#     timestamp: str
#     readTime: str
#     isBreaking: bool
#     imageUrl: Optional[str]
#     sourceUrl: str
#     source: str
#     linked_sources: List[str]

# class NewsService:
#     """
#     News service for fetching and processing real news articles
#     """
    
#     def __init__(self):
#         self.search_engine_url = "https://api.search.brave.com/res/v1/web/search"
#         self.api_key = None  # We'll implement without API key for now
        
#     # COUNTRY MAPPING: Convert country codes to country names for better search results    
#     def _get_country_name(self, country_code: str) -> str:
#         """
#         Convert country code to full country name for better search results
#         """
#         country_map = {
#             'ZW': 'Zimbabwe',
#             'KE': 'Kenya', 
#             'GH': 'Ghana',
#             'RW': 'Rwanda',
#             'CD': 'Democratic Republic of Congo',
#             'ZA': 'South Africa',
#             'BI': 'Burundi'
#         }
#         return country_map.get(country_code, country_code)
    
#     async def search_google_news(self, query: str, max_results: int = 10) -> List[NewsSource]:
#         """
#         Search for news using a simple web search approach
#         Since we don't have access to premium news APIs, we'll simulate news sources
#         """
#         try:
#             logger.info(f"🔍 Searching for news: '{query}' (max: {max_results})")
            
#             # For now, we'll create realistic mock news sources based on the query
#             # In a production environment, you would use actual news APIs like:
#             # - Google News API
#             # - NewsAPI.org
#             # - Bing News API
            
#             sources = []
            
#             # Generate realistic mock sources based on the search query
#             for i in range(min(max_results, 5)):  # Limit to 5 sources for now
#                 source = NewsSource(
#                     title=f"Latest {query} News Update {i+1}",
#                     snippet=f"Recent developments in {query} with significant impact on local communities and policy changes.",
#                     url=f"https://example-news-source.com/article-{i+1}",
#                     source_name=f"News Source {i+1}",
#                     timestamp=datetime.now().isoformat()
#                 )
#                 sources.append(source)
            
#             logger.info(f"✅ Found {len(sources)} news sources for '{query}'")
#             return sources
            
#         except Exception as e:
#             logger.error(f"❌ Error searching for news: {str(e)}")
#             return []
    
#     async def _create_individual_summary(self, source: NewsSource, category: str) -> str:
#         """
#         Create an individual summary for a news source
#         In production, this could use OpenAI or another AI service for better summaries
#         """
#         if len(source.snippet) > 100:
#             return source.snippet
#         else:
#             return f"Breaking news in {category}: {source.snippet}"
    
#     def _calculate_reading_time(self, text: str) -> str:
#         """
#         Calculate estimated reading time based on text length
#         Average reading speed: 200 words per minute
#         """
#         words = len(text.split())
#         minutes = max(1, round(words / 200))
#         return f"{minutes} min read"
    
#     def _detect_breaking_news(self, title: str, snippet: str) -> bool:
#         """
#         Detect if news should be marked as breaking based on keywords
#         """
#         breaking_keywords = [
#             'breaking', 'urgent', 'just in', 'developing', 'live', 
#             'alert', 'update', 'emergency', 'major', 'significant'
#         ]
        
#         text_to_check = (title + ' ' + snippet).lower()
#         return any(keyword in text_to_check for keyword in breaking_keywords)
    
#     # FIXED: Now accepts country_code as a parameter
#     async def get_news_for_category(self, category: str, max_articles: int = 12, country_code: str = 'ZW') -> List[ProcessedArticle]:
#         """
#         Get processed news for a category using search snippets
#         Creates INDIVIDUAL articles for each source (not one combined summary)
        
#         Args:
#             category: News category (politics, sports, etc.)
#             max_articles: Maximum number of articles to return
#             country_code: Country code for localized news (ZW, KE, etc.)
#         """
#         try:
#             logger.info(f"📡 Getting REAL news for category: {category} (max: {max_articles}) for country: {country_code}")
            
#             # FIXED: Now uses the country_code parameter instead of undefined variable
#             country_name = self._get_country_name(country_code)
            
#             # Country-focused search queries for better local relevance
#             search_queries = {
#                 'politics': f'{country_name} politics government election policy parliament',
#                 'sports': f'{country_name} sports cricket rugby football soccer national team',
#                 'health': f'{country_name} health medical healthcare hospitals clinics ministry',
#                 'business': f'{country_name} business economy stock exchange mining agriculture trade',
#                 'technology': f'{country_name} technology innovation digital transformation ICT startups',
#                 'local-trends': f'{country_name} trending social media local news events culture',
#                 'weather': f'{country_name} weather climate forecast rain season agriculture',
#                 'entertainment': f'{country_name} entertainment music movies celebrities arts culture',
#                 'education': f'{country_name} education schools universities students academic results'
#             }
            
#             # Get the search query for this category, with fallback
#             query = search_queries.get(category, f'{country_name} {category} news')
            
#             # Search for news sources
#             sources = await self.search_google_news(query, max_articles * 3)  # Get extra sources
            
#             if not sources:
#                 logger.warning(f"⚠️  No sources found for {category} in {country_name}")
#                 return []
            
#             # Create INDIVIDUAL articles for each source (not one combined summary)
#             processed_articles = []
            
#             for i, source in enumerate(sources[:max_articles]):
#                 try:
#                     # Create individual article for each source
#                     is_breaking = self._detect_breaking_news(source.title, source.snippet)
                    
#                     # Enhanced snippet as summary (could be improved with AI for better summaries)
#                     summary = await self._create_individual_summary(source, category)
                    
#                     processed_article = ProcessedArticle(
#                         id=f"{category}_{country_code}_{i}_{int(time.time())}",
#                         title=source.title,  # Use the actual news title
#                         summary=summary,
#                         category=category.title(),  # Format for frontend display
#                         timestamp=source.timestamp or datetime.now().isoformat(),
#                         readTime=self._calculate_reading_time(summary),
#                         isBreaking=is_breaking,
#                         imageUrl=None,  # Could be enhanced with image extraction
#                         sourceUrl=source.url,
#                         source=source.source_name,
#                         linked_sources=[source.url]
#                     )
                    
#                     processed_articles.append(processed_article)
                    
#                 except Exception as e:
#                     logger.error(f"❌ Error processing article {i} for {category}: {str(e)}")
#                     continue
            
#             logger.info(f"✅ Successfully processed {len(processed_articles)} {category} articles for {country_name}")
#             return processed_articles
            
#         except Exception as e:
#             logger.error(f"❌ Error processing {category} news for {country_code}: {str(e)}")
#             return []
    
#     async def get_trending_news(self, max_articles: int = 10, country_code: str = 'ZW') -> List[ProcessedArticle]:
#         """
#         Get trending news across all categories
        
#         Args:
#             max_articles: Maximum number of articles to return
#             country_code: Country code for localized news
#         """
#         try:
#             country_name = self._get_country_name(country_code)
#             query = f'{country_name} trending news today latest developments'
            
#             sources = await self.search_google_news(query, max_articles)
#             processed_articles = []
            
#             for i, source in enumerate(sources):
#                 try:
#                     is_breaking = self._detect_breaking_news(source.title, source.snippet)
#                     summary = await self._create_individual_summary(source, 'trending')
                    
#                     processed_article = ProcessedArticle(
#                         id=f"trending_{country_code}_{i}_{int(time.time())}",
#                         title=source.title,
#                         summary=summary,
#                         category='Trending',
#                         timestamp=source.timestamp or datetime.now().isoformat(),
#                         readTime=self._calculate_reading_time(summary),
#                         isBreaking=is_breaking,
#                         imageUrl=None,
#                         sourceUrl=source.url,
#                         source=source.source_name,
#                         linked_sources=[source.url]
#                     )
                    
#                     processed_articles.append(processed_article)
                    
#                 except Exception as e:
#                     logger.error(f"❌ Error processing trending article {i}: {str(e)}")
#                     continue
            
#             return processed_articles
            
#         except Exception as e:
#             logger.error(f"❌ Error getting trending news for {country_code}: {str(e)}")
#             return []
    
#     async def search_news(self, query: str, max_articles: int = 20, country_code: str = 'ZW') -> List[Dict[str, Any]]:
#         """
#         Search for news articles by keyword
        
#         Args:
#             query: Search query string
#             max_articles: Maximum number of articles to return
#             country_code: Country code for localized results
#         """
#         try:
#             logger.info(f"🔍 Searching news for: '{query}' (max: {max_articles}) in {country_code}")
            
#             country_name = self._get_country_name(country_code)
#             enhanced_query = f'{country_name} {query} news'
            
#             sources = await self.search_google_news(enhanced_query, max_articles)
#             articles = []
            
#             for i, source in enumerate(sources):
#                 try:
#                     # Convert to dictionary format for search results
#                     article = {
#                         'id': f"search_{country_code}_{hash(query)}_{i}_{int(time.time())}",
#                         'title': source.title,
#                         'summary': source.snippet,
#                         'category': 'Search',  # Format for frontend
#                         'timestamp': source.timestamp or datetime.now().isoformat(),
#                         'readTime': self._calculate_reading_time(source.snippet),
#                         'isBreaking': self._detect_breaking_news(source.title, source.snippet),
#                         'imageUrl': None,
#                         'sourceUrl': source.url,
#                         'source': source.source_name,
#                         'linked_sources': [source.url]
#                     }
#                     articles.append(article)
                    
#                 except Exception as e:
#                     logger.error(f"❌ Error processing search result {i}: {str(e)}")
#                     continue
            
#             logger.info(f"✅ Found {len(articles)} search results for '{query}' in {country_name}")
#             return articles
            
#         except Exception as e:
#             logger.error(f"❌ Error searching for '{query}' in {country_code}: {str(e)}")
#             return []

# # Create singleton instance
# news_service = NewsService()

# Backend/app/routes/news_routes.py
# Dynamic country-aware news routes - gets country from authenticated user's settings

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, List, Any
import asyncio
from datetime import datetime
import logging
import json
import os

# Import the real news service (no mock data)
from app.services.news_service import news_service

# Configuration constants
MAX_ARTICLES_PER_CATEGORY = 18
MAX_SEARCH_RESULTS = 50
MAX_BREAKING_NEWS = 30

# Valid news categories supported by the system
VALID_CATEGORIES = [
    'politics', 'sports', 'health', 'business', 'technology',
    'local-trends', 'weather', 'entertainment', 'education'
]

# Valid countries that users can select in their settings
VALID_COUNTRIES = [
    'ZW',  # Zimbabwe
    'KE',  # Kenya  
    'GH',  # Ghana
    'RW',  # Rwanda
    'CD',  # Democratic Republic of Congo
    'ZA',  # South Africa
    'BI'   # Burundi
]

# Create router and security instances
router = APIRouter()
security = HTTPBearer(auto_error=False)  # Optional authentication
logger = logging.getLogger(__name__)

# Database functions (shared with auth_routes)
def load_database() -> Dict[str, Any]:
    """Load user data from JSON database file"""
    try:
        if os.path.exists("users_db.json"):
            with open("users_db.json", 'r') as f:
                return json.load(f)
        else:
            return {"users": [], "sessions": []}
    except Exception as e:
        logger.error(f"Error loading database: {e}")
        return {"users": [], "sessions": []}

def get_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Get user information from session token
    Returns user object with country_of_interest field
    """
    if not token:
        return None
        
    db_data = load_database()
    
    # Find active session matching the token
    for session in db_data["sessions"]:
        if session["session_id"] == token and session["is_active"]:
            # Check if session is expired
            expires_at = datetime.fromisoformat(session["expires_at"])
            if datetime.now() > expires_at:
                # Session expired, deactivate it
                session["is_active"] = False
                # Note: In production, you might want to save this change
                return None
            
            # Find user by session's user_id
            for user in db_data["users"]:
                if user["id"] == session["user_id"]:
                    return user
    
    return None

def get_user_country(credentials: Optional[HTTPAuthorizationCredentials] = None) -> Optional[str]:
    """
    Get the authenticated user's country preference
    
    Args:
        credentials: Optional authentication credentials
        
    Returns:
        User's country code, or None if no authentication/invalid country
    """
    # If no authentication provided, return None
    if not credentials:
        logger.info("🌍 No authentication - no country specified")
        return None
    
    # Get user from token
    user = get_user_from_token(credentials.credentials)
    
    if not user:
        logger.info("🌍 Invalid/expired token - no country available") 
        return None
    
    # Get user's country preference
    user_country = user.get("country_of_interest")
    
    # Validate the country is supported
    if not user_country or user_country not in VALID_COUNTRIES:
        logger.warning(f"⚠️  User has invalid/missing country '{user_country}' - authentication required")
        return None
    
    logger.info(f"🌍 Using user's country preference: {user_country}")
    return user_country

def validate_category(category: str) -> None:
    """
    Validate that the requested category is supported
    
    Args:
        category: Category name to validate
        
    Raises:
        HTTPException: If category is not in VALID_CATEGORIES
    """
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{category}'. Valid categories: {', '.join(VALID_CATEGORIES)}"
        )

@router.get("/news/{category}")
async def get_news_by_category(
    category: str,
    max_articles: Optional[int] = Query(MAX_ARTICLES_PER_CATEGORY, ge=1, le=20),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get real news articles for a specific category using user's country preference
    
    Requires authentication - user must be logged in and have a country set in their settings.
    The country is automatically determined from the authenticated user's settings.
    When user changes country in settings, all subsequent news requests use the new country.
    
    Args:
        category: News category (politics, sports, health, etc.)
        max_articles: Maximum number of articles to return (1-20)
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with success status and list of localized articles
    """
    try:
        # Get user's country preference from their settings (required)
        user_country = get_user_country(credentials)
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
        logger.info(f"📰 API Request: {category} news for country {user_country} (max: {max_articles})")
        
        # Validate the requested category
        validate_category(category)
        
        # Fetch real news articles using user's country preference
        articles = await news_service.get_news_for_category(category, user_country, max_articles)
        
        logger.info(f"✅ Retrieved {len(articles)} real {category} articles for {user_country}")
        
        # FastAPI automatically converts ProcessedArticle dataclass objects to JSON
        return {
            "success": True,
            "articles": articles,                           # Auto-converted to JSON
            "category": category.title(),                   # Formatted category name
            "count": len(articles),                         # Number of articles returned
            "country": user_country,                        # User's country preference
            "timestamp": datetime.now().isoformat()        # When this response was generated
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (400, 401, 404, etc.) without modification
        raise
    except Exception as general_error:
        # Log and convert unexpected errors to 500 responses
        logger.error(f"❌ Unexpected error fetching {category} news: {general_error}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch {category} news. Please try again later."
        )

@router.get("/news/all")
async def get_all_categories_news(
    max_per_category: Optional[int] = Query(6, ge=1, le=10),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get news for all categories simultaneously using user's country preference
    
    Requires authentication - user must be logged in with a valid country preference.
    Perfect for homepage/dashboard that displays multiple categories.
    Country is automatically determined from user's settings.
    
    Args:
        max_per_category: Number of articles per category (1-10)
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON with news organized by category, localized to user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
        logger.info(f"📊 API Request: ALL categories for country {user_country} ({max_per_category} per category)")
        
        # Use the news service's optimized concurrent fetching with user's country
        news_by_category = await news_service.get_all_categories_news(user_country, max_per_category)
        
        # Calculate total statistics
        total_articles = sum(len(articles) for articles in news_by_category.values())
        successful_categories = sum(1 for articles in news_by_category.values() if len(articles) > 0)
        
        logger.info(f"✅ Dashboard complete: {total_articles} articles across {successful_categories} categories for {user_country}")
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "news_by_category": news_by_category,           # Auto-converted to JSON
            "total_articles": total_articles,               # Total count across all categories
            "categories_count": successful_categories,      # Number of categories with articles
            "country": user_country,                        # User's current country preference
            "timestamp": datetime.now().isoformat()        # Response generation time
        }
        
    except HTTPException:
        raise
    except Exception as dashboard_error:
        logger.error(f"❌ Error fetching all categories: {dashboard_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch news dashboard. Please try again later."
        )

@router.get("/news/breaking")
async def get_breaking_news(
    max_articles: Optional[int] = Query(15, ge=1, le=MAX_BREAKING_NEWS),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get breaking news articles using user's country preference
    
    Requires authentication - user must be logged in with a valid country preference.
    Searches multiple categories for urgent news from the user's selected country.
    When user changes their country in settings, breaking news automatically updates.
    
    Args:
        max_articles: Maximum breaking news articles to return
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with breaking news articles from user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
        logger.info(f"🚨 API Request: Breaking news for country {user_country} (max: {max_articles})")
        
        # Priority categories most likely to have breaking news
        priority_categories = ['politics', 'business', 'health', 'sports', 'technology']
        
        # Collect breaking news from multiple categories concurrently
        async def get_breaking_from_category(category: str):
            """Get articles from one category and filter for breaking news"""
            try:
                # Get recent articles from this category using user's country
                articles = await news_service.get_news_for_category(category, user_country, 5)
                # Filter only the breaking news articles
                breaking_only = [article for article in articles if getattr(article, 'isBreaking', False)]
                return breaking_only
            except Exception as category_error:
                logger.warning(f"⚠️  Error getting breaking news from {category}: {category_error}")
                return []
        
        # Fetch breaking news from all priority categories concurrently
        breaking_tasks = [get_breaking_from_category(cat) for cat in priority_categories]
        breaking_results = await asyncio.gather(*breaking_tasks, return_exceptions=True)
        
        # Combine all breaking news articles
        all_breaking_articles = []
        for result in breaking_results:
            if isinstance(result, Exception):
                logger.warning(f"⚠️  Breaking news task failed: {result}")
                continue
            # Extend the list with articles from this category
            all_breaking_articles.extend(result)
        
        # Sort by timestamp (most recent first) and limit to requested amount
        all_breaking_articles.sort(
            key=lambda article: getattr(article, 'timestamp', ''), 
            reverse=True
        )
        final_breaking_news = all_breaking_articles[:max_articles]
        
        logger.info(f"✅ Found {len(final_breaking_news)} breaking news articles for {user_country}")
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "articles": final_breaking_news,                # Auto-converted to JSON
            "count": len(final_breaking_news),              # Number of breaking articles
            "country": user_country,                        # User's current country preference
            "timestamp": datetime.now().isoformat()        # Response time
        }
        
    except HTTPException:
        raise
    except Exception as breaking_error:
        logger.error(f"❌ Error fetching breaking news: {breaking_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch breaking news. Please try again later."
        )

@router.get("/news/search")
async def search_news_articles(
    q: str = Query(..., description="Search query - minimum 2 characters"),
    max_articles: Optional[int] = Query(20, ge=1, le=MAX_SEARCH_RESULTS),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Search for news articles by keyword using user's country preference
    
    Requires authentication - user must be logged in with a valid country preference.
    Uses Google Custom Search to find articles matching the user's query,
    automatically localized to their selected country.
    
    Args:
        q: Search query string (minimum 2 characters)
        max_articles: Maximum search results to return (1-50)
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with search results localized to user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
        logger.info(f"🔍 API Request: Search '{q}' in country {user_country} (max: {max_articles})")
        
        # Validate search query length
        if len(q.strip()) < 2:
            raise HTTPException(
                status_code=400, 
                detail="Search query must be at least 2 characters long"
            )
        
        # Use news service to search for real articles in user's country
        search_results = await news_service.search_news(q, user_country, max_articles)
        
        logger.info(f"✅ Search completed: {len(search_results)} results for '{q}' in {user_country}")
        
        # search_news returns dictionaries, so no conversion needed
        return {
            "success": True,
            "articles": search_results,                     # Already in dictionary format
            "query": q,                                     # User's search query
            "count": len(search_results),                   # Number of results found
            "country": user_country,                        # User's current country preference
            "timestamp": datetime.now().isoformat()        # Search completion time
        }
        
    except HTTPException:
        # Re-raise validation errors (400, 401 status codes)
        raise
    except Exception as search_error:
        logger.error(f"❌ Search error for '{q}': {search_error}")
        raise HTTPException(
            status_code=500,
            detail=f"Search failed for '{q}'. Please try again later."
        )

@router.get("/news/trending")
async def get_trending_news(
    max_articles: Optional[int] = Query(12, ge=1, le=25),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get trending news articles using user's country preference
    
    Requires authentication - user must be logged in with a valid country preference.
    Uses optimized search queries to find trending topics from the user's
    selected country. Automatically updates when user changes country in settings.
    
    Args:
        max_articles: Maximum trending articles to return
        credentials: Required user authentication (country extracted from user settings)
        
    Returns:
        JSON response with trending articles from user's country
    """
    try:
        # Get user's country preference dynamically (required)
        user_country = get_user_country(credentials)
        
        if not user_country:
            raise HTTPException(
                status_code=401,
                detail="Authentication required. Please log in and set your country preference in settings."
            )
        
        logger.info(f"📈 API Request: Trending news for country {user_country} (max: {max_articles})")
        
        # Use the news service's trending functionality with user's country
        trending_articles = await news_service.get_trending_news(user_country, max_articles)
        
        logger.info(f"✅ Retrieved {len(trending_articles)} trending articles for {user_country}")
        
        # FastAPI automatically converts ProcessedArticle objects to JSON
        return {
            "success": True,
            "articles": trending_articles,                  # Auto-converted to JSON
            "count": len(trending_articles),                # Number of trending articles
            "country": user_country,                        # User's current country preference
            "timestamp": datetime.now().isoformat()        # Response generation time
        }
        
    except HTTPException:
        raise
    except Exception as trending_error:
        logger.error(f"❌ Error fetching trending news: {trending_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch trending news. Please try again later."
        )

@router.get("/news/categories")
async def get_available_categories():
    """
    Get list of all supported news categories and countries
    
    Useful for frontend applications to dynamically build navigation
    and populate country selection dropdowns in user settings
    
    Returns:
        JSON with list of valid categories, countries, and metadata
    """
    try:
        logger.info("📋 API Request: Getting available categories and countries")
        
        # Category information with descriptions
        category_info = [
            {"name": "politics", "display": "Politics", "description": "Government, elections, policy"},
            {"name": "sports", "display": "Sports", "description": "Cricket, rugby, football, athletics"},
            {"name": "health", "display": "Health", "description": "Healthcare, medical news, wellness"},
            {"name": "business", "display": "Business", "description": "Economy, trade, finance, markets"},
            {"name": "technology", "display": "Technology", "description": "Innovation, ICT, digital transformation"},
            {"name": "local-trends", "display": "Local Trends", "description": "Social media, culture, lifestyle"},
            {"name": "weather", "display": "Weather", "description": "Climate, forecasts, seasonal updates"},
            {"name": "entertainment", "display": "Entertainment", "description": "Music, movies, celebrities, arts"},
            {"name": "education", "display": "Education", "description": "Schools, universities, academic results"}
        ]
        
        # Country information for settings dropdown
        country_info = [
            {"code": "ZW", "name": "Zimbabwe", "flag": "🇿🇼"},
            {"code": "KE", "name": "Kenya", "flag": "🇰🇪"}, 
            {"code": "GH", "name": "Ghana", "flag": "🇬🇭"},
            {"code": "RW", "name": "Rwanda", "flag": "🇷🇼"},
            {"code": "CD", "name": "Democratic Republic of Congo", "flag": "🇨🇩"},
            {"code": "ZA", "name": "South Africa", "flag": "🇿🇦"},
            {"code": "BI", "name": "Burundi", "flag": "🇧🇮"}
        ]
        
        return {
            "success": True,
            "categories": category_info,                    # Detailed category information
            "countries": country_info,                      # Available countries for settings
            "valid_categories": VALID_CATEGORIES,           # Simple list for validation
            "valid_countries": VALID_COUNTRIES,             # Simple list for validation
            "count": len(VALID_CATEGORIES),                # Total number of categories
            "timestamp": datetime.now().isoformat()       # Response time
        }
        
    except Exception as categories_error:
        logger.error(f"❌ Error getting categories and countries: {categories_error}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch available categories and countries"
        )

# ADMIN/DEBUG endpoint to manually override country (optional)
@router.get("/news/{category}/country/{country_override}")
async def get_news_by_category_with_country_override(
    category: str,
    country_override: str,
    max_articles: Optional[int] = Query(MAX_ARTICLES_PER_CATEGORY, ge=1, le=20)
):
    """
    DEBUG/ADMIN endpoint: Get news for specific category with manual country override
    
    This endpoint allows manually specifying a country, bypassing user settings.
    Useful for testing different countries or admin functions.
    
    Args:
        category: News category
        country_override: Country code to use (must be in VALID_COUNTRIES)
        max_articles: Maximum articles to return
        
    Returns:
        JSON response with news from the specified country
    """
    try:
        logger.info(f"🔧 DEBUG: {category} news with country override: {country_override}")
        
        # Validate category and country
        validate_category(category)
        
        if country_override not in VALID_COUNTRIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid country override '{country_override}'. Valid countries: {', '.join(VALID_COUNTRIES)}"
            )
        
        # Fetch news with manual country override
        articles = await news_service.get_news_for_category(category, max_articles, country_override)
        
        logger.info(f"✅ DEBUG: Retrieved {len(articles)} {category} articles for {country_override}")
        
        return {
            "success": True,
            "articles": articles,
            "category": category.title(),
            "count": len(articles),
            "country": country_override,
            "override_used": True,                          # Flag indicating manual override
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as override_error:
        logger.error(f"❌ Error with country override {country_override}: {override_error}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch {category} news for {country_override}"
        )