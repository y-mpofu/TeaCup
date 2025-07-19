// Frontend/src/services/newsApiService.ts
// Service for communicating with the FastAPI backend
// Now includes backend refresh functionality

// Define the NewsArticle interface to match backend response
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  readTime: string;
  isBreaking?: boolean;
  imageUrl?: string;
  sourceUrl?: string;
  source?: string;
}

// API response interfaces
interface CategoryNewsResponse {
  success: boolean;
  articles: NewsArticle[];
  category: string;
  count: number;
  timestamp: string;
}

interface AllNewsResponse {
  success: boolean;
  news_by_category: Record<string, NewsArticle[]>;
  total_articles: number;
  categories_count: number;
  timestamp: string;
}

interface RefreshResponse {
  success: boolean;
  message: string;
  timestamp: string;
  categories_refreshed?: string[];
  total_new_articles?: number;
}

/**
 * News API Service Class
 * Handles all communication with the FastAPI backend
 */
export class NewsApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // Backend server URL
    this.baseUrl = "http://localhost:8000/api";
    this.timeout = 30000; // 30 second timeout for refresh operations
  }

  /**
   * Check if backend is available
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      console.log("🔍 Checking backend connection...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/health/ping`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log("✅ Backend is healthy and responding");
        return true;
      } else {
        console.warn(`⚠️  Backend responded with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("❌ Backend health check timed out");
      } else {
        console.error("❌ Backend health check failed:", error);
      }
      return false;
    }
  }

  /**
   * Tell backend to refresh news data from sources
   * This triggers the backend to fetch fresh news from external APIs
   */
  async refreshBackendNews(): Promise<RefreshResponse> {
    try {
      console.log("🔄 Requesting backend to refresh news data...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/news/refresh`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          force_refresh: true
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: RefreshResponse = await response.json();

      if (data.success) {
        console.log("✅ Backend news refresh completed:", data.message);
        return data;
      } else {
        console.error("❌ Backend news refresh failed:", data);
        return {
          success: false,
          message: "Backend refresh failed",
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("⏰ Backend news refresh timed out");
      } else {
        console.error("❌ Error refreshing backend news:", error);
      }
      return {
        success: false,
        message: `Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Fetch news articles for a specific category
   */
  async fetchNewsByCategory(
    category: string,
    maxArticles: number = 6
  ): Promise<NewsArticle[]> {
    try {
      console.log(`📰 Fetching ${category} news from backend (max: ${maxArticles})...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseUrl}/news/${category}?max_articles=${maxArticles}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CategoryNewsResponse = await response.json();

      if (data.success) {
        console.log(`✅ Successfully fetched ${data.articles.length} ${category} articles`);
        return data.articles;
      } else {
        console.error(`❌ Backend returned error for ${category}:`, data);
        return [];
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏰ Timeout fetching ${category} news`);
      } else {
        console.error(`❌ Error fetching ${category} news:`, error);
      }
      return [];
    }
  }

  /**
   * Fetch news for all categories at once
   */
  async fetchAllNews(maxPerCategory: number = 6): Promise<Record<string, NewsArticle[]>> {
    try {
      console.log(`📰 Fetching all news categories (max ${maxPerCategory} per category)...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseUrl}/news/all?max_per_category=${maxPerCategory}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AllNewsResponse = await response.json();

      if (data.success) {
        console.log(`✅ Successfully fetched ${data.total_articles} total articles across ${data.categories_count} categories`);
        return data.news_by_category;
      } else {
        console.error("❌ Backend returned error for all news:", data);
        return {};
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("⏰ Timeout fetching all news");
      } else {
        console.error("❌ Error fetching all news:", error);
      }
      return {};
    }
  }

  /**
   * Fetch breaking news articles
   */
  async fetchBreakingNews(maxArticles: number = 10): Promise<NewsArticle[]> {
    try {
      console.log(`🚨 Fetching breaking news (max: ${maxArticles})...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseUrl}/news/breaking?max_articles=${maxArticles}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Successfully fetched ${data.articles.length} breaking news articles`);
        return data.articles;
      } else {
        console.error("❌ Backend returned error for breaking news:", data);
        return [];
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("⏰ Timeout fetching breaking news");
      } else {
        console.error("❌ Error fetching breaking news:", error);
      }
      return [];
    }
  }

  /**
   * Search for news articles by keyword
   */
  async searchNews(query: string, maxArticles: number = 20): Promise<NewsArticle[]> {
    try {
      console.log(`🔍 Searching for "${query}" (max: ${maxArticles})...`);

      const encodedQuery = encodeURIComponent(query);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseUrl}/news/search?q=${encodedQuery}&max_articles=${maxArticles}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Search returned ${data.articles.length} results for "${query}"`);
        return data.articles;
      } else {
        console.error(`❌ Backend returned error for search "${query}":`, data);
        return [];
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏰ Timeout searching for "${query}"`);
      } else {
        console.error(`❌ Error searching for "${query}":`, error);
      }
      return [];
    }
  }
}

// Create and export a singleton instance
export const newsApiService = new NewsApiService();

// Export individual functions for easier importing
export const {
  checkBackendHealth,
  refreshBackendNews,
  fetchNewsByCategory,
  fetchAllNews,
  fetchBreakingNews,
  searchNews
} = newsApiService;