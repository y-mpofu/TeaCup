// Frontend/src/services/newsApiService.ts
// Updated news API service - requires authentication, no country defaults

import { authService } from './authService';

// NewsArticle interface matching backend ProcessedArticle structure
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
  linked_sources?: string[];
}

// API response interfaces
interface CategoryNewsResponse {
  success: boolean;
  articles: NewsArticle[];
  category: string;
  count: number;
  country: string;
  timestamp: string;
}

interface AllNewsResponse {
  success: boolean;
  news_by_category: Record<string, NewsArticle[]>;
  total_articles: number;
  categories_count: number;
  country: string;
  timestamp: string;
}

interface SearchResponse {
  success: boolean;
  articles: NewsArticle[];
  query: string;
  count: number;
  country: string;
  timestamp: string;
}

/**
 * News API Service Class
 * All endpoints require authentication and use user's country preference
 * No default countries or fallback behavior
 */
export class NewsApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // Backend server URL
    this.baseUrl = "http://localhost:8000/api";
    this.timeout = 15000; // 15 second timeout for news requests
  }

  /**
   * Get authentication headers with user token
   * Required for all news endpoints
   */
  private getAuthHeaders(): HeadersInit {
    const token = authService.getCurrentUser() ? localStorage.getItem('teacup_auth_token') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Check if user is authenticated and has country preference
   * All news operations require this
   */
  private validateAuthentication(): { valid: true } | { valid: false; message: string } {
    if (!authService.isLoggedIn()) {
      return {
        valid: false,
        message: "Authentication required. Please log in to access personalized news."
      };
    }
    
    const user = authService.getCurrentUser();
    if (!user || !user.country_of_interest) {
      return {
        valid: false,
        message: "Country preference required. Please set your country in settings."
      };
    }
    
    return { valid: true };
  }

  /**
   * Check if backend is available and responding
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
   * Fetch news articles for a specific category using user's country
   * Requires authentication - user's country preference determines news source
   */
  async fetchNewsByCategory(
    category: string,
    maxArticles: number = 12
  ): Promise<NewsArticle[]> {
    try {
      // Validate authentication and country preference
      const authCheck = this.validateAuthentication();
      if (!authCheck.valid) {
        console.error("❌ Authentication required:", authCheck.message);
        throw new Error(authCheck.message);
      }

      const user = authService.getCurrentUser()!; // Safe since we validated above
      console.log(`📰 Fetching ${category} news for ${user.country_of_interest} (max: ${maxArticles})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseUrl}/news/${category}?max_articles=${maxArticles}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: this.getAuthHeaders()
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          // Authentication failed - clear stored auth and throw error
          authService.logout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CategoryNewsResponse = await response.json();

      if (data.success) {
        console.log(`✅ Retrieved ${data.articles.length} ${category} articles for ${data.country}`);
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
      throw error; // Re-throw to let caller handle
    }
  }

  /**
   * Fetch news for all categories using user's country preference
   * Requires authentication - returns dashboard data
   */
  async fetchAllNews(maxPerCategory: number = 6): Promise<Record<string, NewsArticle[]>> {
    try {
      // Validate authentication and country preference
      const authCheck = this.validateAuthentication();
      if (!authCheck.valid) {
        console.error("❌ Authentication required:", authCheck.message);
        throw new Error(authCheck.message);
      }

      const user = authService.getCurrentUser()!;
      console.log(`📊 Fetching all news categories for ${user.country_of_interest} (${maxPerCategory} per category)`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseUrl}/news/all?max_per_category=${maxPerCategory}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: this.getAuthHeaders()
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AllNewsResponse = await response.json();

      if (data.success) {
        console.log(`✅ Dashboard loaded: ${data.total_articles} articles across ${data.categories_count} categories for ${data.country}`);
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
      throw error;
    }
  }

  /**
   * Fetch breaking news using user's country preference
   * Requires authentication
   */
  async fetchBreakingNews(maxArticles: number = 15): Promise<NewsArticle[]> {
    try {
      // Validate authentication and country preference
      const authCheck = this.validateAuthentication();
      if (!authCheck.valid) {
        console.error("❌ Authentication required:", authCheck.message);
        throw new Error(authCheck.message);
      }

      const user = authService.getCurrentUser()!;
      console.log(`🚨 Fetching breaking news for ${user.country_of_interest} (max: ${maxArticles})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseUrl}/news/breaking?max_articles=${maxArticles}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: this.getAuthHeaders()
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Breaking news loaded: ${data.articles.length} articles for ${data.country}`);
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
      throw error;
    }
  }

  /**
   * Search for news articles by keyword using user's country
   * Requires authentication
   */
  async searchNews(query: string, maxArticles: number = 20): Promise<NewsArticle[]> {
    try {
      // Validate authentication and country preference
      const authCheck = this.validateAuthentication();
      if (!authCheck.valid) {
        console.error("❌ Authentication required:", authCheck.message);
        throw new Error(authCheck.message);
      }

      const user = authService.getCurrentUser()!;
      console.log(`🔍 Searching "${query}" in ${user.country_of_interest} (max: ${maxArticles})`);

      const encodedQuery = encodeURIComponent(query);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseUrl}/news/search?q=${encodedQuery}&max_articles=${maxArticles}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: this.getAuthHeaders()
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();

      if (data.success) {
        console.log(`✅ Search completed: ${data.articles.length} results for "${query}" in ${data.country}`);
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
      throw error;
    }
  }

  /**
   * Fetch trending news using user's country preference
   * Requires authentication
   */
  async fetchTrendingNews(maxArticles: number = 12): Promise<NewsArticle[]> {
    try {
      // Validate authentication and country preference
      const authCheck = this.validateAuthentication();
      if (!authCheck.valid) {
        console.error("❌ Authentication required:", authCheck.message);
        throw new Error(authCheck.message);
      }

      const user = authService.getCurrentUser()!;
      console.log(`📈 Fetching trending news for ${user.country_of_interest} (max: ${maxArticles})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(
        `${this.baseUrl}/news/trending?max_articles=${maxArticles}`,
        {
          method: 'GET',
          signal: controller.signal,
          headers: this.getAuthHeaders()
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Trending news loaded: ${data.articles.length} articles for ${data.country}`);
        return data.articles;
      } else {
        console.error("❌ Backend returned error for trending news:", data);
        return [];
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("⏰ Timeout fetching trending news");
      } else {
        console.error("❌ Error fetching trending news:", error);
      }
      throw error;
    }
  }

  /**
   * Get available news categories and countries
   * This endpoint doesn't require authentication
   */
  async getAvailableCategories(): Promise<{
    categories: Array<{name: string; display: string; description: string}>;
    countries: Array<{code: string; name: string; flag: string}>;
  }> {
    try {
      console.log("📋 Fetching available categories and countries...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/news/categories`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Categories and countries loaded: ${data.categories.length} categories, ${data.countries.length} countries`);
        
        return {
          categories: data.categories,
          countries: data.countries
        };
      } else {
        console.warn(`⚠️  Failed to fetch categories: ${response.status}`);
        // Return fallback data
        return {
          categories: [
            {name: "politics", display: "Politics", description: "Government and policy news"},
            {name: "sports", display: "Sports", description: "Sports and athletics"},
            {name: "health", display: "Health", description: "Healthcare and wellness"},
            {name: "business", display: "Business", description: "Economy and finance"},
            {name: "technology", display: "Technology", description: "Tech and innovation"},
            {name: "local-trends", display: "Local Trends", description: "Culture and lifestyle"},
            {name: "weather", display: "Weather", description: "Weather and climate"},
            {name: "entertainment", display: "Entertainment", description: "Arts and culture"},
            {name: "education", display: "Education", description: "Schools and learning"}
          ],
          countries: [
            {code: "ZW", name: "Zimbabwe", flag: "🇿🇼"},
            {code: "KE", name: "Kenya", flag: "🇰🇪"},
            {code: "GH", name: "Ghana", flag: "🇬🇭"},
            {code: "RW", name: "Rwanda", flag: "🇷🇼"},
            {code: "CD", name: "Democratic Republic of Congo", flag: "🇨🇩"},
            {code: "ZA", name: "South Africa", flag: "🇿🇦"},
            {code: "BI", name: "Burundi", flag: "🇧🇮"}
          ]
        };
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      // Return fallback data on error
      return {
        categories: [],
        countries: []
      };
    }
  }

  /**
   * Handle authentication errors consistently
   * Redirects to login if authentication fails
   */
  private handleAuthError(error: Error): void {
    console.error("🔐 Authentication error:", error.message);
    
    // Clear any stored authentication
    authService.logout();
    
    // In a real React app, you would use router to redirect
    // For now, we'll just log the requirement
    console.log("🔄 Redirecting to login page...");
    
    // You can emit an event here that your main app listens for
    window.dispatchEvent(new CustomEvent('auth-required', {
      detail: { message: error.message }
    }));
  }

  /**
   * Wrapper method that handles authentication errors automatically
   * Use this for all news-related operations
   */
  private async executeWithAuth<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Authentication required") || 
            error.message.includes("Session expired")) {
          this.handleAuthError(error);
          return null;
        }
      }
      
      console.error(`❌ ${operationName} failed:`, error);
      throw error;
    }
  }

  /**
   * Safe wrapper for category news that handles auth errors
   */
  async safelyFetchNewsByCategory(category: string, maxArticles: number = 12): Promise<NewsArticle[]> {
    const result = await this.executeWithAuth(
      () => this.fetchNewsByCategory(category, maxArticles),
      `Fetch ${category} news`
    );
    return result || [];
  }

  /**
   * Safe wrapper for all news that handles auth errors  
   */
  async safelyFetchAllNews(maxPerCategory: number = 6): Promise<Record<string, NewsArticle[]>> {
    const result = await this.executeWithAuth(
      () => this.fetchAllNews(maxPerCategory),
      "Fetch all news"
    );
    return result || {};
  }

  /**
   * Safe wrapper for search that handles auth errors
   */
  async safelySearchNews(query: string, maxArticles: number = 20): Promise<NewsArticle[]> {
    const result = await this.executeWithAuth(
      () => this.searchNews(query, maxArticles),
      `Search for "${query}"`
    );
    return result || [];
  }

  /**
   * Safe wrapper for breaking news that handles auth errors
   */
  async safelyFetchBreakingNews(maxArticles: number = 15): Promise<NewsArticle[]> {
    const result = await this.executeWithAuth(
      () => this.fetchBreakingNews(maxArticles),
      "Fetch breaking news"
    );
    return result || [];
  }

  /**
   * Safe wrapper for trending news that handles auth errors
   */
  async safelyFetchTrendingNews(maxArticles: number = 12): Promise<NewsArticle[]> {
    const result = await this.executeWithAuth(
      () => this.fetchTrendingNews(maxArticles),
      "Fetch trending news"
    );
    return result || [];
  }

  /**
   * Get user's current country for display purposes
   */
  getUserCountry(): string | null {
    const user = authService.getCurrentUser();
    return user ? user.country_of_interest : null;
  }

  /**
   * Check if news services are available (user authenticated with country)
   */
  isNewsAvailable(): boolean {
    return this.validateAuthentication().valid;
  }

  /**
   * Get message explaining why news is not available
   */
  getUnavailabilityMessage(): string {
    const authCheck = this.validateAuthentication();
    return authCheck.valid ? "" : authCheck.message;
  }
}

// Create and export singleton instance
export const newsApiService = new NewsApiService();

// Export individual functions for easier importing
export const {
  checkBackendHealth,
  safelyFetchNewsByCategory,
  safelyFetchAllNews,
  safelyFetchBreakingNews,
  safelySearchNews,
  safelyFetchTrendingNews,
  getAvailableCategories,
  getUserCountry,
  isNewsAvailable,
  getUnavailabilityMessage
} = newsApiService;