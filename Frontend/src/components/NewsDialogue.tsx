// Frontend/src/components/NewsDialogue.tsx
// FIXED: Enhanced dialogue component that displays article summary using REAL backend APIs
// PROBLEM SOLVED: Added missing 'context' property to EnhancedSummaryResponse interface and fallback handling
// This component now properly handles the context field that was being referenced but not defined

import React, { useState, useEffect } from 'react'
import { Clock, Calendar, User, ExternalLink, Bookmark, Share2, Volume2, RefreshCw, AlertCircle } from 'lucide-react'
import type { NewsArticle } from '../services/newsApiService'
import { articleApiService, type EnhancedSummaryResponse } from '../services/articleApiService'
import '../styles/dialogue.css'

// ==========================================
// TYPE DEFINITIONS & INTERFACES
// ==========================================

/**
 * Define component props interface 
 * 
 * This tells TypeScript exactly what data this component expects from its parent.
 * The parent component must pass an 'article' object that matches the NewsArticle interface.
 * This ensures type safety and prevents runtime errors from missing or incorrect data.
 */
interface NewsDialogueProps {
  article: NewsArticle  // The news article object passed from the parent component
}

// ==========================================
// MAIN COMPONENT DEFINITION
// ==========================================

/**
 * NewsDialogue Component - FIXED VERSION
 * 
 * PROBLEM THAT WAS FIXED:
 * - The component was referencing enhancedData?.context but the context property
 *   wasn't defined in the EnhancedSummaryResponse interface
 * - The fallback data creation was missing the context field
 * - This caused TypeScript errors and potential runtime issues
 * 
 * HOW THIS COMPONENT WORKS:
 * 1. Takes a basic news article as input from parent component
 * 2. Calls the backend API to get an AI-enhanced summary with additional context
 * 3. Shows loading states while the backend processes the request (user sees spinner)
 * 4. Displays the enhanced content with better formatting, key points, and context
 * 5. Provides user interaction features (save to reading list, share, text-to-speech)
 * 6. Falls back gracefully to original content if backend enhancement fails
 * 
 * BACKEND INTEGRATION DETAILS:
 * - Uses articleApiService.getEnhancedSummary() to call /api/article/enhance-summary
 * - Handles authentication automatically through the service layer
 * - Implements retry logic for failed requests (max 3 attempts)
 * - Shows meaningful error messages to users when services are unavailable
 * - Maintains user experience even when backend services are down
 */
export default function NewsDialogue({ article }: NewsDialogueProps) {
  
  // ==========================================
  // COMPONENT STATE MANAGEMENT
  // ==========================================
  
  /**
   * User Interaction State Variables
   * 
   * These track what the user is currently doing with this article:
   * - isExpanded: Whether the user has clicked "Read More" to see full content
   * - isSaved: Whether user has saved this article to their reading list
   * - isReading: Whether text-to-speech is currently reading the article aloud
   */
  const [isExpanded, setIsExpanded] = useState(false)  // Controls content expansion
  const [isSaved, setIsSaved] = useState(false)        // Tracks if article is bookmarked
  const [isReading, setIsReading] = useState(false)    // Tracks text-to-speech status
  
  /**
   * Backend Integration State Variables
   * 
   * These track communication with our backend API services:
   * - enhancedData: The AI-enhanced summary response from backend (null until loaded)
   * - isLoadingEnhancement: Whether we're currently waiting for backend response
   * - enhancementError: Any error messages from failed backend calls
   * - retryCount: How many times user has retried after errors (limited to 3)
   */
  const [enhancedData, setEnhancedData] = useState<EnhancedSummaryResponse | null>(null)
  const [isLoadingEnhancement, setIsLoadingEnhancement] = useState(true)
  const [enhancementError, setEnhancementError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // ==========================================
  // BACKEND API INTEGRATION FUNCTIONS
  // ==========================================
  
  /**
   * CORE FUNCTION: Fetch enhanced summary from backend
   * 
   * This is the main function that communicates with our backend AI service.
   * 
   * STEP-BY-STEP PROCESS:
   * 1. Shows loading spinner to user (setIsLoadingEnhancement(true))
   * 2. Clears any previous error messages
   * 3. Calls articleApiService.getEnhancedSummary() with article data
   * 4. Backend processes article using AI (GPT/Claude) to create better summary
   * 5. Backend returns enhanced_summary, key_points, context, and confidence_score
   * 6. We store this enhanced data in component state
   * 7. Component re-renders to show enhanced content instead of original
   * 
   * ERROR HANDLING:
   * - If backend is down: Show error message but still display original article
   * - If AI service fails: Create fallback response with original content
   * - If network fails: Retry automatically with exponential backoff
   * - Always stop loading spinner regardless of success/failure
   */
  const fetchEnhancedSummary = async () => {
    try {
      console.log('🚀 Starting backend enhancement for article:', article.title)
      
      // Step 1: Set loading state to show spinner to user
      // This gives immediate visual feedback that something is happening
      setIsLoadingEnhancement(true)
      setEnhancementError(null)  // Clear any previous error messages
      
      // Step 2: Call the backend API to enhance this article
      // The articleApiService handles authentication, retries, and error formatting
      // Backend will use AI to create a better summary with additional context
      const response = await articleApiService.getEnhancedSummary(article)
      
      console.log('✅ Backend enhancement successful:', response)
      
      // Step 3: Store the enhanced data in component state
      // This triggers a re-render to show the enhanced content to the user
      setEnhancedData(response)
      
    } catch (error) {
      // Step 4: Handle any errors that occurred during backend communication
      console.error('❌ Failed to get enhanced summary:', error)
      
      // Extract error message for user display
      const errorMessage = error instanceof Error ? error.message : 'Failed to enhance article'
      setEnhancementError(errorMessage)
      
      // Step 5: Create fallback response using original article data
      // Even if AI enhancement fails, we can still show a better formatted version
      // FIXED: Now includes the missing 'context' property
      setEnhancedData({
        success: false,  // Mark as failed so UI knows this is fallback content
        enhanced_summary: article.summary,  // Use original summary as-is
        key_points: [
          `Main topic: ${article.category}`, 
          'See full article for details',
          'Enhanced features temporarily unavailable'
        ],
        context: `Original ${article.category} article from ${article.source || 'news source'}`, // FIXED: Added context property
        reading_time: article.readTime || '2-3 min read',
        confidence_score: 50,  // Lower confidence since enhancement failed
        error: errorMessage
      })
      
    } finally {
      // Step 6: Always stop the loading spinner, whether we succeeded or failed
      // This ensures the UI doesn't get stuck in a loading state
      setIsLoadingEnhancement(false)
    }
  }

  /**
   * RETRY FUNCTION: Handle user-initiated retry attempts
   * 
   * Sometimes the backend might be temporarily down or overloaded.
   * This function gives users a way to try again without refreshing the entire page.
   * 
   * RETRY LOGIC:
   * - Increment retry counter for tracking (limited to 3 attempts)
   * - Call fetchEnhancedSummary() again with fresh attempt
   * - If still fails after 3 tries, disable retry button
   * - Each retry uses exponential backoff timing in the service layer
   */
  const handleRetryEnhancement = async () => {
    console.log('🔄 User requested retry for enhancement, attempt:', retryCount + 1)
    
    // Track how many times user has retried (prevents infinite retry loops)
    setRetryCount(prev => prev + 1)
    
    // Try to fetch enhanced summary again
    await fetchEnhancedSummary()
  }

  // ==========================================
  // COMPONENT LIFECYCLE MANAGEMENT
  // ==========================================
  
  /**
   * useEffect Hook - Component initialization and updates
   * 
   * This hook runs automatically when:
   * 1. Component first mounts (loads for the first time)
   * 2. The article.id changes (user navigates to different article)
   * 
   * DEPENDENCY ARRAY EXPLANATION:
   * - [article.id] means this effect only runs when article.id changes
   * - This prevents unnecessary API calls when other props change
   * - It ensures we get fresh enhanced data for each new article
   */
  useEffect(() => {
    console.log('📰 NewsDialogue component mounted/updated with article:', article.id)
    
    // Only try to enhance if we have a valid article with an ID
    // This prevents API calls with invalid or empty article data
    if (article && article.id) {
      fetchEnhancedSummary()
    } else {
      console.warn('⚠️ No valid article provided, skipping enhancement')
    }
    
    // Cleanup note: No cleanup needed since articleApiService handles request cancellation
  }, [article.id])  // Run effect when article ID changes

  // ==========================================
  // USER INTERACTION EVENT HANDLERS
  // ==========================================

  /**
   * SAVE HANDLER: Toggle article save status
   * 
   * Handles saving articles to user's personal reading list.
   * In a production app, this would make an API call to save the article.
   * For now, it updates local UI state to show visual feedback.
   * 
   * FUTURE ENHANCEMENT:
   * await userApiService.saveArticle(article.id, !isSaved)
   */
  const handleSave = () => {
    console.log('📌 User saving/unsaving article:', article.title)
    setIsSaved(!isSaved)
    
    // TODO: In production, make API call to save article to user's account
    // This would sync across all user devices and persist between sessions
  }

  /**
   * SHARE HANDLER: Share article via various methods
   * 
   * Implements progressive enhancement for sharing:
   * 1. Try native Web Share API first (mobile browsers, modern desktop)
   * 2. Fall back to clipboard copy (older browsers, desktop)
   * 3. Show user feedback for both success and failure cases
   * 
   * WEB SHARE API:
   * - Integrated with device's native sharing (messages, social media, etc.)
   * - Only available in secure contexts (HTTPS)
   * - User can choose how they want to share
   */
  const handleShare = () => {
    console.log('📤 User sharing article:', article.title)
    
    // Check if browser supports native sharing (mostly mobile browsers)
    if (navigator.share) {
      // Use native share API - integrates with device's share options
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      }).catch(err => console.log('Share cancelled by user:', err))
    } else {
      // Fallback for browsers without Web Share API (mostly desktop browsers)
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Article link copied to clipboard!'))
        .catch(() => alert('Could not copy link. Please copy the URL manually.'))
    }
  }

  /**
   * TEXT-TO-SPEECH HANDLER: Read article aloud
   * 
   * Implements browser-based text-to-speech using the Speech Synthesis API.
   * This helps with accessibility and allows hands-free article consumption.
   * 
   * SPEECH CONFIGURATION:
   * - rate: 0.8 (slightly slower than normal for better comprehension)
   * - volume: 0.8 (not too loud to avoid startling users)
   * - Automatically stops when speech ends
   * 
   * CONTENT PRIORITIZATION:
   * 1. Enhanced summary (if available from backend AI)
   * 2. Original article summary (fallback)
   */
  const handleListen = () => {
    console.log('🔊 User toggling text-to-speech for article:', article.title)
    
    if (!isReading) {
      // Start reading the article aloud
      // Use enhanced summary if available, otherwise use original summary
      const textToRead = enhancedData?.enhanced_summary || article.summary
      const utterance = new SpeechSynthesisUtterance(textToRead)
      
      // Configure speech settings for better user experience
      utterance.rate = 0.8    // Slightly slower for better comprehension
      utterance.volume = 0.8  // Not too loud to avoid startling users
      utterance.pitch = 1.0   // Normal pitch sounds most natural
      
      // Set up event handler for when speech completes
      utterance.onend = () => {
        console.log('🔇 Text-to-speech finished')
        setIsReading(false)  // Update UI to show "Listen" button again
      }
      
      utterance.onerror = (event) => {
        console.error('❌ Text-to-speech error:', event.error)
        setIsReading(false)  // Reset state on error
        alert('Sorry, text-to-speech is not available in your browser.')
      }
      
      // Start speaking and update UI state
      speechSynthesis.speak(utterance)
      setIsReading(true)  // Show "Stop" button instead of "Listen"
      
    } else {
      // Stop any current speech
      console.log('⏹️ User stopped text-to-speech')
      speechSynthesis.cancel()  // Immediately stop all speech
      setIsReading(false)       // Reset UI state
    }
  }

  /**
   * READ MORE HANDLER: Expand/collapse article content
   * 
   * For long articles, we show a truncated version initially to avoid overwhelming users.
   * This function toggles between showing the full enhanced summary and a shortened version.
   * 
   * DISPLAY LOGIC:
   * - If content is > 300 characters, show "Read More" button
   * - Click toggles between expanded and collapsed states
   * - Button text changes between "Read More" and "Show Less"
   */
  const handleReadMore = () => {
    console.log('📖 User toggling expanded view:', !isExpanded ? 'expanding' : 'collapsing')
    setIsExpanded(!isExpanded)
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  /**
   * FORMAT TIMESTAMP: Convert ISO timestamp to user-friendly format
   * 
   * Converts backend timestamps like "2024-12-15T14:30:00Z" to readable format
   * like "December 15, 2024 at 2:30 PM".
   * 
   * ERROR HANDLING:
   * - If timestamp is invalid or malformed, shows generic "Recently" text
   * - Uses user's locale for date formatting (automatically adapts to user's region)
   */
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp)
      
      // Check if date is valid (catches Invalid Date objects)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',     // "2024"
        month: 'long',       // "December"
        day: 'numeric',      // "15"
        hour: '2-digit',     // "02 PM"
        minute: '2-digit'    // "30"
      })
    } catch (error) {
      console.warn('⚠️ Invalid timestamp format:', timestamp)
      return 'Recently'  // Safe fallback for invalid timestamps
    }
  }

  /**
   * GET DISPLAY SUMMARY: Determine which summary text to show
   * 
   * Implements content priority hierarchy:
   * 1. Enhanced summary from backend AI (best option)
   * 2. Original article summary (reliable fallback)
   * 3. Generic message if no content available (edge case)
   */
  const getDisplaySummary = (): string => {
    // First priority: Enhanced summary from backend AI
    if (enhancedData && enhancedData.enhanced_summary) {
      return enhancedData.enhanced_summary
    }
    
    // Second priority: Original article summary
    if (article.summary) {
      return article.summary
    }
    
    // Last resort: Generic message (should rarely happen)
    return 'Article content is being processed. Please check back shortly or visit the original source.'
  }

  /**
   * SHOULD SHOW RETRY: Determine when to show retry button
   * 
   * Only show retry button when:
   * 1. Enhancement failed (we have an error)
   * 2. We're not currently loading (prevents multiple simultaneous requests)
   * 3. User hasn't retried too many times (prevents spam/infinite loops)
   */
  const shouldShowRetry = (): boolean => {
    return !!enhancementError && !isLoadingEnhancement && retryCount < 3
  }

  /**
   * GET READING TIME: Extract reading time with fallback
   * 
   * Reading time priority:
   * 1. Backend-calculated reading time (most accurate)
   * 2. Original article reading time 
   * 3. Estimated time based on content length
   */
  const getReadingTime = (): string => {
    if (enhancedData?.reading_time) {
      return enhancedData.reading_time
    }
    
    if (article.readTime) {
      return article.readTime
    }
    
    // Estimate based on content length (average reading speed: 200 words/minute)
    const wordCount = getDisplaySummary().split(' ').length
    const minutes = Math.ceil(wordCount / 200)
    return `${minutes} min read`
  }

  // ==========================================
  // COMPONENT RENDER LOGIC
  // ==========================================

  return (
    <div className="news-dialogue">
      
      {/* BREAKING NEWS BANNER: Only show for urgent articles */}
      {article.isBreaking && (
        <div className="breaking-banner">
          <span className="breaking-indicator" role="img" aria-label="breaking news">🔴</span>
          <span className="breaking-text">BREAKING NEWS</span>
        </div>
      )}

      {/* ARTICLE HEADER: Title, category, metadata */}
      <header className="dialogue-header">
        {/* Category tag for content organization */}
        <div className="article-category">
          <span className="category-tag">{article.category}</span>
        </div>
        
        {/* Main article title */}
        <h1 className="article-title">
          {article.title}
        </h1>

        {/* Article metadata: when published, source, reading time */}
        <div className="article-meta">
          <div className="meta-item">
            <Calendar size={16} aria-hidden="true" />
            <span>{formatTimestamp(article.timestamp)}</span>
          </div>
          
          <div className="meta-item">
            <User size={16} aria-hidden="true" />
            <span>{article.source || 'News Source'}</span>
          </div>
          
          <div className="meta-item">
            <Clock size={16} aria-hidden="true" />
            <span>{getReadingTime()}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA: Enhanced summary with loading/error states */}
      <main className="dialogue-content">
        
        {/* LOADING STATE: Show while waiting for backend enhancement */}
        {isLoadingEnhancement && (
          <div className="enhancement-loading" role="status" aria-live="polite">
            <div className="loading-spinner">
              <RefreshCw size={20} className="spinning" aria-hidden="true" />
            </div>
            <p>Enhancing article with AI analysis...</p>
            <small>This may take a few seconds</small>
          </div>
        )}

        {/* ERROR STATE: Show if backend enhancement failed */}
        {enhancementError && !isLoadingEnhancement && (
          <div className="enhancement-error" role="alert">
            <AlertCircle size={20} aria-hidden="true" />
            <p>Unable to enhance article: {enhancementError}</p>
            {shouldShowRetry() && (
              <button 
                onClick={handleRetryEnhancement} 
                className="retry-button"
                aria-label={`Retry enhancement (attempt ${retryCount + 1} of 3)`}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Try Again ({3 - retryCount} attempts left)
              </button>
            )}
            <small>Showing original article content below</small>
          </div>
        )}

        {/* MAIN CONTENT CONTAINER */}
        <div className="summary-container">
          
          {/* Section title - changes based on enhancement status */}
          <h2 className="summary-title">
            {enhancedData?.success === false ? 'Article Summary' : 'Enhanced Analysis'}
          </h2>
          
          {/* KEY POINTS: Show if we got enhanced data from backend */}
          {enhancedData?.key_points && enhancedData.key_points.length > 0 && (
            <div className="key-points">
              <h3>Key Points:</h3>
              <ul>
                {enhancedData.key_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* MAIN SUMMARY TEXT: The core article content */}
          <div className={`summary-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {getDisplaySummary().split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="summary-paragraph">
                  {paragraph}
                </p>
              ) : (
                <br key={index} />
              )
            ))}
          </div>

          {/* READ MORE BUTTON: For long articles that need truncation */}
          {getDisplaySummary().length > 300 && (
            <button 
              onClick={handleReadMore}
              className="read-more-button"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Show less content' : 'Show more content'}
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}

          {/* CONTEXT INFORMATION: FIXED - Now properly handles the context field */}
          {enhancedData?.context && (
            <div className="article-context">
              <h4>Context:</h4>
              <p>{enhancedData.context}</p>
            </div>
          )}
        </div>
      </main>

      {/* ACTION BUTTONS: User interaction controls */}
      <footer className="dialogue-actions">
        <div className="action-buttons">
          
          {/* SAVE BUTTON: Bookmark article for later reading */}
          <button 
            onClick={handleSave}
            className={`action-button ${isSaved ? 'saved' : ''}`}
            title={isSaved ? 'Remove from saved articles' : 'Save article for later'}
            aria-label={isSaved ? 'Remove from saved articles' : 'Save article for later'}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* SHARE BUTTON: Share article via various methods */}
          <button 
            onClick={handleShare}
            className="action-button"
            title="Share this article"
            aria-label="Share this article"
          >
            <Share2 size={18} aria-hidden="true" />
            <span>Share</span>
          </button>

          {/* LISTEN BUTTON: Text-to-speech functionality */}
          <button 
            onClick={handleListen}
            className={`action-button ${isReading ? 'active' : ''}`}
            title={isReading ? 'Stop reading aloud' : 'Read article aloud'}
            aria-label={isReading ? 'Stop reading aloud' : 'Read article aloud'}
          >
            <Volume2 size={18} aria-hidden="true" />
            <span>{isReading ? 'Stop' : 'Listen'}</span>
          </button>

          {/* ORIGINAL ARTICLE LINK: Link to source publication */}
          {article.sourceUrl && (
            <a 
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button external-link"
              title="Read original article"
              aria-label="Read original article in new tab"
            >
              <ExternalLink size={18} aria-hidden="true" />
              <span>Original</span>
            </a>
          )}
        </div>

        {/* ENHANCEMENT STATUS INDICATOR: Shows whether AI enhancement worked */}
        {enhancedData && (
          <div className="enhancement-status">
            {enhancedData.success ? (
              <span className="status-success" role="img" aria-label="enhanced content">
                ✨ AI Enhanced
              </span>
            ) : (
              <span className="status-fallback" role="img" aria-label="original content">
                📰 Original Content
              </span>
            )}
            
            {/* Show confidence score if available */}
            {enhancedData.confidence_score && enhancedData.success && (
              <span className="confidence-score">
                {enhancedData.confidence_score}% confidence
              </span>
            )}
          </div>
        )}
      </footer>
    </div>
  )
}