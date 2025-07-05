# Backend/services/news_processor.py
# Core service that handles news processing pipeline:
# 1. Fetch news from Google News API
# 2. Scrape full article content with Beautiful Soup
# 3. Generate summaries using GPT
# 4. Format data for frontend consumption

import requests
from bs4 import BeautifulSoup
import openai
import os
from datetime import datetime
import time
import logging
from urllib.parse import urlparse
import json

# Set up logging
logger = logging.getLogger(__name__)

class NewsProcessor:
    """
    Main class that handles the complete news processing pipeline
    This is where all the magic happens - from raw API data to frontend-ready articles
    """
    
    def __init__(self):
        # Set up HTTP session for making requests
        self.session = requests.Session()
        
        # Add realistic browser headers so websites don't block our scraping
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        
        # Set up API keys
        self.news_api_key = os.getenv('GOOGLE_SEARCH_API_KEY')
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # Configure OpenAI
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        logger.info("NewsProcessor initialized successfully")
    
    def fetch_news_by_category(self, category, country='us', page_size=10):
        """
        Step 1: Fetch news articles from News API
        
        Args:
            category: News category (general, sports, health, etc.)
            country: Country code (us for broader coverage, zw for Zimbabwe specific)
            page_size: Number of articles to fetch
        
        Returns:
            List of raw news articles from the API
        """
        try:
            if not self.news_api_key:
                logger.error("News API key not configured")
                return []
            
            # News API endpoint for top headlines
            url = "https://newsapi.org/v2/top-headlines"
            
            params = {
                'apiKey': self.news_api_key,
                'category': category,
                'country': country,
                'pageSize': page_size,
                'language': 'en'
            }
            
            logger.info(f"Fetching {page_size} articles for category: {category}")
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') != 'ok':
                logger.error(f"News API error: {data.get('message', 'Unknown error')}")
                return []
            
            articles = data.get('articles', [])
            logger.info(f"Successfully fetched {len(articles)} articles for category: {category}")
            
            return articles
            
        except requests.exceptions.Timeout:
            logger.error("News API request timed out")
            return []
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching news for category {category}: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in fetch_news_by_category: {str(e)}")
            return []
    
    def scrape_article_content(self, url):
        """
        Step 2: Scrape the full article content using Beautiful Soup
        This extracts the actual article text from the webpage
        
        Args:
            url: The news article URL to scrape
            
        Returns:
            Dictionary with scraped content and metadata
        """
        try:
            logger.info(f"Scraping article: {url}")
            
            # Skip certain URLs that are known to be difficult to scrape
            skip_domains = ['youtube.com', 'twitter.com', 'facebook.com', 'instagram.com']
            parsed_url = urlparse(url)
            if any(domain in parsed_url.netloc for domain in skip_domains):
                logger.info(f"Skipping social media/video URL: {url}")
                return {
                    'title': None,
                    'content': "",
                    'scraped_successfully': False,
                    'skip_reason': 'social_media_or_video'
                }
            
            # Make the request to get the webpage
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            # Parse the HTML content
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove unwanted elements that might interfere with content extraction
            for element in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                element.decompose()
            
            # Try to extract the title using multiple strategies
            title = self.extract_title(soup)
            
            # Try to extract the main content using multiple strategies
            content = self.extract_content(soup)
            
            # Clean up the content
            content = self.clean_content(content)
            
            success = len(content) > 100  # Consider successful if we got substantial content
            
            logger.info(f"Scraping {'successful' if success else 'failed'} for {url} - Content length: {len(content)}")
            
            return {
                'title': title,
                'content': content,
                'scraped_successfully': success,
                'content_length': len(content)
            }
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout scraping article: {url}")
            return {'title': None, 'content': "", 'scraped_successfully': False, 'skip_reason': 'timeout'}
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error scraping article {url}: {str(e)}")
            return {'title': None, 'content': "", 'scraped_successfully': False, 'skip_reason': 'request_error'}
        except Exception as e:
            logger.error(f"Error scraping article {url}: {str(e)}")
            return {'title': None, 'content': "", 'scraped_successfully': False, 'skip_reason': 'parse_error'}
    
    def extract_title(self, soup):
        """
        Extract article title using multiple strategies
        """
        # Try different selectors commonly used for titles
        title_selectors = [
            'h1[class*="headline"]',
            'h1[class*="title"]', 
            'h1',
            '.headline',
            '.article-title',
            '.post-title',
            '[data-testid="headline"]',
            'title'
        ]
        
        for selector in title_selectors:
            element = soup.select_one(selector)
            if element and element.get_text().strip():
                return element.get_text().strip()
        
        return None
    
    def extract_content(self, soup):
        """
        Extract main article content using multiple strategies
        """
        content = ""
        
        # Try different selectors commonly used for article content
        content_selectors = [
            '.article-content',
            '.post-content', 
            '.entry-content',
            '.article-body',
            '.story-body',
            '.content',
            'article',
            '.article',
            '[class*="article-text"]',
            '[class*="story-text"]'
        ]
        
        # First, try specific content containers
        for selector in content_selectors:
            elements = soup.select(f'{selector} p')
            if elements:
                paragraphs = [p.get_text().strip() for p in elements if p.get_text().strip()]
                if paragraphs:
                    content = " ".join(paragraphs)
                    break
        
        # If no content found, try getting all paragraphs
        if not content:
            all_paragraphs = soup.find_all('p')
            paragraphs = []
            for p in all_paragraphs:
                text = p.get_text().strip()
                # Filter out short paragraphs that are likely navigation/ads
                if len(text) > 50 and not self.is_likely_navigation(text):
                    paragraphs.append(text)
            
            content = " ".join(paragraphs)
        
        return content
    
    def is_likely_navigation(self, text):
        """
        Check if text is likely navigation/ads rather than article content
        """
        navigation_keywords = [
            'click here', 'read more', 'subscribe', 'newsletter', 'follow us',
            'share this', 'advertisement', 'sponsored', 'sign up', 'log in',
            'terms of service', 'privacy policy', 'cookie policy'
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in navigation_keywords)
    
    def clean_content(self, content):
        """
        Clean and prepare content for GPT processing
        """
        if not content:
            return ""
        
        # Remove extra whitespace and normalize
        content = ' '.join(content.split())
        
        # Limit length for GPT (GPT has token limits)
        if len(content) > 8000:  # Keep it reasonable for GPT processing
            content = content[:8000] + "..."
        
        return content
    
    def summarize_with_gpt(self, title, content, category):
        """
        Step 3: Use OpenAI GPT to create engaging summaries
        This is where we transform raw article content into user-friendly summaries
        
        Args:
            title: Article title
            content: Scraped article content
            category: News category for context
        """
        try:
            if not self.openai_api_key:
                logger.warning("OpenAI API key not configured, using fallback summary")
                return self.create_fallback_summary(title, content, category)
            
            # Create a detailed prompt for GPT
            prompt = f"""
            Create a compelling summary for this {category} news article for "TeaCup", 
            a news application that .
            
            Article Title: {title}
            Content: {content}
            
            Requirements:
            - Write 2-3 engaging sentences (maximum 150 words)
            - Focus on key facts and their impact
            - Use clear, accessible language suitable for all readers
            - Maintain journalistic objectivity
            - Make it interesting enough that users want to read the full article
            
            You are TeaCup, a Gen Z-focused but serious news summarizer. Your job is to summarize articles in a tone that feels sharp, clear, and modern — intelligent but never academic, punchy but never clickbaity. Write like a well-informed friend who respects the reader's intelligence but knows how to get to the point. 

            **Your voice is:**
            - Confident, concise, and clear
            - Calm but urgent when needed
            - Insightful, not sensational
            - Written in clean, accessible English — 9th to 2th grade reading level
            - Never overly formal, never silly

            **What to avoid:**
            - No slang, memes, emojis, or filler
            - No fluff, moralizing, or condescending takes
            - No AI disclaimers like 'As an AI language model…'

            **Formatting:**
            - Start with a bolded headline-style summary sentence
            - Follow with 2 to4 short paragraphs explaining the key events, causes, and implications
            - Bullet points are okay for clarity, but do not overuse them
            - Keep total word count between 100 to 180 words max

            **Example tone cues:**
            - If it is a big deal, sound steady and clear, not alarmist
            - If it is complicated, simplify — but do not dumb it down
            - If it is controversial, lay out both sides with clarity and neutrality

            You are writing for an app that feels like Spotify for news — clean UI, minimal distractions, news you can scroll or listen to. Keep that same clarity in your words.
            Summary:
            """
            
            logger.info(f"Generating GPT summary for: {title[:50]}...")
            
            # Make the API call to OpenAI
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",  # Fast and cost-effective
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert news editor creating engaging summaries for TeaCup news app. Write compelling, clear summaries that make readers want to learn more."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                max_tokens=200,
                temperature=0.7,  # Slightly creative but not too random
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )
            
            summary = response.choices[0].message.content.strip()
            
            # Clean up the summary
            summary = summary.replace('\n', ' ').strip()
            
            logger.info(f"Successfully generated GPT summary for: {title[:50]}...")
            return summary
            
        except openai.error.RateLimitError:
            logger.error("OpenAI rate limit exceeded")
            return self.create_fallback_summary(title, content, category)
        except openai.error.AuthenticationError:
            logger.error("OpenAI authentication failed - check API key")
            return self.create_fallback_summary(title, content, category)
        except Exception as e:
            logger.error(f"Error generating GPT summary: {str(e)}")
            return self.create_fallback_summary(title, content, category)
    
    def create_fallback_summary(self, title, content, category):
        """
        Create a basic summary when GPT is not available
        """
        if content and len(content) > 200:
            # Take the first 150 characters and add ellipsis
            summary = content[:150].strip()
            # Try to end at a sentence boundary
            last_period = summary.rfind('.')
            if last_period > 50:
                summary = summary[:last_period + 1]
            else:
                summary += "..."
        else:
            summary = f"Latest {category} update: {title}. Read the full article for more details."
        
        return summary
    
    def process_articles_for_category(self, category, max_articles=5):
        """
        Step 4: Complete pipeline - orchestrates the entire process
        This is the main function that ties everything together
        
        Args:
            category: News category to process
            max_articles: Maximum number of articles to process
        
        Returns:
            List of fully processed articles ready for the frontend
        """
        try:
            logger.info(f"Starting complete processing pipeline for {category} (max: {max_articles})")
            
            # Step 1: Fetch raw articles from News API
            raw_articles = self.fetch_news_by_category(category, page_size=max_articles * 2)
            
            if not raw_articles:
                logger.warning(f"No raw articles fetched for category: {category}")
                return []
            
            processed_articles = []
            
            # Process each article through the complete pipeline
            for i, article in enumerate(raw_articles[:max_articles]):
                try:
                    logger.info(f"Processing article {i+1}/{max_articles} for {category}")
                    
                    # Skip articles without URLs
                    if not article.get('url'):
                        logger.warning("Skipping article without URL")
                        continue
                    
                    # Step 2: Scrape full content
                    scraped_data = self.scrape_article_content(article['url'])
                    
                    # Step 3: Generate summary (only if scraping was successful)
                    if scraped_data['scraped_successfully']:
                        summary = self.summarize_with_gpt(
                            scraped_data['title'] or article['title'],
                            scraped_data['content'],
                            category
                        )
                        used_title = scraped_data['title'] or article['title']
                    else:
                        # Use original API data if scraping failed
                        summary = article.get('description', 'Summary not available')
                        used_title = article['title']
                        logger.info(f"Using fallback data for article {i+1} (scraping failed)")
                    
                    # Step 4: Format for frontend (matching your NewsArticle interface)
                    processed_article = {
                        'id': f"{category}-{i+1}-{int(time.time())}",
                        'title': used_title,
                        'summary': summary,
                        'category': category.title(),
                        'timestamp': self.format_timestamp(article['publishedAt']),
                        'imageUrl': article.get('urlToImage'),  # This will be the background image
                        'readTime': self.estimate_read_time(scraped_data.get('content', '')),
                        'isBreaking': i == 0 and category in ['general'],  # Mark first general article as breaking
                        'sourceUrl': article['url'],
                        'source': article.get('source', {}).get('name', 'Unknown Source')
                    }
                    
                    processed_articles.append(processed_article)
                    
                    # Add small delay to be respectful to websites and APIs
                    time.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error processing individual article {i+1}: {str(e)}")
                    continue
            
            logger.info(f"Successfully processed {len(processed_articles)} articles for {category}")
            return processed_articles
            
        except Exception as e:
            logger.error(f"Error in complete processing pipeline for {category}: {str(e)}")
            return []
    
    def search_articles(self, query, max_articles=10):
        """
        Search for articles based on keywords using News API everything endpoint
        This will be useful for your search functionality
        """
        try:
            if not self.news_api_key:
                logger.error("News API key not configured for search")
                return []
            
            url = "https://newsapi.org/v2/everything"
            
            params = {
                'apiKey': self.news_api_key,
                'q': query,
                'language': 'en',
                'sortBy': 'relevancy',
                'pageSize': max_articles
            }
            
            logger.info(f"Searching for articles with query: '{query}'")
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') != 'ok':
                logger.error(f"News API search error: {data.get('message', 'Unknown error')}")
                return []
            
            raw_articles = data.get('articles', [])
            
            # Process search results through the same pipeline
            processed_articles = []
            for i, article in enumerate(raw_articles):
                try:
                    # Quick processing for search results (no full scraping to save time)
                    processed_article = {
                        'id': f"search-{i+1}-{int(time.time())}",
                        'title': article['title'],
                        'summary': article.get('description', 'No summary available'),
                        'category': 'Search Result',
                        'timestamp': self.format_timestamp(article['publishedAt']),
                        'imageUrl': article.get('urlToImage'),
                        'readTime': '2 min read',  # Default for search results
                        'isBreaking': False,
                        'sourceUrl': article['url'],
                        'source': article.get('source', {}).get('name', 'Unknown Source')
                    }
                    
                    processed_articles.append(processed_article)
                    
                except Exception as e:
                    logger.error(f"Error processing search result {i+1}: {str(e)}")
                    continue
            
            logger.info(f"Found {len(processed_articles)} search results for: '{query}'")
            return processed_articles
            
        except Exception as e:
            logger.error(f"Error searching articles: {str(e)}")
            return []
    
    def format_timestamp(self, iso_timestamp):
        """
        Convert ISO timestamp to user-friendly format like '2 hours ago'
        """
        try:
            # Parse the ISO timestamp from the API
            if iso_timestamp.endswith('Z'):
                iso_timestamp = iso_timestamp[:-1] + '+00:00'
            
            article_time = datetime.fromisoformat(iso_timestamp)
            now = datetime.now(article_time.tzinfo)
            
            # Calculate time difference
            diff = now - article_time
            total_seconds = int(diff.total_seconds())
            
            if total_seconds < 60:
                return "Just now"
            elif total_seconds < 3600:  # Less than 1 hour
                minutes = total_seconds // 60
                return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
            elif total_seconds < 86400:  # Less than 1 day
                hours = total_seconds // 3600
                return f"{hours} hour{'s' if hours != 1 else ''} ago"
            else:  # 1 day or more
                days = total_seconds // 86400
                return f"{days} day{'s' if days != 1 else ''} ago"
                
        except Exception as e:
            logger.error(f"Error formatting timestamp {iso_timestamp}: {str(e)}")
            return "Recently"
    
    def estimate_read_time(self, content):
        """
        Estimate reading time based on content length
        Average reading speed is about 200 words per minute
        """
        if not content:
            return "1 min read"
        
        word_count = len(content.split())
        
        if word_count < 100:
            return "1 min read"
        
        # Calculate read time (200 words per minute average)
        read_time = max(1, round(word_count / 200))
        
        return f"{read_time} min read"