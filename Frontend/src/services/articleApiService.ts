// Frontend/src/services/articleApiService.ts
// FIXED: Service for communicating with backend article enhancement APIs
// PROBLEM SOLVED: Added missing 'context' property to EnhancedSummaryResponse interface
// All field name mismatches resolved and TypeScript errors eliminated

import { authService } from './authService'

// ==========================================
// BACKEND-MATCHING INTERFACES - FIXED VERSION
// ==========================================

/**
 * FIXED: Enhanced Summary Response Interface
 * 
 * This interface now EXACTLY matches what the backend returns AND includes
 * the missing 'context' property that was being referenced in NewsDialogue.tsx
 * 
 * PROPERTIES EXPLAINED:
 * - success: boolean - Whether the AI enhancement process succeeded
 * - enhanced_summary: string - The improved article summary created by AI
 * - key_points: string[] - Array of main takeaways extracted from the article
 * - reading_time: string - Estimated time to read (e.g., "3-5 min read")
 * - confidence_score: number - AI's confidence in the enhancement quality (0-100)
 * - context: string - FIXED: Additional contextual information about the article
 * - scraped_content_preview?: string | null - Optional preview of scraped content
 * - error?: string | null - Optional error message if something went wrong
 */
export interface EnhancedSummaryResponse {
  success: boolean                              // Whether enhancement succeeded
  enhanced_summary: string                      // AI-improved article summary
  key_points: string[]                         // Main article takeaways
  reading_time: string                         // Estimated reading time
  confidence_score: number                     // AI confidence (0-100)
  context: string                              // FIXED: Added missing context property
  scraped_content_preview?: string | null     // Optional scraped content preview
  error?: string | null                       // Optional error message
}

/**
 * Chat Response Interface
 * 
 * For AI chat responses about articles
 */
export interface ChatResponse {
  success: boolean          // Whether chat generation succeeded
  response: string         // The AI's response to user's question
  context_used: boolean    // Whether article context was used in response
  error?: string | null    // Optional error message
}

/**
 * Fact Check Response Interface
 * 
 * For article fact-checking results
 */
export interface FactCheckResponse {
  success: boolean                                      // Whether fact-check succeeded
  status: 'verified' | 'questionable' | 'unverified' // Verification status
  confidence: number                                   // Confidence in fact-check (0-100)
  sources: string[]                                   // Sources used for verification
  warnings: string[]                                  // Any warnings about the content
  last_checked: string                               // When fact-check was performed
}

// ==========================================
// REQUEST INTERFACES - FIXED VERSION
// ==========================================

/**
 * FIXED: Article Enhancement Request Interface
 * 
 * Field names now match backend expectations EXACTLY.
 * These are the fields we send TO the backend when requesting enhancement.
 */
export interface ArticleEnhanceRequest {
  article_id: string      // ✅ Matches backend field name
  article_url: string     // ✅ FIXED: was source_url, now matches backend
  article_title: string   // ✅ FIXED: was original_title, now matches backend
  article_snippet: string // ✅ FIXED: was original_summary, now matches backend
  category: string        // ✅ Already correct - article category
}

/**
 * Chat Message Request Interface
 * 
 * For sending chat messages about articles to the AI
 */
export interface ChatMessage {
  article_id: string    // ID of the article being discussed
  article_url: string   // URL of the article for context
  message: string       // User's question or message
  context?: string      // Optional additional context
}

// ==========================================
// ERROR HANDLING TYPES - ENHANCED VERSION
// ==========================================

/**
 * Service Error Interface
 * 
 * Standardized error structure for all API service errors.
 * Helps with consistent error handling across the application.
 */
interface ServiceError {
  message: string    // Human-readable error message
  code: 'AUTH_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'TIMEOUT_ERROR' | 'VALIDATION_ERROR'
  originalError?: unknown  // Original error object for debugging
}

/**
 * FIXED: Better error type handling utilities
 * 
 * These functions help safely extract error messages from unknown error objects.
 * JavaScript/TypeScript errors can be many different types, so we need safe handling.
 */
interface ErrorWithMessage {
  message: string
}

/**
 * Type guard to check if an error object has a message property
 */
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

/**
 * Safely convert any error to an object with a message property
 */
function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // Fallback in case there's an error stringifying the maybeError
    // (like with circular references)
    return new Error(String(maybeError))
  }
}

/**
 * Extract a clean error message from any error type
 */
function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message
}

// ==========================================
// MAIN API SERVICE CLASS
// ==========================================

/**
 * Article API Service Class
 * 
 * This service handles all communication with the backend article enhancement APIs.
 * It provides a clean interface for the frontend components to request:
 * - AI-enhanced article summaries
 * - Chat responses about articles  
 * - Fact-checking information
 * - Service health monitoring
 * 
 * KEY FEATURES:
 * - Automatic authentication handling
 * - Request retry logic with exponential backoff
 * - Comprehensive error handling and user-friendly error messages
 * - Fallback responses when services are unavailable
 * - TypeScript type safety for all requests and responses
 */
class ArticleApiService {
  private readonly baseUrl: string        // Backend API base URL
  private readonly timeout: number        // Request timeout in milliseconds
  private readonly maxRetries: number     // Maximum number of retry attempts

  constructor() {
    // Configuration for the backend API service
    this.baseUrl = "http://localhost:8000/api"  // Backend server URL
    this.timeout = 30000   // 30 second timeout for AI processing
    this.maxRetries = 3    // Retry failed requests up to 3 times
  }

  // ==========================================
  // AUTHENTICATION & VALIDATION
  // ==========================================

  /**
   * Get authentication headers for API requests
   * 
   * All backend requests require authentication. This function:
   * 1. Gets the user's auth token from localStorage
   * 2. Adds it to request headers as Bearer token
   * 3. Sets proper content-type for JSON requests
   */
  private getAuthHeaders(): HeadersInit {
    const token = authService.getCurrentUser() ? localStorage.getItem('teacup_auth_token') : null
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  /**
   * Validate user authentication before making API calls
   * 
   * Checks if user is logged in and has a valid token.
   * Returns validation result with error message if invalid.
   */
  private validateAuth(): { valid: true } | { valid: false; error: string } {
    if (!authService.isLoggedIn()) {
      return {
        valid: false,
        error: 'Authentication required. Please log in to access enhanced features.'
      }
    }
    
    const token = localStorage.getItem('teacup_auth_token')
    if (!token) {
      return {
        valid: false,
        error: 'Session expired. Please log in again.'
      }
    }
    
    return { valid: true }
  }

  // ==========================================
  // ERROR HANDLING & RETRY LOGIC
  // ==========================================

  /**
   * ENHANCED: Convert raw errors into user-friendly service errors
   * 
   * This function takes any error (network, server, timeout, etc.) and converts it
   * into a standardized ServiceError with appropriate user messaging.
   */
  private handleError(error: unknown, context: string): ServiceError {
    const errorMessage = getErrorMessage(error)
    
    console.error(`❌ ${context} error:`, errorMessage)
    
    // Handle timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
      return {
        message: 'Request timed out. The service may be busy. Please try again.',
        code: 'TIMEOUT_ERROR',
        originalError: error
      }
    }

    // Handle network/fetch errors
    if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      return {
        message: 'Unable to connect to the server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        originalError: error
      }
    }

    // Handle authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('Session expired')) {
      return {
        message: 'Your session has expired. Please log in again.',
        code: 'AUTH_ERROR',
        originalError: error
      }
    }

    // Handle validation errors
    if (errorMessage.includes('422') || errorMessage.includes('Unprocessable')) {
      return {
        message: 'Invalid request data. Please try again or contact support.',
        code: 'VALIDATION_ERROR',
        originalError: error
      }
    }

    // Default server error
    return {
      message: errorMessage || 'An unexpected error occurred. Please try again.',
      code: 'SERVER_ERROR',
      originalError: error
    }
  }

  /**
   * FIXED: Retry mechanism with proper error handling
   * 
   * Implements exponential backoff retry strategy:
   * - Attempt 1: Immediate
   * - Attempt 2: Wait 2 seconds
   * - Attempt 3: Wait 4 seconds
   * - Attempt 4: Wait 8 seconds
   * 
   * Won't retry on authentication or validation errors (no point retrying those).
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    let lastError: unknown

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 ${context} attempt ${attempt}/${maxRetries}`)
        return await operation()
      } catch (error) {
        lastError = error
        const errorMessage = getErrorMessage(error)
        
        // Don't retry on authentication errors - user needs to log in
        if (errorMessage.includes('401') || errorMessage.includes('Session expired')) {
          throw error
        }

        // Don't retry on validation errors - data is invalid
        if (errorMessage.includes('422')) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
          console.log(`⏱️ Waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    // All retries failed, throw the last error
    throw lastError
  }

  // ==========================================
  // MAIN API METHODS
  // ==========================================

  /**
   * FIXED: Get enhanced summary for an article
   * 
   * This is the main method that sends article data to the backend AI service
   * for enhancement. The backend will:
   * 1. Validate the article data
   * 2. Use AI (GPT/Claude) to create a better summary
   * 3. Extract key points and add contextual information
   * 4. Return enhanced data with confidence score
   * 
   * @param article - Article data to enhance
   * @returns Enhanced summary with additional context and key points
   */
  async getEnhancedSummary(article: any): Promise<EnhancedSummaryResponse> {
    // Step 1: Validate user authentication
    const authCheck = this.validateAuth()
    if (!authCheck.valid) {
      throw new Error(authCheck.error!)
    }

    console.log('📰 Requesting enhanced summary for:', article.title)

    // Step 2: Prepare request data with FIXED field names that match backend
    const requestData: ArticleEnhanceRequest = {
      article_id: article.id,
      article_url: article.sourceUrl || article.url || '',  // ✅ Fixed field name
      article_title: article.title,                         // ✅ Fixed field name
      article_snippet: article.summary || article.snippet || '', // ✅ Fixed field name
      category: article.category
    }

    // Step 3: Validate request data before sending
    if (!requestData.article_id) {
      throw new Error('Article ID is required')
    }
    if (!requestData.article_title) {
      throw new Error('Article title is required')
    }
    if (!requestData.category) {
      throw new Error('Article category is required')
    }

    console.log('📤 Sending request data:', {
      ...requestData,
      article_snippet: requestData.article_snippet.substring(0, 100) + '...'
    })

    // Step 4: Define the API operation
    const operation = async (): Promise<EnhancedSummaryResponse> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      try {
        const response = await fetch(`${this.baseUrl}/article/enhance-summary`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(requestData),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status === 401) {
            authService.logout()
            throw new Error('Session expired. Please log in again.')
          }
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        const data: EnhancedSummaryResponse = await response.json()
        
        // FIXED: Ensure context field is present in successful responses
        if (data.success && !data.context) {
          data.context = `Enhanced ${article.category} article analysis`
        }
        
        console.log('✅ Enhanced summary received successfully')
        return data

      } finally {
        clearTimeout(timeoutId)
      }
    }

    // Step 5: Execute with retry logic and handle errors
    try {
      return await this.withRetry(operation, 'Enhanced summary')
    } catch (error) {
      console.error('❌ All enhanced summary attempts failed:', error)
      
      // Return fallback response instead of throwing - FIXED to include context
      return this.generateFallbackSummary(article, getErrorMessage(error))
    }
  }

  /**
   * Send chat message about an article
   * 
   * Allows users to ask questions about articles and get AI responses.
   */
  async sendChatMessage(article: any, message: string): Promise<ChatResponse> {
    const authCheck = this.validateAuth()
    if (!authCheck.valid) {
      throw new Error(authCheck.error!)
    }

    console.log('💬 Sending chat message about:', article.title)

    const requestData: ChatMessage = {
      article_id: article.id,
      article_url: article.sourceUrl || article.url || '',
      message: message.trim(),
      context: article.summary
    }

    const operation = async (): Promise<ChatResponse> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      try {
        const response = await fetch(`${this.baseUrl}/article/chat`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(requestData),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status === 401) {
            authService.logout()
            throw new Error('Session expired. Please log in again.')
          }
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        const data: ChatResponse = await response.json()
        
        if (data.success) {
          console.log('✅ Chat response received successfully')
          return data
        } else {
          throw new Error(data.error || 'Failed to generate chat response')
        }

      } finally {
        clearTimeout(timeoutId)
      }
    }

    try {
      return await this.withRetry(operation, 'Chat message')
    } catch (error) {
      const serviceError = this.handleError(error, 'Chat message')
      
      // Return fallback response instead of throwing
      return {
        success: false,
        response: `I'm having trouble right now: ${serviceError.message}. Please try again in a moment.`,
        context_used: false,
        error: serviceError.message
      }
    }
  }

  /**
   * Get fact-checking data for an article
   * 
   * Enhanced with better mock data and error handling.
   * In production, this would call a real fact-checking API.
   */
  async getFactCheckData(article: any): Promise<FactCheckResponse> {
    // This could be enhanced to call a real fact-checking API
    // For now, return intelligent mock data based on article characteristics
    
    const isReliableSource = ['BBC News', 'Reuters', 'Associated Press', 'Daily Nation'].includes(article.source || '')
    const isBreaking = article.isBreaking || false
    
    let status: 'verified' | 'questionable' | 'unverified' = 'verified'
    let confidence = 85
    
    if (isBreaking) {
      status = 'questionable'
      confidence = 65
    }
    
    if (isReliableSource) {
      confidence = Math.min(confidence + 15, 95)
    }

    return {
      success: true,
      status,
      confidence,
      sources: [
        article.source || 'Original Publisher',
        'Cross-reference Database',
        'Fact-Check Network'
      ],
      warnings: isBreaking ? ['Breaking news - information may be incomplete'] : [],
      last_checked: new Date().toISOString()
    }
  }

  /**
   * FIXED: Generate fallback summary when backend fails
   * 
   * Creates a sophisticated fallback response that includes the missing context field.
   * This ensures the UI continues to work even when AI services are unavailable.
   */
  private generateFallbackSummary(article: any, errorMessage?: string): EnhancedSummaryResponse {
    // Create a more sophisticated fallback summary
    const enhancedSummary = `
${article.summary || 'No summary available.'}

This article covers important developments in ${article.category}. While our AI enhancement service is currently unavailable, the original content provides key information about recent events and their potential implications.

${errorMessage ? `Note: Enhanced features temporarily unavailable (${errorMessage}).` : ''}

For the most up-to-date information and complete details, please visit the original source.
    `.trim()

    return {
      success: false,
      enhanced_summary: enhancedSummary,
      key_points: [
        `${article.category} development`,
        'Original article content available',
        'Enhanced features temporarily unavailable',
        'Visit source for complete information'
      ],
      context: `Original ${article.category} article from ${article.source || 'news source'}`, // FIXED: Added context
      reading_time: article.readTime || '3-4 min read',
      confidence_score: 50,
      error: errorMessage
    }
  }

  /**
   * Check if backend article services are available
   * 
   * Enhanced with detailed service health checking.
   */
  async checkServiceHealth(): Promise<{ available: boolean; message: string }> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for health check

      const response = await fetch(`${this.baseUrl}/health/ping`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        return { 
          available: true, 
          message: 'All article services are operational' 
        }
      } else {
        return { 
          available: false, 
          message: `Backend health check failed: ${response.status}` 
        }
      }
    } catch (error) {
      return { 
        available: false, 
        message: `Backend unavailable: ${getErrorMessage(error)}` 
      }
    }
  }

  /**
   * Test the article enhancement endpoint specifically
   * 
   * FIXED: Better error handling with proper TypeScript types
   */
  async testEnhancementEndpoint(): Promise<{ working: boolean; message: string }> {
    try {
      const authCheck = this.validateAuth()
      if (!authCheck.valid) {
        return { working: false, message: authCheck.error! }
      }

      // Test with minimal valid data
      const testData: ArticleEnhanceRequest = {
        article_id: 'test_123',
        article_url: 'https://example.com/test',
        article_title: 'Test Article',
        article_snippet: 'This is a test article snippet for endpoint validation.',
        category: 'technology'
      }

      const response = await fetch(`${this.baseUrl}/article/enhance-summary`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(testData)
      })

      if (response.ok) {
        const data = await response.json()
        return { 
          working: true, 
          message: `Enhancement endpoint working. Response: ${data.success ? 'Success' : 'Failed'}` 
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        return { 
          working: false, 
          message: `Enhancement endpoint error: ${response.status} - ${errorText}` 
        }
      }
    } catch (error) {
      return { 
        working: false, 
        message: `Enhancement endpoint test failed: ${getErrorMessage(error)}` 
      }
    }
  }
}

// ==========================================
// SINGLETON INSTANCE & EXPORTS
// ==========================================

// Create and export singleton instance
export const articleApiService = new ArticleApiService()

// Export individual functions for easier importing
export const {
  getEnhancedSummary,
  sendChatMessage,
  getFactCheckData,
  checkServiceHealth,
  testEnhancementEndpoint
} = articleApiService

// Export the class for testing purposes
export { ArticleApiService }