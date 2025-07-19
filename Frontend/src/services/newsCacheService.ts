// src/services/newsCacheService.ts
// Cache service that persists data indefinitely during browser session
// Only clears cache on hard refresh/page reload - never on time expiration

import type { NewsArticle } from './newsApiService'

/**
 * Cache entry structure to track when data was loaded
 */
interface CacheEntry {
  data: Record<string, NewsArticle[]>
  timestamp: number
  isLoading: boolean
  sessionId: string
}

/**
 * Service to manage news data caching in memory
 * Cache persists indefinitely until hard refresh or manual clear
 * No time-based expiration - only session-based clearing
 */
class NewsCacheService {
  private cache: CacheEntry | null = null
  private sessionId: string

  constructor() {
    // Generate a unique session ID when the service is created
    this.sessionId = this.generateSessionId()
    
    // Clear cache if this is a fresh page load (hard refresh)
    this.detectAndHandlePageRefresh()
  }

  /**
   * Generate a unique session ID for this page load
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Detect if this is a hard refresh and clear cache if needed
   */
  private detectAndHandlePageRefresh(): void {
    // Check if navigation type indicates a reload
    if (typeof window !== 'undefined' && window.performance) {
      const nav = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (nav && nav.type === 'reload') {
        console.log('🔄 Hard refresh detected, clearing cache')
        this.clearCache()
        return
      }
    }

    // Alternative check: if cache exists but has different session ID, it's from previous session
    if (this.cache && this.cache.sessionId !== this.sessionId) {
      console.log('🆕 New session detected, clearing old cache')
      this.clearCache()
    }
  }

  /**
   * Check if we have valid cached data
   * No time expiration - cache is valid as long as it exists in current session
   */
  hasValidCache(): boolean {
    if (!this.cache) {
      return false
    }

    // Check if this cache is from a different session
    if (this.cache.sessionId !== this.sessionId) {
      console.log('🔄 Session mismatch, clearing cache')
      this.clearCache()
      return false
    }

    // Cache never expires based on time - only on session change
    console.log('✅ Valid cache found, using cached data (no expiration)')
    return true
  }

  /**
   * Get cached news data
   */
  getCachedData(): Record<string, NewsArticle[]> | null {
    if (!this.hasValidCache()) {
      return null
    }
    return this.cache?.data || null
  }

  /**
   * Store news data in cache
   * Data will persist until manual clear or page refresh
   */
  setCachedData(data: Record<string, NewsArticle[]>): void {
    this.cache = {
      data,
      timestamp: Date.now(),
      isLoading: false,
      sessionId: this.sessionId
    }
    console.log('💾 News data cached indefinitely for session:', this.sessionId)
  }

  /**
   * Check if data is currently being loaded
   */
  isCurrentlyLoading(): boolean {
    return this.cache?.isLoading || false
  }

  /**
   * Mark that data loading has started
   */
  setLoadingState(isLoading: boolean): void {
    if (this.cache) {
      this.cache.isLoading = isLoading
    } else if (isLoading) {
      // Create cache entry for loading state
      this.cache = {
        data: {},
        timestamp: Date.now(),
        isLoading: true,
        sessionId: this.sessionId
      }
    }
  }

  /**
   * Clear cached data (force refresh)
   */
  clearCache(): void {
    this.cache = null
    console.log('🗑️ News cache cleared for session:', this.sessionId)
  }

  /**
   * Get cache status for debugging
   */
  getCacheStatus(): string {
    if (!this.cache) {
      return `No cache (Session: ${this.sessionId.slice(-4)})`
    }

    const ageMinutes = Math.floor((Date.now() - this.cache.timestamp) / (1000 * 60))
    const ageDisplay = ageMinutes < 60 ? `${ageMinutes}m` : `${Math.floor(ageMinutes / 60)}h ${ageMinutes % 60}m`
    
    return `Cached ${ageDisplay} ago, Session: ${this.sessionId.slice(-4)} (No expiration)`
  }

  /**
   * Force clear cache and trigger backend refresh (for refresh button)
   */
  forceRefresh(): void {
    console.log('🔄 Force refresh requested, clearing cache for fresh backend data')
    this.clearCache()
  }

  /**
   * Check if cache exists (regardless of age)
   */
  hasCacheData(): boolean {
    return this.cache !== null && this.cache.sessionId === this.sessionId
  }

  /**
   * Get cache age in minutes
   */
  getCacheAgeMinutes(): number {
    if (!this.cache) return 0
    return Math.floor((Date.now() - this.cache.timestamp) / (1000 * 60))
  }
}

// Export a singleton instance
export const newsCacheService = new NewsCacheService()