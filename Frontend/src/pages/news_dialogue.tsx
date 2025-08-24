// Frontend/src/pages/news_dialogue.tsx
// ENHANCED: News dialogue page with retractable chat functionality
// Integrates floating chat toggle and manages retractable sidebar state

import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import NewsDialogue from '../components/NewsDialogue'
import NewsSidebar from '../components/NewsSidebar'
import NewsChat from '../components/NewsChat'
import type { NewsArticle } from '../services/newsApiService'
import '../styles/news-dialogue.css'

/**
 * Enhanced News Dialogue Page Component
 * 
 * NEW FEATURES ADDED:
 * - Always renders NewsChat component (handles its own visibility)
 * - Supports floating chat toggle when chat is closed
 * - Maintains existing chat functionality
 * - No new state variables introduced
 * 
 * This page displays:
 * - Enhanced article summary in a dialogue format
 * - Sidebar with sources, fact-checking, and chat option
 * - ENHANCED: Always-present retractable chat overlay
 * - Dynamic background color that matches the article's category
 */
export default function NewsDialoguePage() {
  // === EXISTING STATE MANAGEMENT (unchanged) ===
  const { id } = useParams<{ id: string }>() // Extract article ID from URL
  const location = useLocation() // Access navigation state
  const navigate = useNavigate() // Programmatic navigation
  
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false) // Still used for chat state
  
  // Dynamic background color state
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' // Default background
  })

  /**
   * EXISTING FUNCTION: Get fallback category color if not passed via navigation
   * This ensures we always have a color even if navigation state is missing
   */
  const getFallbackCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'politics': '#064e3b',        // Dark emerald
      'sports': '#7f1d1d',          // Dark red
      'health': '#78350f',          // Dark amber
      'business': '#1e3a8a',        // Dark blue
      'technology': '#581c87',      // Dark purple
      'entertainment': '#831843',   // Dark pink
      'education': '#312e81',       // Dark indigo
      'local-trends': '#334155',    // Dark slate
      'weather': '#164e63'          // Dark cyan
    };
    
    return colorMap[category.toLowerCase()] || '#1f2937'; // Default gray
  };

  /**
   * EXISTING FUNCTION: Create dynamic background style based on category color
   * Creates a subtle gradient from the category color to dark
   */
  const createBackgroundStyle = (categoryColor: string): React.CSSProperties => {
    // Convert hex to RGB for gradient manipulation
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 31, g: 41, b: 55 }; // Default gray RGB
    };

    const rgb = hexToRgb(categoryColor);
    
    // Create a subtle gradient that starts with the category color and fades to dark
    return {
      background: `linear-gradient(135deg, 
        rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6) 0%, 
        rgba(${Math.floor(rgb.r * 0.3)}, ${Math.floor(rgb.g * 0.3)}, ${Math.floor(rgb.b * 0.3)}, 0.8) 50%,
        rgba(10, 10, 10, 0.95) 100%)`,
      minHeight: '100vh'
    };
  };

  /**
   * EXISTING FUNCTION: Initialize article data when component mounts
   * Gets article data from location state or fetches from API
   */
  useEffect(() => {
    const initializeArticle = async () => {
      try {
        setIsLoading(true)
        
        if (location.state?.article) {
          // Article data passed via navigation - use it directly
          const passedArticle = location.state.article as NewsArticle
          const passedColor = location.state.categoryColor as string | undefined
          
          console.log('📰 Using article from navigation state:', passedArticle.title)
          setArticle(passedArticle)
          
          // Set dynamic background using passed color or fallback
          const categoryColor = passedColor || getFallbackCategoryColor(passedArticle.category || '')
          setBackgroundStyle(createBackgroundStyle(categoryColor))
          setIsLoading(false)
        } else if (id) {
          // No article in state - need to fetch from API
          console.log('🔍 Fetching article from API with ID:', id)
          
          // TODO: Replace with actual API call to your backend
          // const fetchedArticle = await newsApiService.getArticleById(id)
          // For now, show error since we don't have the article
          setError('Article data not available. Please return to the home page and try again.')
          setIsLoading(false)
        } else {
          // No article ID in URL
          console.error('❌ No article ID provided in URL')
          setError('Invalid article URL. Please return to the home page.')
          setIsLoading(false)
        }
      } catch (err) {
        console.error('💥 Error initializing article:', err)
        setError('Failed to load article. Please try again.')
        setIsLoading(false)
      }
    }

    initializeArticle()
  }, [id, location.state])

  // === EXISTING CHAT STATE MANAGEMENT ===
  const handleChatOpen = () => {
    console.log('💬 Opening chat for article:', article?.title)
    setIsChatOpen(true)
  }

  const handleChatClose = () => {
    console.log('💬 Closing chat')
    setIsChatOpen(false)
  }

  // === EXISTING NAVIGATION FUNCTIONS ===
  const handleBackToHome = () => {
    console.log('🏠 Navigating back to home')
    navigate('/')
  }

  const handleBrowserBack = () => {
    console.log('⬅️ Browser back navigation')
    navigate(-1)
  }

  // === EXISTING LOADING STATE ===
  if (isLoading) {
    return (
      <div className="news-dialogue-loading" style={backgroundStyle}>
        <div className="loading-content">
          <div className="loading-spinner">📰</div>
          <h2>Loading article...</h2>
          <p>Preparing your enhanced news experience</p>
        </div>
      </div>
    )
  }

  // === EXISTING ERROR STATE ===
  if (error || !article) {
    return (
      <div className="news-dialogue-error" style={backgroundStyle}>
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>Article Not Found</h2>
          <p>{error || 'The requested article could not be loaded.'}</p>
          <div className="error-actions">
            <button onClick={handleBackToHome} className="btn-primary">
              <Home size={20} />
              Return to Home
            </button>
            <button onClick={handleBrowserBack} className="btn-secondary">
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // === ENHANCED MAIN RENDER ===
  return (
    <div className="news-dialogue-container" style={backgroundStyle}>
      {/* EXISTING: Navigation Header */}
      <header className="dialogue-header">
        <div className="header-navigation">
          <button 
            onClick={handleBrowserBack} 
            className="nav-button back-button"
            title="Go back"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="breadcrumb">
            <button 
              onClick={handleBackToHome}
              className="breadcrumb-link"
            >
              Home
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{article.category}</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Article</span>
          </div>
        </div>
      </header>

      {/* EXISTING: Main Content Area */}
      <main className="dialogue-main">
        {/* Left Section: Enhanced Article Summary */}
        <section className="dialogue-section">
          <NewsDialogue article={article} />
        </section>

        {/* Right Section: Sidebar with Sources and Chat */}
        <aside className="sidebar-section">
          <NewsSidebar 
            article={article} 
            onChatOpen={handleChatOpen}
          />
        </aside>
      </main>

      {/* ENHANCED: Always render NewsChat component - it handles its own visibility */}
      <NewsChat 
        isOpen={isChatOpen}
        onClose={handleChatClose}
        onOpen={handleChatOpen}  // NEW: Pass open handler for floating toggle
        article={article}
      />
    </div>
  )
}