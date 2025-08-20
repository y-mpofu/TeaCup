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
# FIXED VERSION - Resolves Google API parsing errors

import asyncio
import aiohttp
import time
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
from dataclasses import dataclass, asdict
from urllib.parse import urlparse
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up logging to track what's happening
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class NewsSource:
    """
    Data structure for a single news source from search results
    Represents raw data before processing into full articles
    """
    url: str                            # The URL of the news article
    title: str                          # Article headline/title
    snippet: str                        # Short preview/description
    source_name: str                    # Name of the news website/organization
    published_date: Optional[str] = None # When the article was published (if available)

@dataclass
class ProcessedArticle:
    """
    Data structure for a fully processed news article
    This matches what the frontend expects to receive
    """
    id: str                             # Unique identifier for the article
    title: str                          # Article headline
    summary: str                        # Processed summary of the article
    category: str                       # News category (Politics, Sports, etc.)
    timestamp: str                      # When this article was processed
    readTime: str                       # Estimated reading time (e.g., "3 min read")
    isBreaking: bool                    # Whether this is breaking news
    imageUrl: Optional[str]             # URL to article image (if available)
    sourceUrl: str                      # Original article URL
    source: str                         # Name of the news source
    linked_sources: List[str]           # List of related source URLs

class NewsService:
    """
    FIXED news service with proper Google API response handling
    
    This service handles:
    1. Searching for news using Google Custom Search API
    2. Processing raw search results into structured articles
    3. Country-specific news filtering
    4. Category-based news organization
    5. Breaking news detection
    6. AI-powered summarization (optional)
    """
    
    def __init__(self):
        """
        Initialize the news service with API keys and configuration
        """
        # Load API keys from environment variables
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_SEARCH_API_KEY") 
        self.google_cse_id = os.getenv("GOOGLE_CSE_ID")
        
        # Google Custom Search API endpoint
        self.google_search_url = "https://www.googleapis.com/customsearch/v1"
        
        # Rate limiting to avoid hitting API limits
        self.last_request_time = 0
        self.min_request_interval = 0.1  # Minimum time between requests (100ms)
        
        # Initialize OpenAI if API key is available
        if self.openai_api_key:
            try:
                import openai
                openai.api_key = self.openai_api_key
                self.openai_available = True
                logger.info("✅ OpenAI initialized for enhanced summaries")
            except ImportError:
                logger.warning("⚠️  OpenAI library not installed - using basic summaries")
                self.openai_available = False
        else:
            logger.info("ℹ️  OpenAI API key not provided - using basic summaries")
            self.openai_available = False

    def _get_country_name(self, country_code: str) -> str:
        """
        Convert country code to full country name for better search results
        
        Args:
            country_code: Two-letter country code (e.g., 'ZW', 'KE')
            
        Returns:
            Full country name (e.g., 'Zimbabwe', 'Kenya')
        """
        # Mapping of country codes to full names
        country_map = {
            'ZW': 'Zimbabwe',       # Primary focus country
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
            'US': 'United States',
            'UK': 'United Kingdom',
            'CA': 'Canada'
        }
        return country_map.get(country_code.upper(), country_code)

    def _wait_for_rate_limit(self):
        """
        Simple rate limiting to prevent API abuse
        Ensures minimum time between API requests
        """
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        # If we made a request too recently, wait
        if time_since_last < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()

    def _extract_domain(self, url: str) -> str:
        """
        Extract a clean domain name from a URL for display purposes
        
        Args:
            url: Full URL (e.g., 'https://www.cnn.com/article/123')
            
        Returns:
            Clean domain name (e.g., 'CNN')
        """
        try:
            # Validate that url is actually a string before processing
            if not isinstance(url, str):
                logger.warning(f"Expected string URL, got {type(url)}: {url}")
                return "News Source"
                
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            # Remove 'www.' prefix if present
            if domain.startswith('www.'):
                domain = domain[4:]
            
            # Convert to title case for better display
            return domain.title()
        except Exception as e:
            logger.warning(f"Error parsing domain from {url}: {e}")
            return "News Source"

    async def search_google_news(self, query: str, num_results: int = 10, country_code: str = 'ZW') -> List[NewsSource]:
        """
        FIXED VERSION: Search Google for news articles using the Custom Search API
        Properly handles Google API response format without parsing errors
        
        Args:
            query: Search terms to look for
            num_results: Maximum number of results to return
            country_code: Country to focus the search on
            
        Returns:
            List of NewsSource objects with raw search results
        """
        try:
            country_name = self._get_country_name(country_code)
            logger.info(f"🔍 Searching Google for: '{query}' in {country_name} (wanting {num_results} results)")
            
            # Check if Google API is configured
            if not self.google_api_key or not self.google_cse_id:
                logger.warning("⚠️  Google Search API not configured - using mock data")
                return await self._generate_mock_news_sources(query, num_results, country_name)
            
            # Build search parameters for country-focused news
            params = {
                'key': self.google_api_key,
                'cx': self.google_cse_id,
                'q': f"{query} {country_name} news",  # Include country in search
                'num': min(num_results, 10),          # Google allows max 10 per request
                'dateRestrict': 'd7',                 # Last 7 days for fresh content
                'sort': 'date',                       # Sort by most recent
                'lr': 'lang_en',                      # English language results
                'gl': country_code.lower(),           # Geographic location
                'cr': f'country{country_code.upper()}', # Country restriction
            }
            
            # Apply rate limiting
            self._wait_for_rate_limit()
            
            # Make the API request
            async with aiohttp.ClientSession() as session:
                async with session.get(self.google_search_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Debug: Log the raw response structure to understand what we're getting
                        logger.debug(f"Google API response keys: {list(data.keys())}")
                        
                        # Check if we got results
                        if 'items' not in data:
                            logger.warning(f"⚠️  No Google search results found for '{query}' in {country_name}")
                            logger.debug(f"Response data: {data}")
                            return await self._generate_mock_news_sources(query, num_results, country_name)
                        
                        # Convert Google results to our NewsSource format
                        sources = []
                        for i, item in enumerate(data['items']):
                            try:
                                # CRITICAL FIX: Validate that item is a dictionary before processing
                                if not isinstance(item, dict):
                                    logger.warning(f"⚠️  Skipping non-dictionary item {i}: {type(item)} - {item}")
                                    continue
                                
                                # FIXED: Safe extraction of values with proper defaults
                                title = item.get('title', 'Untitled Article')
                                link = item.get('link', '')
                                snippet = item.get('snippet', 'No description available')
                                
                                # Validate that we got the essential fields
                                if not title or not link:
                                    logger.warning(f"⚠️  Skipping item {i}: missing title or link")
                                    continue
                                
                                # Clean up the title (remove site name suffix if present)
                                domain = self._extract_domain(link)
                                if title.endswith(f' - {domain}'):
                                    title = title[:-len(f' - {domain}')]
                                
                                # FIXED: Proper handling of published date
                                # Google API might have publishedTime in different locations
                                published_date = None
                                if 'pagemap' in item and isinstance(item['pagemap'], dict):
                                    # Check for date in pagemap structure
                                    metatags = item['pagemap'].get('metatags', [])
                                    if metatags and isinstance(metatags[0], dict):
                                        published_date = metatags[0].get('article:published_time') or metatags[0].get('date')
                                
                                # Create the NewsSource object with validated data
                                source = NewsSource(
                                    url=link,
                                    title=title,
                                    snippet=snippet,
                                    source_name=domain,
                                    published_date=published_date  # Now properly extracted or None
                                )
                                sources.append(source)
                                logger.debug(f"✅ Processed item {i+1}: {title[:50]}...")
                                
                            except Exception as e:
                                logger.error(f"❌ Error parsing Google search result {i}: {str(e)}")
                                # Log the problematic item for debugging
                                logger.debug(f"Problematic item: {item}")
                                continue  # Skip this item and continue with others
                        
                        logger.info(f"✅ Found {len(sources)} Google news sources for '{query}' in {country_name}")
                        return sources
                    
                    else:
                        logger.error(f"❌ Google Search API error: {response.status}")
                        error_text = await response.text()
                        logger.debug(f"API error response: {error_text}")
                        return await self._generate_mock_news_sources(query, num_results, country_name)
                        
        except Exception as e:
            logger.error(f"❌ Error searching Google for '{query}': {str(e)}")
            import traceback
            logger.debug(f"Full traceback: {traceback.format_exc()}")
            return await self._generate_mock_news_sources(query, num_results, country_name)

    async def _generate_mock_news_sources(self, query: str, num_results: int, country_name: str) -> List[NewsSource]:
        """
        Generate realistic mock news sources when API is not available
        This ensures the service works even without API keys during development
        
        Args:
            query: The search query
            num_results: Number of mock sources to generate
            country_name: Country to focus the mock news on
            
        Returns:
            List of mock NewsSource objects
        """
        try:
            logger.info(f"🎭 Generating {num_results} mock news sources for '{query}' in {country_name}")
            
            # Realistic news source names
            mock_sources = [
                'Herald Tribune', 'Daily News', 'Independent Times', 'Chronicle Post',
                'National Gazette', 'Express News', 'Observer Daily', 'Standard Times'
            ]
            
            sources = []
            for i in range(min(num_results, 8)):  # Limit to 8 mock sources
                try:
                    source_name = mock_sources[i % len(mock_sources)]
                    
                    # Create realistic titles and snippets based on query and country
                    title = f"{country_name} {query.title()}: Latest Developments Reported"
                    snippet = f"Recent updates on {query} in {country_name} with significant implications for local communities and policy development. Full coverage and analysis available."
                    
                    # Generate a realistic mock URL
                    clean_query = query.lower().replace(' ', '-')
                    url = f"https://{source_name.lower().replace(' ', '')}.com/{clean_query}-{country_name.lower()}-{i+1}"
                    
                    source = NewsSource(
                        url=url,
                        title=title,
                        snippet=snippet,
                        source_name=source_name,
                        published_date=datetime.now().isoformat()
                    )
                    sources.append(source)
                    
                except Exception as e:
                    logger.warning(f"Error creating mock source {i}: {e}")
                    continue
            
            logger.info(f"✅ Generated {len(sources)} mock news sources")
            return sources
            
        except Exception as e:
            logger.error(f"❌ Error generating mock sources: {str(e)}")
            return []

    async def _create_enhanced_summary_with_ai(self, source: NewsSource, category: str) -> str:
        """
        Create an enhanced summary using OpenAI GPT
        Falls back to basic summary if AI is not available
        
        Args:
            source: The news source to summarize
            category: The news category for context
            
        Returns:
            Enhanced summary text with embedded links
        """
        # try:
        #     if not self.openai_available:
        #         return self._create_basic_summary(source)
            
        #     # Import OpenAI here to avoid import errors if not installed
        #     import openai
            
        #     # Create a prompt for GPT to enhance the summary
        #     prompt = f"""
        #     Create an engaging news summary for this article:
            
        #     Title: {source.title}
        #     Snippet: {source.snippet}
        #     Source: {source.source_name}
        #     Category: {category}
            
        #     Requirements:
        #     1. Write 2-3 informative sentences (80-120 words)
        #     2. Make it engaging and newsworthy
        #     3. Include key facts from the snippet
        #     4. End with: "Clic) the card to learn more about this story and have a discussion with Mam'gobozi"
        #     5. Focus on what readers need to know
            
        #     Write the summary now:
        #     """
            
            # Call OpenAI API
            # response = await asyncio.get_event_loop().run_in_executor(
            #     None,  # Use default executor
            #     lambda: openai.ChatCompletion.create(
            #         model="gpt-3.5-turbo",
            #         messages=[
            #             {"role": "system", "content": "You are a professional news editor. Create clear, engaging summaries that make one want to know more about the news article, kind of like newspaper fromnt page summaries."},
            #             {"role": "user", "content": prompt}
            #         ],
            #         max_tokens=150,
            #         temperature=0.7
            #     )
            # )
            
            # enhanced_summary = response.choices[0].message.content.strip()
            # logger.debug(f"✅ AI-enhanced summary created for: {source.title}")
            # return enhanced_summary
            
        # except Exception as e:
        #     logger.warning(f"⚠️  AI enhancement failed for '{source.title}': {e}")
        return self._create_basic_summary(source)

    def _create_basic_summary(self, source: NewsSource) -> str:
        """
        Create a basic summary when AI enhancement is not available
        
        Args:
            source: The news source to summarize
            
        Returns:
            Basic summary using the snippet and source information
        """
        # Validate source data before processing
        if not isinstance(source, NewsSource):
            logger.error(f"Expected NewsSource object, got {type(source)}")
            return "Summary unavailable"
        
       # If snippet is good length, use it directly with a source link
        if len(source.snippet) > 50:
            return f"{source.snippet})"
        else:
            # If snippet is too short, enhance it slightly
            return f"{source.title}: {source.snippet})"

    def _calculate_reading_time(self, text: str) -> str:
        """
        Calculate estimated reading time based on average reading speed
        
        Args:
            text: The text to calculate reading time for
            
        Returns:
            Reading time string (e.g., "3 min read")
        """
        # Validate input
        if not isinstance(text, str):
            return "1 min read"
        
        # Average reading speed is about 200 words per minute
        words = len(text.split())
        minutes = max(1, round(words / 200))  # Minimum 1 minute
        return f"{minutes} min read"

    def _detect_breaking_news(self, title: str, snippet: str) -> bool:
        """
        Detect if news should be marked as breaking based on keywords
        
        Args:
            title: Article title
            snippet: Article snippet/description
            
        Returns:
            True if article appears to be breaking news
        """
        # Validate inputs
        if not isinstance(title, str):
            title = ""
        if not isinstance(snippet, str):
            snippet = ""
        
        # Keywords that indicate breaking news
        breaking_keywords = [
            'breaking news'
        ]
        
        # Check both title and snippet for breaking news indicators
        text_to_check = (title + ' ' + snippet).lower()
        return any(keyword in text_to_check for keyword in breaking_keywords)

    def _format_category_for_frontend(self, category: str) -> str:
        """
        Format category names to match frontend display expectations
        
        Args:
            category: Backend category name (e.g., 'local-trends')
            
        Returns:
            Frontend-friendly category name (e.g., 'Local Trends')
        """
        # Mapping of backend categories to frontend display names
        category_mapping = {
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
        
        return category_mapping.get(category.lower(), category.title())

    async def get_news_for_category(self, category: str, max_articles: int = 12, country_code: str = 'ZW') -> List[ProcessedArticle]:
        """
        Get processed news articles for a specific category
        Creates individual articles for each news source found
        
        Args:
            category: News category (politics, sports, etc.)
            max_articles: Maximum number of articles to return
            country_code: Country code for localized news
            
        Returns:
            List of ProcessedArticle objects ready for the frontend
        """
        try:
            country_name = self._get_country_name(country_code)
            logger.info(f"📡 Getting {category} news for {country_name} (max: {max_articles})")
            
            # Country-focused search queries for better local relevance
            search_queries = {
                'politics': f'{country_name} politics government parliament election policy minister president',
                'sports': f'{country_name} sports cricket rugby football soccer national team league',
                'health': f'{country_name} health medical healthcare hospitals clinics ministry wellness',
                'business': f'{country_name} business economy stock exchange mining agriculture trade investment',
                'technology': f'{country_name} technology innovation digital transformation ICT startups internet',
                'local-trends': f'{country_name} trending social media local news events culture lifestyle',
                'weather': f'{country_name} weather climate forecast rain season agriculture farming',
                'entertainment': f'{country_name} entertainment music movies celebrities arts culture festivals',
                'education': f'{country_name} education schools universities students academic results ministry'
            }
            
            # Get the appropriate search query, with fallback
            query = search_queries.get(category, f'{country_name} {category} news')
            
            # Search for news sources using Google
            sources = await self.search_google_news(query, max_articles * 2, country_code)
            
            if not sources:
                logger.warning(f"⚠️  No sources found for {category} in {country_name}")
                return []
            
            # Process each source into a complete article
            processed_articles = []
            
            for i, source in enumerate(sources[:max_articles]):  # Limit to requested number
                try:
                    # Detect if this is breaking news
                    is_breaking = self._detect_breaking_news(source.title, source.snippet)
                    
                    # Create enhanced summary (with AI if available)
                    summary = await self._create_enhanced_summary_with_ai(source, category)
                    
                    # Create the processed article object
                    processed_article = ProcessedArticle(
                        id=f"{category}_{country_code}_{i}_{int(time.time())}",  # Unique ID
                        title=source.title,                                      # Original news title
                        summary=summary,                                         # Enhanced summary
                        category=self._format_category_for_frontend(category),  # Frontend-friendly category
                        timestamp=datetime.now().isoformat(),                   # When we processed it
                        readTime=self._calculate_reading_time(summary),         # Estimated reading time
                        isBreaking=is_breaking,                                 # Breaking news flag
                        imageUrl=None,                                          # Could be enhanced with image extraction
                        sourceUrl=source.url,                                   # Original article URL
                        source=source.source_name,                             # News source name
                        linked_sources=[source.url]                            # List of related URLs
                    )
                    
                    processed_articles.append(processed_article)
                    logger.debug(f"✅ Processed article {i+1}: {source.title[:50]}...")
                    
                except Exception as e:
                    logger.error(f"❌ Error processing article {i} for {category}: {str(e)}")
                    continue  # Skip this article and continue with others
            
            logger.info(f"✅ Successfully processed {len(processed_articles)} {category} articles for {country_name}")
            return processed_articles
            
        except Exception as e:
            logger.error(f"❌ Error getting {category} news for {country_code}: {str(e)}")
            return []

    async def search_news(self, query: str, max_articles: int = 20, country_code: str = 'ZW') -> List[Dict[str, Any]]:
        """
        Search for news articles by keyword and return as dictionaries
        
        Args:
            query: Search query string
            max_articles: Maximum number of articles to return
            country_code: Country code for localized results
            
        Returns:
            List of article dictionaries (converted from ProcessedArticle objects)
        """
        try:
            country_name = self._get_country_name(country_code)
            logger.info(f"🔍 Searching news for: '{query}' in {country_name} (max: {max_articles})")
            
            # Enhance query with country context
            enhanced_query = f'{country_name} {query} news'
            
            # Search for sources
            sources = await self.search_google_news(enhanced_query, max_articles, country_code)
            articles = []
            
            for i, source in enumerate(sources):
                try:
                    # Create enhanced summary
                    summary = await self._create_enhanced_summary_with_ai(source, 'search')
                    
                    # Convert to dictionary format for search results
                    article = {
                        'id': f"search_{country_code}_{abs(hash(query))}_{i}_{int(time.time())}",
                        'title': source.title,
                        'summary': summary,
                        'category': 'Search Results',
                        'timestamp': datetime.now().isoformat(),
                        'readTime': self._calculate_reading_time(summary),
                        'isBreaking': self._detect_breaking_news(source.title, source.snippet),
                        'imageUrl': None,
                        'sourceUrl': source.url,
                        'source': source.source_name,
                        'linked_sources': [source.url]
                    }
                    articles.append(article)
                    
                except Exception as e:
                    logger.error(f"❌ Error processing search result {i}: {str(e)}")
                    continue
            
            logger.info(f"✅ Found {len(articles)} search results for '{query}' in {country_name}")
            return articles
            
        except Exception as e:
            logger.error(f"❌ Error searching for '{query}' in {country_code}: {str(e)}")
            return []

# Create singleton instance of the news service
news_service = NewsService()