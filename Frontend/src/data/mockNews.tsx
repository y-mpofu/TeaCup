// src/data/mockNews.ts
// This file contains sample news data that we'll use while developing
// Later, this can be replaced with real API calls

export interface NewsArticle {
  id: string
  title: string
  summary: string
  category: string
  timestamp: string
  imageUrl?: string
  readTime: string
  isBreaking?: boolean
}

// Sample political news stories
export const politicalNews: NewsArticle[] = [
  {
    id: 'pol-1',
    title: 'Parliament Debates New Economic Recovery Plan',
    summary: 'Members of Parliament engaged in heated discussions over the proposed economic recovery framework aimed at addressing inflation and unemployment.',
    category: 'Politics',
    timestamp: '2 hours ago',
    imageUrl: '/images/parliament.jpg',
    readTime: '3 min read',
    isBreaking: true
  },
  {
    id: 'pol-2', 
    title: 'Local Council Elections Scheduled for March',
    summary: 'The Zimbabwe Electoral Commission announced that local council elections will be held in March, with voter registration opening next month.',
    category: 'Politics',
    timestamp: '4 hours ago',
    readTime: '2 min read'
  },
  {
    id: 'pol-3',
    title: 'Minister Announces New Education Reforms',
    summary: 'The Education Minister unveiled comprehensive reforms targeting curriculum modernization and teacher training programs.',
    category: 'Politics', 
    timestamp: '6 hours ago',
    readTime: '4 min read'
  }
]

// Sample local trends and news
export const localTrends: NewsArticle[] = [
  {
    id: 'trend-1',
    title: 'Harare Market Vendors Embrace Digital Payments',
    summary: 'Street vendors in Harare central market are increasingly adopting mobile payment systems, transforming local commerce.',
    category: 'Local Trends',
    timestamp: '1 hour ago',
    readTime: '3 min read'
  },
  {
    id: 'trend-2',
    title: 'Community Garden Project Transforms Suburb',
    summary: 'Residents in Avondale have created a thriving community garden that now supplies fresh vegetables to local families.',
    category: 'Local Trends', 
    timestamp: '3 hours ago',
    readTime: '2 min read'
  },
  {
    id: 'trend-3',
    title: 'Youth Tech Hub Opens in Bulawayo',
    summary: 'A new technology incubator focusing on youth entrepreneurship has opened its doors in Bulawayo, offering free coding classes.',
    category: 'Local Trends',
    timestamp: '5 hours ago', 
    readTime: '3 min read'
  }
]
// Weather News
export const weatherNews: NewsArticle[] = [
  {
    id: 'weather-1',
    title: 'Rainy Season Expected to Start Early This Year',
    summary: 'Meteorological department predicts above-normal rainfall starting next month, good news for agriculture.',
    category: 'Weather',
    timestamp: '1 hour ago',
    readTime: '2 min read',
    isBreaking: true
  },
  {
    id: 'weather-2',
    title: 'Heat Wave Warning Issued for Masvingo Province',
    summary: 'Temperatures expected to reach 38°C this week. Health officials advise staying hydrated and avoiding sun exposure.',
    category: 'Weather',
    timestamp: '3 hours ago',
    readTime: '2 min read'
  }
]
// Sample sports news
export const sportsNews: NewsArticle[] = [
  {
    id: 'sport-1',
    title: 'Warriors Prepare for AFCON Qualifiers',
    summary: 'The Zimbabwe national football team begins intensive training ahead of crucial Africa Cup of Nations qualifying matches.',
    category: 'Sports',
    timestamp: '30 minutes ago',
    readTime: '2 min read',
    isBreaking: true
  },
  {
    id: 'sport-2',
    title: 'Local Cricket League Finals This Weekend',
    summary: 'The Harare Premier Cricket League reaches its climax with the championship finals scheduled for Saturday at Harare Sports Club.',
    category: 'Sports',
    timestamp: '2 hours ago',
    readTime: '3 min read',
    isBreaking: true
    
  }
]

// Sample health news
export const healthNews: NewsArticle[] = [
  {
    id: 'health-1',
    title: 'New Maternal Health Center Opens in Chitungwiza',
    summary: 'A state-of-the-art maternal health facility has been commissioned to serve expecting mothers in Chitungwiza and surrounding areas.',
    category: 'Health',
    timestamp: '1 hour ago',
    readTime: '3 min read'
  },
  {
    id: 'health-2',
    title: 'Vaccination Campaign Reaches Rural Communities',
    summary: 'Mobile health teams are conducting vaccination drives in remote areas, ensuring equitable access to immunization services.',
    category: 'Health',
    timestamp: '4 hours ago',
    readTime: '2 min read'
  }
]

// Function to get all news articles
export const getAllNews = (): NewsArticle[] => {
  return [
    ...politicalNews,
    ...localTrends, 
    ...sportsNews,
    ...healthNews,
    ...weatherNews
  ]
}

// Function to get news by category
export const getNewsByCategory = (category: string): NewsArticle[] => {
  const allNews = getAllNews()
  return allNews.filter(article => 
    article.category.toLowerCase() === category.toLowerCase()
  )
}

// Function to get breaking news
export const getBreakingNews = (): NewsArticle[] => {
  return getAllNews().filter(article => article.isBreaking)
}