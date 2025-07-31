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











# Backend/app/services/news_service.py
# Real news service - ONLY uses actual APIs, no mock data whatsoever
# Requires valid API keys to function

import asyncio
import aiohttp
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
from dataclasses import dataclass, asdict
from urllib.parse import urlparse
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up logging to track operations
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NewsSource:
    """
    Raw news source data from Google Custom Search API
    Contains the basic information before processing into full articles
    """
    url: str                            # Direct link to the news article
    title: str                          # Original headline from the source
    snippet: str                        # Preview text from Google search
    source_name: str                    # Clean name of the news organization
    published_date: Optional[str] = None # Publication timestamp if available

@dataclass
class ProcessedArticle:
    """
    Fully processed news article ready for frontend consumption
    This structure exactly matches what your React frontend expects
    """
    id: str                             # Unique identifier for this article
    title: str                          # Final processed headline
    summary: str                        # AI-enhanced or processed summary
    category: str                       # Display category (Politics, Sports, etc.)
    timestamp: str                      # ISO timestamp when processed
    readTime: str                       # Estimated reading time ("3 min read")
    isBreaking: bool                    # Breaking news flag
    imageUrl: Optional[str]             # Article image URL (future enhancement)
    sourceUrl: str                      # Original source URL
    source: str                         # Source organization name
    linked_sources: List[str]           # Related article URLs

class NewsService:
    """
    Production news service that fetches real news using Google Custom Search API
    
    Core functionality:
    - Searches Google Custom Search for real news articles
    - Processes search results into structured data
    - Supports country-specific news filtering
    - Provides AI-enhanced summaries when OpenAI is available
    - Handles rate limiting and error recovery
    
    Requirements:
    - Valid Google Custom Search API key and CSE ID
    - Optional OpenAI API key for enhanced summaries
    """
    
    def __init__(self):
        """
        Initialize the news service with required API credentials
        Validates that necessary API keys are present
        """
        # Load required API keys from environment
        self.google_api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        self.google_cse_id = os.getenv("GOOGLE_CSE_ID")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        # Validate Google API credentials (required for functionality)
        if not self.google_api_key or not self.google_cse_id:
            logger.error("❌ CRITICAL: Google Search API credentials missing!")
            logger.error("   Please set GOOGLE_SEARCH_API_KEY and GOOGLE_CSE_ID in your .env file")
            raise ValueError("Google Search API credentials are required")
        
        logger.info("✅ Google Custom Search API configured")
        
        # Initialize OpenAI if available (optional for enhanced summaries)
        self.openai_available = False
        if self.openai_api_key:
            try:
                import openai
                openai.api_key = self.openai_api_key
                self.openai_available = True
                logger.info("✅ OpenAI configured for enhanced summaries")
            except ImportError:
                logger.warning("⚠️  OpenAI library not installed - using basic summaries")
        else:
            logger.info("ℹ️  OpenAI not configured - using basic summaries")
        
        # Google Custom Search API endpoint
        self.google_search_url = "https://www.googleapis.com/customsearch/v1"
        
        # Rate limiting configuration to respect API limits
        self.last_request_time = 0
        self.min_request_interval = 0.1  # 100ms between requests

    def _get_country_name(self, country_code: str) -> str:
        """
        Convert ISO country code to full country name for search optimization
        
        Args:
            country_code: Two-letter ISO country code (e.g., 'ZW', 'KE')
            
        Returns:
            Full country name for better search results
        """
        # Country code to name mapping - focused on African countries
        country_mapping = {
            'ZW': 'Zimbabwe',       # Primary target country
            'KE': 'Kenya',
            'GH': 'Ghana', 
            'RW': 'Rwanda',
            'CD': 'Democratic Republic of Congo',
            'ZA': 'South Africa',
            'BI': 'Burundi',
            'UG': 'Uganda',
            'TZ': 'Tanzania',
            'MW': 'Malawi',
            'ZM': 'Zambia',
            'BW': 'Botswana',
            'ET': 'Ethiopia',
            'NG': 'Nigeria',
            'US': 'United States',
            'UK': 'United Kingdom',
            'CA': 'Canada'
        }
        
        return country_mapping.get(country_code.upper(), country_code)

    def _enforce_rate_limit(self):
        """
        Enforce rate limiting to comply with Google API quotas
        Prevents hitting API limits that could block the service
        """
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        # If the last request was too recent, wait
        if time_since_last < self.min_request_interval:
            sleep_duration = self.min_request_interval - time_since_last
            time.sleep(sleep_duration)
        
        # Update the last request timestamp
        self.last_request_time = time.time()

    def _extract_clean_domain(self, url: str) -> str:
        """
        Extract and clean the domain name from a URL for display
        
        Args:
            url: Full URL (e.g., 'https://www.herald.co.zw/article')
            
        Returns:
            Clean domain name (e.g., 'Herald')
        """
        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc.lower()
            
            # Remove common prefixes
            if domain.startswith('www.'):
                domain = domain[4:]
            
            # Remove common TLD suffixes for cleaner display
            if domain.endswith('.com'):
                domain = domain[:-4]
            elif domain.endswith('.co.zw'):
                domain = domain[:-6]
            elif domain.endswith('.org'):
                domain = domain[:-4]
            
            # Capitalize for display
            return domain.replace('-', ' ').title()
            
        except Exception as e:
            logger.warning(f"Error parsing domain from {url}: {e}")
            return "News Source"

    async def search_google_news(self, query: str, num_results: int = 10, country_code: str = 'ZW') -> List[NewsSource]:
        """
        Search Google Custom Search API for real news articles
        
        Args:
            query: Search terms to find relevant news
            num_results: Maximum number of results to return (1-10)
            country_code: Country to focus the search on
            
        Returns:
            List of NewsSource objects with real search results
            
        Raises:
            Exception: If API request fails completely
        """
        try:
            country_name = self._get_country_name(country_code)
            logger.info(f"🔍 Searching Google Custom Search: '{query}' in {country_name} (max: {num_results})")
            
            # Build Google Custom Search parameters
            search_params = {
                'key': self.google_api_key,                     # API authentication
                'cx': self.google_cse_id,                       # Custom Search Engine ID
                'q': f"{query} {country_name} news",            # Enhanced query with country
                'num': min(num_results, 10),                    # Google max is 10 per request
                'dateRestrict': 'd7',                           # Last 7 days for fresh news
                'sort': 'date',                                 # Sort by most recent first
                'lr': 'lang_en',                                # English language results
                'gl': country_code.lower(),                     # Geographic bias
                'cr': f'country{country_code.upper()}',         # Country restriction
                'tbm': 'nws'                                    # News search specifically
            }
            
            # Apply rate limiting before making request
            self._enforce_rate_limit()
            
            # Make the actual API request
            async with aiohttp.ClientSession() as session:
                async with session.get(self.google_search_url, params=search_params) as response:
                    
                    # Check if request was successful
                    if response.status != 200:
                        logger.error(f"❌ Google API returned status {response.status}")
                        response_text = await response.text()
                        logger.error(f"❌ Response: {response_text[:200]}...")
                        return []
                    
                    # Parse the JSON response
                    search_data = await response.json()
                    
                    # Check if we got any results
                    if 'items' not in search_data or not search_data['items']:
                        logger.warning(f"⚠️  No search results found for '{query}' in {country_name}")
                        return []
                    
                    # Process each search result into NewsSource objects
                    news_sources = []
                    for search_item in search_data['items']:
                        try:
                            # Extract and clean the article title
                            raw_title = search_item.get('title', '')
                            clean_domain = self._extract_clean_domain(search_item.get('link', ''))
                            
                            # Remove domain suffix from title if present
                            if raw_title.endswith(f' - {clean_domain}'):
                                clean_title = raw_title[:-len(f' - {clean_domain}')]
                            else:
                                clean_title = raw_title
                            
                            # Create NewsSource object
                            news_source = NewsSource(
                                url=search_item.get('link', ''),
                                title=clean_title,
                                snippet=search_item.get('snippet', ''),
                                source_name=clean_domain,
                                published_date=search_item.get('pagemap', {}).get('metatags', [{}])[0].get('article:published_time')
                            )
                            
                            news_sources.append(news_source)
                            
                        except Exception as parse_error:
                            logger.warning(f"⚠️  Error parsing search result: {parse_error}")
                            continue  # Skip this result and continue with others
                    
                    logger.info(f"✅ Successfully retrieved {len(news_sources)} real news sources for '{query}'")
                    return news_sources
                        
        except aiohttp.ClientError as client_error:
            logger.error(f"❌ Network error searching Google: {client_error}")
            return []
        except Exception as general_error:
            logger.error(f"❌ Unexpected error searching Google: {general_error}")
            return []

    async def _create_ai_enhanced_summary(self, source: NewsSource, category: str) -> str:
        """
        Create an AI-enhanced summary using OpenAI GPT
        Only used when OpenAI API is available and configured
        
        Args:
            source: NewsSource object to enhance
            category: News category for context
            
        Returns:
            Enhanced summary with better formatting and insights
        """
        try:
            if not self.openai_available:
                # Fall back to basic summary if AI not available
                return self._create_basic_summary(source)
            
            import openai
            
            # Create focused prompt for news summarization
            enhancement_prompt = f"""
            Transform this news snippet into an engaging 2-3 sentence summary:
            
            Original Title: {source.title}
            News Snippet: {source.snippet}
            Source: {source.source_name}
            Category: {category}
            
            Requirements:
            1. Make it informative and engaging
            2. Keep the key facts and context
            3. Write 2-3 clear sentences (80-120 words)
            4. End with: "Read the full story at [{source.source_name}]({source.url})"
            
            Enhanced summary:
            """
            
            # Call OpenAI API asynchronously
            response = await asyncio.get_event_loop().run_in_executor(
                None,  # Use default thread pool executor
                lambda: openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a professional news editor. Create clear, engaging news summaries with proper formatting."},
                        {"role": "user", "content": enhancement_prompt}
                    ],
                    max_tokens=150,        # Limit response length
                    temperature=0.7,       # Slightly creative but focused
                    presence_penalty=0.1   # Encourage original phrasing
                )
            )
            
            # Extract and return the enhanced summary
            enhanced_text = response.choices[0].message.content.strip()
            logger.debug(f"✅ AI enhanced summary for: {source.title[:50]}...")
            return enhanced_text
            
        except Exception as ai_error:
            logger.warning(f"⚠️  AI enhancement failed for '{source.title}': {ai_error}")
            # Always fall back to basic summary on any AI error
            return self._create_basic_summary(source)

    def _create_basic_summary(self, source: NewsSource) -> str:
        """
        Create a basic summary when AI enhancement is not available
        Uses the original snippet with proper formatting and source link
        
        Args:
            source: NewsSource to create summary from
            
        Returns:
            Basic formatted summary with source link
        """
        # Use the snippet as the main content
        if len(source.snippet.strip()) > 20:
            summary_text = source.snippet.strip()
        else:
            # If snippet is too short, use title + snippet
            summary_text = f"{source.title}. {source.snippet}".strip()
        
        # Add source link at the end
        return f"{summary_text}\n\nRead the full article at [{source.source_name}]({source.url})"

    def _estimate_reading_time(self, text: str) -> str:
        """
        Calculate reading time based on average reading speed
        
        Args:
            text: Text content to calculate reading time for
            
        Returns:
            Formatted reading time string
        """
        # Average reading speed: 200 words per minute
        word_count = len(text.split())
        minutes = max(1, round(word_count / 200))  # Minimum 1 minute
        return f"{minutes} min read"

    def _is_breaking_news(self, title: str, snippet: str) -> bool:
        """
        Analyze title and snippet to determine if this is breaking news
        
        Args:
            title: Article headline
            snippet: Article preview text
            
        Returns:
            True if article appears to be breaking/urgent news
        """
        # Keywords that indicate breaking or urgent news
        urgent_indicators = [
            'breaking', 'urgent', 'just in', 'developing', 'live update',
            'alert', 'emergency', 'major', 'significant', 'exclusive',
            'confirmed', 'announced', 'reports', 'latest', 'now'
        ]
        
        # Combine title and snippet for analysis
        full_text = f"{title} {snippet}".lower()
        
        # Check if any breaking news indicators are present
        return any(indicator in full_text for indicator in urgent_indicators)

    def _format_category_name(self, category: str) -> str:
        """
        Convert backend category names to frontend display format
        
        Args:
            category: Backend category (e.g., 'local-trends')
            
        Returns:
            Frontend display name (e.g., 'Local Trends')
        """
        # Category name mappings for consistent frontend display
        display_names = {
            'politics': 'Politics',
            'sports': 'Sports',
            'health': 'Health', 
            'business': 'Business',
            'technology': 'Technology',
            'local-trends': 'Local Trends',
            'weather': 'Weather',
            'entertainment': 'Entertainment',
            'education': 'Education',
            'trending': 'Trending',
            'search': 'Search Results'
        }
        
        return display_names.get(category.lower(), category.title())

    async def get_news_for_category(self, category: str, max_articles: int = 12, country_code: str = 'ZW') -> List[ProcessedArticle]:
        """
        Fetch and process news articles for a specific category
        
        This is the main function called by your API endpoints
        Creates individual ProcessedArticle objects for each news source found
        
        Args:
            category: News category (politics, sports, health, etc.)
            max_articles: Maximum number of articles to return
            country_code: Country to focus the search on
            
        Returns:
            List of ProcessedArticle objects ready for JSON serialization
        """
        try:
            country_name = self._get_country_name(country_code)
            logger.info(f"📰 Fetching {category} news for {country_name} (max: {max_articles})")
            
            # Category-specific search queries optimized for each country
            # These queries are designed to get the most relevant local news
            category_queries = {
                'politics': f'{country_name} politics government parliament minister president election policy',
                'sports': f'{country_name} sports cricket rugby football soccer national team league championship',
                'health': f'{country_name} health medical healthcare hospital clinic ministry doctor',
                'business': f'{country_name} business economy trade investment banking stock exchange mining',
                'technology': f'{country_name} technology innovation digital ICT internet startup tech',
                'local-trends': f'{country_name} trending local news social media culture lifestyle events',
                'weather': f'{country_name} weather climate forecast rain drought season agriculture',
                'entertainment': f'{country_name} entertainment music movie celebrity arts culture festival',
                'education': f'{country_name} education school university student academic ministry learning'
            }
            
            # Get the optimized search query for this category
            search_query = category_queries.get(category, f'{country_name} {category} news')
            
            # Search Google for real news sources
            raw_sources = await self.search_google_news(search_query, max_articles * 2, country_code)
            
            # If no sources found, return empty list
            if not raw_sources:
                logger.warning(f"⚠️  No news sources found for {category} in {country_name}")
                return []
            
            # Process each raw source into a complete article
            finished_articles = []
            
            for index, raw_source in enumerate(raw_sources[:max_articles]):
                try:
                    # Determine if this is breaking news
                    breaking_status = self._is_breaking_news(raw_source.title, raw_source.snippet)
                    
                    # Create enhanced summary (AI if available, basic otherwise)
                    article_summary = await self._create_ai_enhanced_summary(raw_source, category)
                    
                    # Build the complete ProcessedArticle object
                    processed_article = ProcessedArticle(
                        id=f"{category}_{country_code}_{index}_{int(time.time())}",
                        title=raw_source.title,
                        summary=article_summary,
                        category=self._format_category_name(category),
                        timestamp=datetime.now().isoformat(),
                        readTime=self._estimate_reading_time(article_summary),
                        isBreaking=breaking_status,
                        imageUrl=None,  # Future enhancement: extract images from articles
                        sourceUrl=raw_source.url,
                        source=raw_source.source_name,
                        linked_sources=[raw_source.url]
                    )
                    
                    finished_articles.append(processed_article)
                    logger.debug(f"✅ Processed article {index + 1}: {raw_source.title[:60]}...")
                    
                except Exception as processing_error:
                    logger.error(f"❌ Failed to process article {index} for {category}: {processing_error}")
                    continue  # Skip failed articles, continue with others
            
            logger.info(f"✅ Successfully processed {len(finished_articles)} {category} articles for {country_name}")
            return finished_articles
            
        except Exception as category_error:
            logger.error(f"❌ Error getting {category} news for {country_code}: {category_error}")
            return []

    async def get_trending_news(self, max_articles: int = 10, country_code: str = 'ZW') -> List[ProcessedArticle]:
        """
        Get trending/breaking news across all categories
        
        Args:
            max_articles: Maximum number of trending articles to return
            country_code: Country to focus trending news on
            
        Returns:
            List of trending ProcessedArticle objects
        """
        try:
            country_name = self._get_country_name(country_code)
            logger.info(f"📈 Fetching trending news for {country_name} (max: {max_articles})")
            
            # Search for trending and breaking news
            trending_query = f'{country_name} trending breaking news today latest developments'
            
            # Get raw sources from Google
            trending_sources = await self.search_google_news(trending_query, max_articles, country_code)
            
            if not trending_sources:
                logger.warning(f"⚠️  No trending news found for {country_name}")
                return []
            
            # Process trending sources into articles
            trending_articles = []
            
            for index, source in enumerate(trending_sources):
                try:
                    breaking_status = self._is_breaking_news(source.title, source.snippet)
                    summary = await self._create_ai_enhanced_summary(source, 'trending')
                    
                    trending_article = ProcessedArticle(
                        id=f"trending_{country_code}_{index}_{int(time.time())}",
                        title=source.title,
                        summary=summary,
                        category='Trending',
                        timestamp=datetime.now().isoformat(),
                        readTime=self._estimate_reading_time(summary),
                        isBreaking=breaking_status,
                        imageUrl=None,
                        sourceUrl=source.url,
                        source=source.source_name,
                        linked_sources=[source.url]
                    )
                    
                    trending_articles.append(trending_article)
                    
                except Exception as trending_error:
                    logger.error(f"❌ Error processing trending article {index}: {trending_error}")
                    continue
            
            logger.info(f"✅ Successfully processed {len(trending_articles)} trending articles for {country_name}")
            return trending_articles
            
        except Exception as trending_service_error:
            logger.error(f"❌ Error getting trending news for {country_code}: {trending_service_error}")
            return []

    async def search_news(self, search_query: str, max_articles: int = 20, country_code: str = 'ZW') -> List[Dict[str, Any]]:
        """
        Search for news articles by keyword and return as dictionaries
        
        Args:
            search_query: User's search terms
            max_articles: Maximum number of search results
            country_code: Country to focus search on
            
        Returns:
            List of article dictionaries (for JSON API responses)
        """
        try:
            country_name = self._get_country_name(country_code)
            logger.info(f"🔍 Searching news for: '{search_query}' in {country_name} (max: {max_articles})")
            
            # Enhance the user's query with country context
            enhanced_search = f'{country_name} {search_query} news'
            
            # Get real sources from Google
            search_sources = await self.search_google_news(enhanced_search, max_articles, country_code)
            
            if not search_sources:
                logger.warning(f"⚠️  No search results found for '{search_query}' in {country_name}")
                return []
            
            # Convert sources to dictionary format for API response
            search_results = []
            
            for index, source in enumerate(search_sources):
                try:
                    # Create summary for this search result
                    result_summary = await self._create_ai_enhanced_summary(source, 'search')
                    
                    # Build dictionary matching frontend expectations
                    search_result = {
                        'id': f"search_{country_code}_{abs(hash(search_query))}_{index}_{int(time.time())}",
                        'title': source.title,
                        'summary': result_summary,
                        'category': 'Search Results',
                        'timestamp': datetime.now().isoformat(),
                        'readTime': self._estimate_reading_time(result_summary),
                        'isBreaking': self._is_breaking_news(source.title, source.snippet),
                        'imageUrl': None,
                        'sourceUrl': source.url,
                        'source': source.source_name,
                        'linked_sources': [source.url]
                    }
                    
                    search_results.append(search_result)
                    
                except Exception as result_error:
                    logger.error(f"❌ Error processing search result {index}: {result_error}")
                    continue
            
            logger.info(f"✅ Successfully processed {len(search_results)} search results for '{search_query}'")
            return search_results
            
        except Exception as search_error:
            logger.error(f"❌ Error searching for '{search_query}' in {country_code}: {search_error}")
            return []

    async def get_all_categories_news(self, articles_per_category: int = 6, country_code: str = 'ZW') -> Dict[str, List[ProcessedArticle]]:
        """
        Fetch news for all categories simultaneously
        Optimized for dashboard/homepage that shows multiple categories
        
        Args:
            articles_per_category: Number of articles per category
            country_code: Country for localized news
            
        Returns:
            Dictionary mapping category names to article lists
        """
        try:
            country_name = self._get_country_name(country_code)
            logger.info(f"📊 Fetching all news categories for {country_name} ({articles_per_category} per category)")
            
            # All available news categories
            all_categories = [
                'politics', 'sports', 'health', 'business', 'technology',
                'local-trends', 'weather', 'entertainment', 'education'
            ]
            
            # Create concurrent tasks for all categories
            # This is much faster than fetching categories one by one
            category_tasks = [
                self.get_news_for_category(cat, articles_per_category, country_code)
                for cat in all_categories
            ]
            
            # Execute all category requests concurrently
            category_results = await asyncio.gather(*category_tasks, return_exceptions=True)
            
            # Organize results into dictionary format
            organized_news = {}
            
            for category_index, category_result in enumerate(category_results):
                category_name = all_categories[category_index]
                
                if isinstance(category_result, Exception):
                    # Log error but continue with other categories
                    logger.error(f"❌ Failed to fetch {category_name}: {category_result}")
                    organized_news[category_name] = []
                else:
                    # Successful result
                    organized_news[category_name] = category_result
                    logger.debug(f"✅ {category_name}: {len(category_result)} articles retrieved")
            
            # Calculate statistics
            total_articles = sum(len(articles) for articles in organized_news.values())
            successful_categories = sum(1 for articles in organized_news.values() if len(articles) > 0)
            
            logger.info(f"✅ Dashboard news complete: {total_articles} articles across {successful_categories} categories")
            
            return organized_news
            
        except Exception as dashboard_error:
            logger.error(f"❌ Error getting all categories for {country_code}: {dashboard_error}")
            return {}

# Create the singleton news service instance
# This instance will be imported and used throughout the application
news_service = NewsService()