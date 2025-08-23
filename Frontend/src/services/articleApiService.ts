// Frontend/src/services/articleApiService.ts
// FIXED: Service for communicating with backend article enhancement APIs
// Corrected all field name mismatches and resolved TypeScript errors

import { authService } from './authService'

// ==========================================
// BACKEND-MATCHING INTERFACES
// ==========================================

// API response interfaces - these EXACTLY match the backend models
export interface EnhancedSummaryResponse {
  success: boolean
  enhanced_summary: string
  key_points: string[]
  reading_time: string
  confidence_score: number
  scraped_content_preview?: string | null
  error?: string | null
}

export interface ChatResponse {
  success: boolean
  response: string
  context_used: boolean
  error?: string | null
}

export interface FactCheckResponse {
  success: boolean
  status: 'verified' | 'questionable' | 'unverified'
  confidence: number
  sources: string[]
  warnings: string[]
  last_checked: string
}

// ✅ FIXED: Request interfaces now match backend expectations exactly
export interface ArticleEnhanceRequest {
  article_id: string      // ✅ Matches backend field name
  article_url: string     // ✅ Fixed: was source_url
  article_title: string   // ✅ Fixed: was original_title
  article_snippet: string // ✅ Fixed: was original_summary
  category: string        // ✅ Already correct
}

export interface ChatMessage {
  article_id: string
  article_url: string
  message: string
  context?: string
}

// ==========================================
// ERROR HANDLING TYPES
// ==========================================

interface ServiceError {
  message: string
  code: 'AUTH_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'TIMEOUT_ERROR' | 'VALIDATION_ERROR'
  originalError?: unknown
}

// ✅ FIXED: Better error type handling
interface ErrorWithMessage {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message
}

/**
 * Article API Service
 * 
 * FIXED VERSION: Handles communication with backend for:
 * - Enhanced article summaries (with correct field names)
 * - AI chat about articles (with proper error handling)
 * - Fact-checking data (with fallback mechanisms)
 * - Robust error handling and retry logic
 */
export class ArticleApiService {
  private baseUrl: string
  private timeout: number
  private maxRetries: number

  constructor() {
    this.baseUrl = "http://localhost:8000/api"
    this.timeout = 30000 // 30 seconds for AI operations
    this.maxRetries = 3  // Maximum retry attempts
  }

  // ==========================================
  // AUTHENTICATION & HEADERS
  // ==========================================

  /**
   * Get authentication headers with user token
   * Enhanced with better error handling
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('teacup_auth_token')
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  /**
   * Check if user is authenticated with detailed validation
   */
  private validateAuth(): { valid: boolean; error?: string } {
    if (!authService.isLoggedIn()) {
      return { 
        valid: false, 
        error: 'User not authenticated. Please log in to access article features.' 
      }
    }

    const token = localStorage.getItem('teacup_auth_token')
    if (!token) {
      return { 
        valid: false, 
        error: 'Authentication token missing. Please log in again.' 
      }
    }

    return { valid: true }
  }

  // ==========================================
  // ERROR HANDLING UTILITIES
  // ==========================================

  /**
   * ✅ FIXED: Enhanced error handler with proper TypeScript error handling
   */
  private handleError(error: unknown, context: string): ServiceError {
    console.error(`❌ ${context} error:`, error)

    const errorMessage = getErrorMessage(error)

    // Handle AbortError specifically
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        message: 'Request timed out. The server may be busy processing other requests.',
        code: 'TIMEOUT_ERROR',
        originalError: error
      }
    }

    // Handle fetch errors
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
   * ✅ FIXED: Retry mechanism with proper error handling
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
        
        // Don't retry on authentication errors
        if (errorMessage.includes('401') || errorMessage.includes('Session expired')) {
          throw error
        }

        // Don't retry on validation errors (422)
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

    throw lastError
  }

  // ==========================================
  // MAIN API METHODS
  // ==========================================

  /**
   * ✅ FIXED: Get enhanced summary for an article
   * Now sends correct field names that match backend expectations
   * 
   * @param article - Article data to enhance
   * @returns Enhanced summary with additional context
   */
  async getEnhancedSummary(article: any): Promise<EnhancedSummaryResponse> {
    const authCheck = this.validateAuth()
    if (!authCheck.valid) {
      throw new Error(authCheck.error!)
    }

    console.log('📰 Requesting enhanced summary for:', article.title)

    // ✅ FIXED: Request data now matches backend ArticleEnhanceRequest exactly
    const requestData: ArticleEnhanceRequest = {
      article_id: article.id,
      article_url: article.sourceUrl || article.url || '',  // ✅ Fixed field name
      article_title: article.title,                         // ✅ Fixed field name
      article_snippet: article.summary || article.snippet || '', // ✅ Fixed field name
      category: article.category
    }

    // Validate request data before sending
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
          if (response.status === 422) {
            const errorData = await response.json().catch(() => ({}))
            console.error('❌ Validation error details:', errorData)
            throw new Error(`Request validation failed: ${JSON.stringify(errorData)}`)
          }
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }

        const data: EnhancedSummaryResponse = await response.json()
        
        if (data.success) {
          console.log('✅ Enhanced summary received successfully')
          return data
        } else {
          throw new Error(data.error || 'Failed to generate enhanced summary')
        }

      } finally {
        clearTimeout(timeoutId)
      }
    }

    try {
      return await this.withRetry(operation, 'Enhanced summary fetch')
    } catch (error) {
      const serviceError = this.handleError(error, 'Enhanced summary')
      
      // Return fallback enhanced summary instead of throwing
      console.log('🔄 Returning fallback enhanced summary due to error:', serviceError.message)
      return this.generateFallbackSummary(article, serviceError.message)
    }
  }

  /**
   * ✅ FIXED: Send chat message about an article
   * Now includes article_url in the request as backend expects
   * 
   * @param message - User's message
   * @param article - Full article object for context
   * @returns AI response
   */
  async sendChatMessage(message: string, article: any): Promise<ChatResponse> {
    const authCheck = this.validateAuth()
    if (!authCheck.valid) {
      throw new Error(authCheck.error!)
    }

    console.log('💬 Sending chat message:', message.substring(0, 50) + '...')

    // ✅ FIXED: Include all required fields for chat
    const requestData: ChatMessage = {
      article_id: article.id,
      article_url: article.sourceUrl || article.url || '',  // ✅ Added missing field
      message: message,
      context: undefined // Optional field
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
   * Enhanced with better mock data and error handling
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
   * ✅ IMPROVED: Generate fallback summary when backend fails
   * Now includes error context and better formatting
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
      reading_time: article.readTime || '3-4 min read',
      confidence_score: 50,
      error: errorMessage
    }
  }

  /**
   * Check if backend article services are available
   * Enhanced with detailed service health checking
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
   * ✅ FIXED: Better error handling with proper TypeScript types
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