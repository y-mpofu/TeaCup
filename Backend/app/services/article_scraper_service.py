# Backend/app/services/article_scraper_service.py
"""
Article Scraper Service
This service handles intelligent web scraping to extract the main article content
from news websites, ignoring ads, navigation, and other irrelevant elements.
"""

import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import Optional, Dict, List, Tuple
import re
from urllib.parse import urlparse
import logging
from datetime import datetime

# Set up logging for debugging and monitoring
logger = logging.getLogger(__name__)

class ArticleScraperService:
    """
    Service for intelligently scraping article content from web pages.
    Uses multiple strategies to identify and extract the main article text.
    """
    
    def __init__(self):
        """Initialize the scraper with default settings and patterns"""
        
        # Common CSS selectors for article content across different news sites
        # These patterns help identify where the main article text is located
        self.article_selectors = [
            'article',                          # HTML5 article tag (most modern sites)
            '[role="main"]',                    # Accessibility role for main content
            '.article-content',                 # Common class name
            '.article-body',                    # Another common class
            '.story-body',                      # BBC and similar sites
            '.post-content',                    # Blog-style sites
            '.entry-content',                   # WordPress default
            'main',                             # HTML5 main tag
            '.content-body',                    # General content class
            '[itemprop="articleBody"]',        # Schema.org markup
            '.article__body',                   # BEM naming convention
            '.article-text',                    # Direct article text class
            '#article-content',                 # ID-based selector
            '.news-body',                       # News-specific class
            '.text-body'                        # Text content class
        ]
        
        # Patterns to identify and remove unwanted content
        # These elements typically contain ads, navigation, or other non-article content
        self.exclude_selectors = [
            'nav',                              # Navigation menus
            'header',                           # Page headers
            'footer',                           # Page footers
            '.advertisement',                   # Ads
            '.ad',                             # Short ad class
            '.ads',                            # Plural ads
            '.social-share',                   # Social media buttons
            '.related-articles',               # Related content links
            '.comments',                       # Comment sections
            '.sidebar',                        # Sidebars
            '.navigation',                     # Navigation elements
            '.menu',                           # Menu elements
            'script',                          # JavaScript code
            'style',                           # CSS styles
            '.cookie-banner',                  # Cookie notices
            '.newsletter-signup',              # Newsletter forms
            '.popup',                          # Popups
            '.modal',                          # Modal windows
            '.promo',                          # Promotional content
            '[class*="banner"]',               # Any class containing "banner"
            '[class*="widget"]',               # Any class containing "widget"
            '[id*="ad-"]',                     # Any ID containing "ad-"
            '.author-bio',                     # Author biography boxes
            '.tags',                           # Article tags
            '.breadcrumb'                      # Breadcrumb navigation
        ]
        
        # Minimum text length to consider a block as article content
        # This helps filter out short snippets that aren't the main article
        self.min_paragraph_length = 50
        
        # Headers for web requests to appear as a regular browser
        # Some sites block requests that look like bots
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
    
    async def scrape_article(self, url: str) -> Dict[str, any]:
        """
        Main function to scrape an article from a given URL.
        
        Args:
            url: The URL of the article to scrape
            
        Returns:
            Dictionary containing:
            - success: Whether scraping was successful
            - content: The extracted article text
            - title: Article title
            - author: Article author (if found)
            - publish_date: Publication date (if found)
            - error: Error message if scraping failed
        """
        try:
            logger.info(f"🔍 Starting to scrape article from: {url}")
            
            # Fetch the HTML content from the URL
            html_content = await self._fetch_html(url)
            if not html_content:
                # If we couldn't fetch the HTML, return an error
                return {
                    'success': False,
                    'error': 'Failed to fetch article content',
                    'content': None
                }
            
            # Parse the HTML using Beautiful Soup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove unwanted elements before extracting content
            # This cleans up the HTML before we try to find the article
            self._remove_unwanted_elements(soup)
            
            # Extract the main article content using multiple strategies
            article_data = await self._extract_article_content(soup, url)
            
            # Validate that we got meaningful content
            if article_data['content'] and len(article_data['content']) > 200:
                logger.info(f"✅ Successfully scraped article: {len(article_data['content'])} characters")
                article_data['success'] = True
            else:
                logger.warning(f"⚠️ Article content too short or missing")
                article_data['success'] = False
                article_data['error'] = 'Could not extract meaningful article content'
            
            return article_data
            
        except Exception as e:
            logger.error(f"❌ Error scraping article from {url}: {str(e)}")
            return {
                'success': False,
                'error': f'Scraping error: {str(e)}',
                'content': None
            }
    
    async def _fetch_html(self, url: str) -> Optional[str]:
        """
        Fetch HTML content from a URL with proper error handling.
        
        Args:
            url: The URL to fetch
            
        Returns:
            HTML content as string, or None if fetch failed
        """
        try:
            # Create an async HTTP session for making requests
            async with aiohttp.ClientSession() as session:
                # Make the request with a timeout to avoid hanging
                async with session.get(
                    url, 
                    headers=self.headers,
                    timeout=aiohttp.ClientTimeout(total=15)  # 15 second timeout
                ) as response:
                    # Check if request was successful
                    if response.status == 200:
                        # Return the HTML text
                        return await response.text()
                    else:
                        logger.error(f"❌ HTTP {response.status} error fetching {url}")
                        return None
                        
        except asyncio.TimeoutError:
            logger.error(f"⏱️ Timeout fetching {url}")
            return None
        except Exception as e:
            logger.error(f"❌ Error fetching HTML from {url}: {str(e)}")
            return None
    
    def _remove_unwanted_elements(self, soup: BeautifulSoup) -> None:
        """
        Remove unwanted elements from the HTML before content extraction.
        This includes ads, navigation, sidebars, etc.
        
        Args:
            soup: BeautifulSoup object to clean (modified in place)
        """
        # Iterate through each selector pattern we want to exclude
        for selector in self.exclude_selectors:
            try:
                # Find all elements matching this selector
                elements = soup.select(selector)
                # Remove each found element from the HTML tree
                for element in elements:
                    element.decompose()  # Completely remove from tree
            except Exception as e:
                # Log but don't fail if a selector has issues
                logger.debug(f"Error removing {selector}: {e}")
    
    async def _extract_article_content(self, soup: BeautifulSoup, url: str) -> Dict[str, any]:
        """
        Extract article content using multiple strategies.
        Tries different methods to find the main article text.
        
        Args:
            soup: BeautifulSoup object of the page
            url: Original URL (used for fallback strategies)
            
        Returns:
            Dictionary with extracted content and metadata
        """
        # Initialize result dictionary
        result = {
            'content': None,
            'title': None,
            'author': None,
            'publish_date': None
        }
        
        # Extract metadata (title, author, date)
        result['title'] = self._extract_title(soup)
        result['author'] = self._extract_author(soup)
        result['publish_date'] = self._extract_publish_date(soup)
        
        # Strategy 1: Try to find article using common selectors
        content = self._extract_using_selectors(soup)
        
        # Strategy 2: If selectors didn't work, try to find largest text block
        if not content or len(content) < 200:
            content = self._extract_largest_text_block(soup)
        
        # Strategy 3: If still no content, try paragraph-based extraction
        if not content or len(content) < 200:
            content = self._extract_by_paragraphs(soup)
        
        # Clean up the extracted content
        if content:
            content = self._clean_text(content)
        
        result['content'] = content
        return result
    
    def _extract_using_selectors(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Try to extract article content using predefined CSS selectors.
        
        Args:
            soup: BeautifulSoup object
            
        Returns:
            Extracted text or None
        """
        # Try each selector in our list
        for selector in self.article_selectors:
            try:
                # Find the first element matching this selector
                article_element = soup.select_one(selector)
                if article_element:
                    # Get all text from this element
                    text = article_element.get_text(separator='\n', strip=True)
                    # If we found substantial text, return it
                    if text and len(text) > 200:
                        logger.debug(f"✓ Found article using selector: {selector}")
                        return text
            except Exception as e:
                logger.debug(f"Selector {selector} failed: {e}")
                continue
        
        return None
    
    def _extract_largest_text_block(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Find the largest continuous block of text on the page.
        This often corresponds to the main article content.
        
        Args:
            soup: BeautifulSoup object
            
        Returns:
            Text from the largest block or None
        """
        # Find all div and article tags (common containers)
        containers = soup.find_all(['div', 'article', 'section', 'main'])
        
        largest_text = ""
        largest_length = 0
        
        # Check each container for text content
        for container in containers:
            # Skip if this container has nested containers (avoid duplication)
            if container.find_all(['div', 'article', 'section'], recursive=False):
                continue
            
            # Get text from this container
            text = container.get_text(separator='\n', strip=True)
            
            # Check if this is the largest text block so far
            if len(text) > largest_length:
                largest_length = len(text)
                largest_text = text
        
        # Return the largest text if it's substantial
        return largest_text if largest_length > 200 else None
    
    def _extract_by_paragraphs(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Extract content by finding all paragraph tags.
        Filters out short paragraphs that are likely not article content.
        
        Args:
            soup: BeautifulSoup object
            
        Returns:
            Combined paragraph text or None
        """
        # Find all paragraph tags
        paragraphs = soup.find_all('p')
        
        # Collect paragraphs that meet minimum length requirement
        article_paragraphs = []
        for p in paragraphs:
            text = p.get_text(strip=True)
            # Only include paragraphs with substantial text
            if len(text) >= self.min_paragraph_length:
                article_paragraphs.append(text)
        
        # Combine paragraphs with proper spacing
        if article_paragraphs:
            return '\n\n'.join(article_paragraphs)
        
        return None
    
    def _extract_title(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Extract article title using multiple strategies.
        
        Args:
            soup: BeautifulSoup object
            
        Returns:
            Article title or None
        """
        # Try different methods to find the title
        
        # Method 1: Look for h1 tag (most common for article titles)
        h1 = soup.find('h1')
        if h1:
            return h1.get_text(strip=True)
        
        # Method 2: Look for meta property og:title (Open Graph)
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            return og_title['content']
        
        # Method 3: Use the page title tag
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text(strip=True)
        
        return None
    
    def _extract_author(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Extract article author using multiple strategies.
        
        Args:
            soup: BeautifulSoup object
            
        Returns:
            Author name or None
        """
        # Method 1: Look for author meta tag
        author_meta = soup.find('meta', {'name': 'author'})
        if author_meta and author_meta.get('content'):
            return author_meta['content']
        
        # Method 2: Look for byline class
        byline = soup.find(class_=re.compile(r'byline|author|by-line|writer', re.I))
        if byline:
            text = byline.get_text(strip=True)
            # Clean up common prefixes
            text = re.sub(r'^(by|written by|author:)\s*', '', text, flags=re.I)
            return text if text else None
        
        # Method 3: Look for schema.org author
        schema_author = soup.find(attrs={'itemprop': 'author'})
        if schema_author:
            return schema_author.get_text(strip=True)
        
        return None
    
    def _extract_publish_date(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Extract article publication date.
        
        Args:
            soup: BeautifulSoup object
            
        Returns:
            Publication date as string or None
        """
        # Method 1: Look for time tag with datetime attribute
        time_tag = soup.find('time')
        if time_tag and time_tag.get('datetime'):
            return time_tag['datetime']
        
        # Method 2: Look for meta property article:published_time
        pub_time = soup.find('meta', property='article:published_time')
        if pub_time and pub_time.get('content'):
            return pub_time['content']
        
        # Method 3: Look for schema.org datePublished
        date_published = soup.find(attrs={'itemprop': 'datePublished'})
        if date_published:
            if date_published.get('datetime'):
                return date_published['datetime']
            elif date_published.get('content'):
                return date_published['content']
        
        return None
    
    def _clean_text(self, text: str) -> str:
        """
        Clean and format extracted text for better readability.
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned and formatted text
        """
        # Remove excessive whitespace while preserving paragraph breaks
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            # Strip whitespace from each line
            line = line.strip()
            if line:  # Only keep non-empty lines
                # Remove multiple spaces within lines
                line = re.sub(r'\s+', ' ', line)
                cleaned_lines.append(line)
        
        # Join lines with single line breaks for paragraphs
        # This creates clean, essay-style formatting
        text = '\n'.join(cleaned_lines)
        
        # Ensure proper paragraph spacing
        # Replace multiple newlines with double newline (paragraph break)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove any remaining excessive spaces
        text = re.sub(r' {2,}', ' ', text)
        
        return text.strip()