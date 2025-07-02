// src/data/additionalNews.ts
// Additional news categories to make the app more comprehensive

import type { NewsArticle } from './mockNews'

// Business and Economy News
export const businessNews: NewsArticle[] = [
  {
    id: 'biz-1',
    title: 'New Mining Investment Announced for Matabeleland',
    summary: 'International mining company commits $500 million investment in gold mining operations, promising 2,000 new jobs.',
    category: 'Business',
    timestamp: '1 hour ago',
    readTime: '3 min read'
  },
  {
    id: 'biz-2',
    title: 'Local Bank Launches Mobile Banking for Rural Areas',
    summary: 'CBZ Bank introduces new mobile banking services specifically designed for rural communities without internet access.',
    category: 'Business',
    timestamp: '3 hours ago',
    readTime: '2 min read'
  },
  {
    id: 'biz-3',
    title: 'Tourism Numbers Show Strong Recovery',
    summary: 'Victoria Falls sees 40% increase in international visitors compared to last year, boosting local economy.',
    category: 'Business',
    timestamp: '5 hours ago',
    readTime: '4 min read'
  }
]

// Technology News
export const techNews: NewsArticle[] = [
  {
    id: 'tech-1',
    title: 'Free WiFi Zones Expanded Across Harare',
    summary: 'City council launches 20 new free WiFi hotspots in public areas, improving digital access for residents.',
    category: 'Technology',
    timestamp: '2 hours ago',
    readTime: '2 min read'
  },
  {
    id: 'tech-2',
    title: 'Local App Helps Farmers Track Weather Patterns',
    summary: 'Zimbabwean developers create mobile app that provides accurate weather forecasts for agricultural planning.',
    category: 'Technology',
    timestamp: '4 hours ago',
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

// Entertainment News
export const entertainmentNews: NewsArticle[] = [
  {
    id: 'ent-1',
    title: 'Harare International Festival of Arts Returns',
    summary: 'HIFA 2024 lineup announced featuring local and international artists, promising the biggest celebration yet.',
    category: 'Entertainment',
    timestamp: '2 hours ago',
    readTime: '3 min read'
  },
  {
    id: 'ent-2',
    title: 'Local Musician Wins International Award',
    summary: 'Zimbabwean artist Jah Prayzah receives recognition at African Music Awards for contribution to Afrobeat.',
    category: 'Entertainment',
    timestamp: '6 hours ago',
    readTime: '2 min read'
  }
]

// Education News
export const educationNews: NewsArticle[] = [
  {
    id: 'edu-1',
    title: 'New University Campus Opens in Gweru',
    summary: 'Midlands State University inaugurates new engineering campus with state-of-the-art laboratories and facilities.',
    category: 'Education',
    timestamp: '4 hours ago',
    readTime: '3 min read'
  },
  {
    id: 'edu-2',
    title: 'Free Computer Classes for Primary Schools',
    summary: 'Government initiative provides basic computer literacy training to 1,000 primary schools nationwide.',
    category: 'Education',
    timestamp: '7 hours ago',
    readTime: '2 min read'
  }
]

// Function to get all additional news
export const getAllAdditionalNews = (): NewsArticle[] => {
  return [
    ...businessNews,
    ...techNews,
    ...weatherNews,
    ...entertainmentNews,
    ...educationNews
  ]
}