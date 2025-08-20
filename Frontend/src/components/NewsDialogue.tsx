// Frontend/src/components/NewsDialogue.tsx
// Enhanced dialogue component that displays article summary using REAL backend APIs
// This component now fetches enhanced summaries from the backend instead of using mock data

import React, { useState, useEffect } from 'react'
import { Clock, Calendar, User, ExternalLink, Bookmark, Share2, Volume2, RefreshCw, AlertCircle } from 'lucide-react'
import type { NewsArticle } from '../services/newsApiService'
import { articleApiService, type EnhancedSummaryResponse } from '../services/articleApiService'
import '../styles/dialogue.css'

// Define component props interface - this tells TypeScript what data this component expects
interface NewsDialogueProps {
  article: NewsArticle  // The news article object passed from the parent component
}

/**
 * NewsDialogue Component
 * 
 * This component displays an enhanced article summary by:
 * 1. Taking a basic news article as input
 * 2. Calling the backend to get an AI-enhanced summary 
 * 3. Showing loading states while the backend processes the request
 * 4. Displaying the enhanced content with better formatting and context
 * 5. Providing user interaction features (save, share, listen)
 * 
 * BACKEND INTEGRATION:
 * - Uses articleApiService to call /api/article/enhance-summary
 * - Handles authentication automatically through the service
 * - Falls back to original summary if backend fails
 * - Shows loading states during API calls
 */
export default function NewsDialogue({ article }: NewsDialogueProps) {
  
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // User interaction states - these track what the user is doing
  const [isExpanded, setIsExpanded] = useState(false)  // Whether full content is shown
  const [isSaved, setIsSaved] = useState(false)        // Whether user saved this article
  const [isReading, setIsReading] = useState(false)    // Whether text-to-speech is active
  
  // Backend integration states - these track communication with our API
  const [enhancedData, setEnhancedData] = useState<EnhancedSummaryResponse | null>(null)  // The enhanced summary from backend
  const [isLoadingEnhancement, setIsLoadingEnhancement] = useState(true)  // Whether we're waiting for backend
  const [enhancementError, setEnhancementError] = useState<string | null>(null)  // Any errors from backend
  const [retryCount, setRetryCount] = useState(0)  // How many times we've tried to get enhanced summary

  // ==========================================
  // BACKEND INTEGRATION - ENHANCED SUMMARY
  // ==========================================
  
  /**
   * Fetch enhanced summary from backend
   * 
   * This function:
   * 1. Calls our backend API to enhance the article summary
   * 2. Handles loading states so user knows something is happening
   * 3. Manages errors if the backend is down or fails
   * 4. Falls back to original content if enhancement fails
   */
  const fetchEnhancedSummary = async () => {
    try {
      console.log('🚀 Starting backend enhancement for article:', article.title)
      
      // Set loading state - this will show a spinner to the user
      setIsLoadingEnhancement(true)
      setEnhancementError(null)  // Clear any previous errors
      
      // Call the backend API to enhance this article
      // This sends the article data to our Flask/FastAPI backend
      // The backend uses AI (like GPT) to create a better summary
      const response = await articleApiService.getEnhancedSummary(article)
      
      console.log('✅ Backend enhancement successful:', response)
      
      // Store the enhanced data in our component state
      // This will trigger a re-render to show the enhanced content
      setEnhancedData(response)
      
    } catch (error) {
      // Something went wrong with the backend call
      console.error('❌ Failed to get enhanced summary:', error)
      
      // Store the error message to show to the user
      const errorMessage = error instanceof Error ? error.message : 'Failed to enhance article'
      setEnhancementError(errorMessage)
      
      // Even if enhancement fails, we can still show the original article
      // Create a fallback response using the original article data
      setEnhancedData({
        success: false,  // Mark as failed
        enhanced_summary: article.summary,  // Use original summary
        key_points: [`Main topic: ${article.category}`, 'See full article for details'],
        context: `Original ${article.category} article`,
        reading_time: article.readTime || '2-3 min read',
        confidence_score: 50  // Lower confidence since enhancement failed
      })
      
    } finally {
      // Always stop the loading spinner, whether we succeeded or failed
      setIsLoadingEnhancement(false)
    }
  }

  /**
   * Retry enhancement if it failed
   * 
   * Sometimes the backend might be temporarily down or overloaded
   * This gives users a way to try again without refreshing the page
   */
  const handleRetryEnhancement = async () => {
    console.log('🔄 User requested retry for enhancement')
    
    // Increment retry counter for tracking
    setRetryCount(prev => prev + 1)
    
    // Try to fetch enhanced summary again
    await fetchEnhancedSummary()
  }

  // ==========================================
  // COMPONENT LIFECYCLE
  // ==========================================
  
  /**
   * useEffect Hook - runs when component mounts or article changes
   * 
   * This is where we automatically fetch the enhanced summary
   * when the component first loads or when a new article is passed in
   */
  useEffect(() => {
    console.log('📰 NewsDialogue component mounted/updated with article:', article.id)
    
    // Only try to enhance if we have a valid article
    if (article && article.id) {
      fetchEnhancedSummary()
    }
    
    // The dependency array [article.id] means this effect runs when:
    // 1. Component first mounts
    // 2. The article ID changes (user views different article)
  }, [article.id])

  // ==========================================
  // USER INTERACTION HANDLERS
  // ==========================================

  /**
   * Handle saving article to user's reading list
   * 
   * In a real app, this would save to a database
   * For now, it just toggles the visual state
   */
  const handleSave = () => {
    console.log('📌 User saving/unsaving article:', article.title)
    setIsSaved(!isSaved)
    
    // TODO: In production, make API call to save article to user's account
    // await userApiService.saveArticle(article.id, !isSaved)
  }

  /**
   * Handle sharing article
   * 
   * Uses the Web Share API if available (mobile browsers)
   * Falls back to copying link to clipboard on desktop
   */
  const handleShare = () => {
    console.log('📤 User sharing article:', article.title)
    
    // Check if browser supports native sharing (mostly mobile)
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      }).catch(err => console.log('Share cancelled:', err))
    } else {
      // Fallback for browsers without Web Share API (mostly desktop)
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Article link copied to clipboard!'))
        .catch(() => alert('Could not copy link. Please copy the URL manually.'))
    }
  }

  /**
   * Handle text-to-speech functionality
   * 
   * Uses the browser's built-in speech synthesis to read the article aloud
   * Toggles between starting and stopping the speech
   */
  const handleListen = () => {
    console.log('🔊 User toggling text-to-speech for article:', article.title)
    
    if (!isReading) {
      // Start reading the enhanced summary aloud
      const textToRead = enhancedData?.enhanced_summary || article.summary
      const utterance = new SpeechSynthesisUtterance(textToRead)
      
      // Configure speech settings for better user experience
      utterance.rate = 0.8  // Slightly slower than normal for better comprehension
      utterance.volume = 0.8  // Not too loud
      
      // When speech ends, update our state
      utterance.onend = () => {
        console.log('🔇 Text-to-speech finished')
        setIsReading(false)
      }
      
      // Start speaking
      speechSynthesis.speak(utterance)
      setIsReading(true)
      
    } else {
      // Stop any current speech
      console.log('⏹️ User stopped text-to-speech')
      speechSynthesis.cancel()
      setIsReading(false)
    }
  }

  /**
   * Handle expanding/collapsing full article content
   * 
   * For long articles, we show a truncated version first
   * This lets users expand to see the full enhanced summary
   */
  const handleReadMore = () => {
    console.log('📖 User toggling expanded view')
    setIsExpanded(!isExpanded)
  }

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  /**
   * Format timestamp for user-friendly display
   * 
   * Converts ISO timestamp to readable format like "December 15, 2024 at 2:30 PM"
   */
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      // If timestamp is invalid, show a generic message
      return 'Recently'
    }
  }

  /**
   * Determine what summary text to display
   * 
   * Priority order:
   * 1. Enhanced summary from backend (if available)
   * 2. Original article summary (fallback)
   */
  const getDisplaySummary = (): string => {
    if (enhancedData && enhancedData.enhanced_summary) {
      return enhancedData.enhanced_summary
    }
    return article.summary
  }

  /**
   * Check if we should show the retry button
   * 
   * Only show retry if:
   * 1. Enhancement failed
   * 2. We're not currently loading
   * 3. User hasn't retried too many times
   */
  const shouldShowRetry = (): boolean => {
    return !!enhancementError && !isLoadingEnhancement && retryCount < 3
  }

  // ==========================================
  // RENDER COMPONENT
  // ==========================================

  return (
    <div className="news-dialogue">
      
      {/* Breaking News Badge - only show for urgent articles */}
      {article.isBreaking && (
        <div className="breaking-banner">
          <span className="breaking-indicator">🔴</span>
          <span className="breaking-text">BREAKING NEWS</span>
        </div>
      )}

      {/* Article Header - title, category, metadata */}
      <header className="dialogue-header">
        <div className="article-category">
          <span className="category-tag">{article.category}</span>
        </div>
        
        <h1 className="article-title">
          {article.title}
        </h1>

        {/* Article Metadata - when published, source, reading time */}
        <div className="article-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>{formatTimestamp(article.timestamp)}</span>
          </div>
          
          <div className="meta-item">
            <User size={16} />
            <span>{article.source || 'News Source'}</span>
          </div>
          
          <div className="meta-item">
            <Clock size={16} />
            <span>{enhancedData?.reading_time || article.readTime || '3-5 min read'}</span>
          </div>
        </div>
      </header>

      {/* Enhanced Summary Content - the main article body */}
      <main className="dialogue-content">
        
        {/* Loading State - show while waiting for backend */}
        {isLoadingEnhancement && (
          <div className="enhancement-loading">
            <div className="loading-spinner">
              <RefreshCw size={20} className="spinning" />
            </div>
            <p>Enhancing article with AI analysis...</p>
            <small>This may take a few seconds</small>
          </div>
        )}

        {/* Error State - show if backend enhancement failed */}
        {enhancementError && !isLoadingEnhancement && (
          <div className="enhancement-error">
            <AlertCircle size={20} />
            <p>Unable to enhance article: {enhancementError}</p>
            {shouldShowRetry() && (
              <button onClick={handleRetryEnhancement} className="retry-button">
                <RefreshCw size={16} />
                Try Again
              </button>
            )}
            <small>Showing original article content below</small>
          </div>
        )}

        {/* Main Content Container */}
        <div className="summary-container">
          
          {/* Section Title */}
          <h2 className="summary-title">
            {enhancedData?.success === false ? 'Article Summary' : 'Enhanced Analysis'}
          </h2>
          
          {/* Key Points - if we got enhanced data from backend */}
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
          
          {/* Main Summary Text */}
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

          {/* Read More Button - for long articles */}
          {getDisplaySummary().length > 300 && (
            <button 
              onClick={handleReadMore}
              className="read-more-button"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}

          {/* Context Information - if backend provided extra context */}
          {enhancedData?.context && (
            <div className="article-context">
              <h4>Context:</h4>
              <p>{enhancedData.context}</p>
            </div>
          )}
        </div>
      </main>

      {/* Action Buttons - save, share, listen */}
      <footer className="dialogue-actions">
        <div className="action-buttons">
          
          {/* Save Button */}
          <button 
            onClick={handleSave}
            className={`action-button ${isSaved ? 'saved' : ''}`}
            title={isSaved ? 'Remove from saved articles' : 'Save article for later'}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="action-button"
            title="Share this article"
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>

          {/* Listen Button - Text to Speech */}
          <button 
            onClick={handleListen}
            className={`action-button ${isReading ? 'active' : ''}`}
            title={isReading ? 'Stop reading aloud' : 'Read article aloud'}
          >
            <Volume2 size={18} />
            <span>{isReading ? 'Stop' : 'Listen'}</span>
          </button>

          {/* Link to Original Article */}
          {article.sourceUrl && (
            <a 
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button external-link"
              title="Read original article"
            >
              <ExternalLink size={18} />
              <span>Original</span>
            </a>
          )}
        </div>

        {/* Enhancement Status Indicator */}
        {enhancedData && (
          <div className="enhancement-status">
            {enhancedData.success ? (
              <span className="status-success">
                ✅ AI Enhanced ({enhancedData.confidence_score}% confidence)
              </span>
            ) : (
              <span className="status-fallback">
                📰 Original Content
              </span>
            )}
          </div>
        )}
      </footer>
    </div>
  )
}