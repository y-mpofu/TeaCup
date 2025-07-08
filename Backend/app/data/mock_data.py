# Backend/app/data/mock_data.py
# Mock data service that serves the same data as your frontend mock files

from typing import List, Dict, Optional
import asyncio
from datetime import datetime

# Define the NewsArticle data structure to match frontend
class NewsArticle:
    def __init__(self, id: str, title: str, summary: str, category: str, 
                 timestamp: str, read_time: str, is_breaking: bool = False, 
                 image_url: Optional[str] = None, source_url: Optional[str] = None, 
                 source: Optional[str] = None):
        self.id = id
        self.title = title
        self.summary = summary
        self.category = category
        self.timestamp = timestamp
        self.read_time = read_time
        self.is_breaking = is_breaking
        self.image_url = image_url
        self.source_url = source_url
        self.source = source
    
    def to_dict(self) -> dict:
        """Convert the article to a dictionary for JSON serialization"""
        return {
            "id": self.id,
            "title": self.title,
            "summary": self.summary,
            "category": self.category,
            "timestamp": self.timestamp,
            "readTime": self.read_time,
            "isBreaking": self.is_breaking,
            "imageUrl": self.image_url,
            "sourceUrl": self.source_url,
            "source": self.source
        }

class MockNewsData:
    """Mock data service that provides news articles"""
    
    def __init__(self):
        """Initialize with all mock data"""
        self.articles = self._load_all_articles()
        print(f"📚 Mock data loaded: {len(self.articles)} total articles")
    
    def _load_all_articles(self) -> List[NewsArticle]:
        """Load all articles from mock data (same as your frontend files)"""
        
        articles = []
        
        # Political News (from your mockNews.tsx)
        articles.extend([
            NewsArticle(
                id='pol-1',
                title='Parliament Debates New Economic Recovery Plan',
                summary='Members of Parliament engaged in heated discussions over the proposed economic recovery framework aimed at addressing inflation and unemployment.',
                category='Politics',
                timestamp='2 hours ago',
                read_time='3 min read',
                is_breaking=True,
                image_url='/images/parliament.jpg'
            ),
            NewsArticle(
                id='pol-2',
                title='Local Council Elections Scheduled for March',
                summary='The Zimbabwe Electoral Commission announced that local council elections will be held in March, with voter registration opening next month.',
                category='Politics',
                timestamp='4 hours ago',
                read_time='2 min read'
            ),
            NewsArticle(
                id='pol-3',
                title='Minister Announces New Education Reforms',
                summary='The Education Minister unveiled comprehensive reforms targeting curriculum modernization and teacher training programs.',
                category='Politics',
                timestamp='6 hours ago',
                read_time='4 min read'
            )
        ])
        
        # Local Trends (from your mockNews.tsx)
        articles.extend([
            NewsArticle(
                id='trend-1',
                title='Harare Market Vendors Embrace Digital Payments',
                summary='Street vendors in Harare central market are increasingly adopting mobile payment systems, transforming local commerce.',
                category='Local Trends',
                timestamp='1 hour ago',
                read_time='3 min read'
            ),
            NewsArticle(
                id='trend-2',
                title='Community Garden Project Transforms Suburb',
                summary='Residents in Avondale have created a thriving community garden that now supplies fresh vegetables to local families.',
                category='Local Trends',
                timestamp='3 hours ago',
                read_time='2 min read'
            ),
            NewsArticle(
                id='trend-3',
                title='Youth Tech Hub Opens in Bulawayo',
                summary='A new technology incubator focusing on youth entrepreneurship has opened its doors in Bulawayo, offering free coding classes.',
                category='Local Trends',
                timestamp='5 hours ago',
                read_time='3 min read'
            )
        ])
        
        # Sports News (from your mockNews.tsx)
        articles.extend([
            NewsArticle(
                id='sport-1',
                title='Warriors Prepare for AFCON Qualifiers',
                summary='The Zimbabwe national football team begins intensive training ahead of crucial Africa Cup of Nations qualifying matches.',
                category='Sports',
                timestamp='30 minutes ago',
                read_time='2 min read',
                is_breaking=True
            ),
            NewsArticle(
                id='sport-2',
                title='Local Cricket League Finals This Weekend',
                summary='The Harare Premier Cricket League reaches its climax with the championship finals scheduled for Saturday at Harare Sports Club.',
                category='Sports',
                timestamp='2 hours ago',
                read_time='3 min read',
                is_breaking=True
            )
        ])
        
        # Health News (from your mockNews.tsx)
        articles.extend([
            NewsArticle(
                id='health-1',
                title='New Maternal Health Center Opens in Chitungwiza',
                summary='A state-of-the-art maternal health facility has been commissioned to serve expecting mothers in Chitungwiza and surrounding areas.',
                category='Health',
                timestamp='1 hour ago',
                read_time='3 min read'
            ),
            NewsArticle(
                id='health-2',
                title='Vaccination Campaign Reaches Rural Communities',
                summary='Mobile health teams are conducting vaccination drives in remote areas, ensuring equitable access to immunization services.',
                category='Health',
                timestamp='4 hours ago',
                read_time='2 min read'
            )
        ])
        
        # Business News (from your additionalNews.tsx)
        articles.extend([
            NewsArticle(
                id='biz-1',
                title='New Mining Investment Announced for Matabeleland',
                summary='International mining company commits $500 million investment in gold mining operations, promising 2,000 new jobs.',
                category='Business',
                timestamp='1 hour ago',
                read_time='3 min read'
            ),
            NewsArticle(
                id='biz-2',
                title='Local Bank Launches Mobile Banking for Rural Areas',
                summary='CBZ Bank introduces new mobile banking services specifically designed for rural communities without internet access.',
                category='Business',
                timestamp='3 hours ago',
                read_time='2 min read'
            ),
            NewsArticle(
                id='biz-3',
                title='Tourism Numbers Show Strong Recovery',
                summary='Victoria Falls sees 40% increase in international visitors compared to last year, boosting local economy.',
                category='Business',
                timestamp='5 hours ago',
                read_time='4 min read'
            )
        ])
        
        # Technology News (from your additionalNews.tsx)
        articles.extend([
            NewsArticle(
                id='tech-1',
                title='Free WiFi Zones Expanded Across Harare',
                summary='City council launches 20 new free WiFi hotspots in public areas, improving digital access for residents.',
                category='Technology',
                timestamp='2 hours ago',
                read_time='2 min read'
            ),
            NewsArticle(
                id='tech-2',
                title='Local App Helps Farmers Track Weather Patterns',
                summary='Zimbabwean developers create mobile app that provides accurate weather forecasts for agricultural planning.',
                category='Technology',
                timestamp='4 hours ago',
                read_time='3 min read'
            )
        ])
        
        # Weather News (from your additionalNews.tsx)
        articles.extend([
            NewsArticle(
                id='weather-1',
                title='Rainy Season Expected to Start Early This Year',
                summary='Meteorological department predicts above-normal rainfall starting next month, good news for agriculture.',
                category='Weather',
                timestamp='1 hour ago',
                read_time='2 min read',
                is_breaking=True
            ),
            NewsArticle(
                id='weather-2',
                title='Heat Wave Warning Issued for Masvingo Province',
                summary='Temperatures expected to reach 38°C this week. Health officials advise staying hydrated and avoiding sun exposure.',
                category='Weather',
                timestamp='3 hours ago',
                read_time='2 min read'
            )
        ])
        
        # Entertainment News (from your additionalNews.tsx)
        articles.extend([
            NewsArticle(
                id='ent-1',
                title='Harare International Festival of Arts Returns',
                summary='HIFA 2024 lineup announced featuring local and international artists, promising the biggest celebration yet.',
                category='Entertainment',
                timestamp='2 hours ago',
                read_time='3 min read'
            ),
            NewsArticle(
                id='ent-2',
                title='Local Musician Wins International Award',
                summary='Zimbabwean artist Jah Prayzah receives recognition at African Music Awards for contribution to Afrobeat.',
                category='Entertainment',
                timestamp='6 hours ago',
                read_time='2 min read'
            )
        ])
        
        # Education News (from your additionalNews.tsx)
        articles.extend([
            NewsArticle(
                id='edu-1',
                title='New University Campus Opens in Gweru',
                summary='Midlands State University inaugurates new engineering campus with state-of-the-art laboratories and facilities.',
                category='Education',
                timestamp='4 hours ago',
                read_time='3 min read'
            ),
            NewsArticle(
                id='edu-2',
                title='Free Computer Classes for Primary Schools',
                summary='Government initiative provides basic computer literacy training to 1,000 primary schools nationwide.',
                category='Education',
                timestamp='7 hours ago',
                read_time='2 min read'
            )
        ])
        
        return articles
    
    async def get_articles_by_category(self, category: str, max_articles: int = 6) -> List[dict]:
        """Get articles for a specific category"""
        await asyncio.sleep(0.1)  # Simulate processing time
        
        # Handle both "Local Trends" and "local-trends" format
        category_normalized = category.lower().replace('-', ' ')
        
        filtered_articles = [
            article for article in self.articles 
            if article.category.lower().replace('-', ' ') == category_normalized
        ]
        
        # Limit to max_articles and convert to dictionaries
        return [article.to_dict() for article in filtered_articles[:max_articles]]
    
    async def get_all_news(self, max_per_category: int = 6) -> Dict[str, List[dict]]:
        """Get news for all categories"""
        await asyncio.sleep(0.2)
        
        categories = list(set(article.category for article in self.articles))
        result = {}
        
        for category in categories:
            articles = await self.get_articles_by_category(category, max_per_category)
            category_key = category.lower().replace(' ', '-')
            result[category_key] = articles
        
        return result
    
    async def get_breaking_news(self, max_articles: int = 10) -> List[dict]:
        """Get breaking news articles"""
        await asyncio.sleep(0.1)
        
        breaking_articles = [
            article for article in self.articles 
            if article.is_breaking
        ]
        
        return [article.to_dict() for article in breaking_articles[:max_articles]]
    
    async def search_articles(self, query: str, max_articles: int = 20) -> List[dict]:
        """Search articles by keyword"""
        await asyncio.sleep(0.2)
        
        query_lower = query.lower()
        matching_articles = [
            article for article in self.articles
            if (query_lower in article.title.lower() or 
                query_lower in article.summary.lower())
        ]
        
        return [article.to_dict() for article in matching_articles[:max_articles]]
    
    
    
    
    
    
    
    
    
    
    