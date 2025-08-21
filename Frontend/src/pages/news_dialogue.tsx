// Frontend/src/pages/news_dialogue.tsx
// ENHANCED: News dialogue page with dynamic background color based on article category
// Background now matches the color of the article card that was clicked

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
 * This page displays:
 * - Enhanced article summary in a dialogue format
 * - Sidebar with sources, fact-checking, and chat option
 * - Overlay chat component for discussing the article
 * 🎨 NEW: Dynamic background color that matches the article's category
 */
export default function NewsDialoguePage() {
  // Router hooks for navigation and data access
  const { id } = useParams<{ id: string }>() // Extract article ID from URL
  const location = useLocation() // Access navigation state
  const navigate = useNavigate() // Programmatic navigation
  
  // Component state management
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  // 🎨 NEW: State for dynamic background color
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' // Default background
  })

  /**
   * Get fallback category color if not passed via navigation
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
   * Create dynamic background style based on category color
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
      } : { r: 10, g: 10, b: 10 };
    };

    const rgb = hexToRgb(categoryColor);
    
    // Create gradient from category color (darker) to very dark
    return {
      background: `linear-gradient(135deg, 
        rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3) 0%, 
        rgba(${Math.max(0, rgb.r - 50)}, ${Math.max(0, rgb.g - 50)}, ${Math.max(0, rgb.b - 50)}, 0.2) 50%,
        rgba(10, 10, 10, 1) 100%
      )`,
      minHeight: '100vh'
    };
  };

  // Initialize article data when component mounts
  useEffect(() => {
    const initializeArticle = () => {
      try {
        // Try to get article from navigation state (passed from NewsCard/SearchComponent click)
        const articleFromState = location.state?.article as NewsArticle
        const categoryColor = location.state?.categoryColor as string
        
        if (articleFromState && articleFromState.id === id) {
          // Article data is available from navigation
          console.log('📰 Article loaded from navigation state:', articleFromState.title)
          console.log('🎨 Category color received:', categoryColor)
          
          setArticle(articleFromState)
          
          // 🎨 SET DYNAMIC BACKGROUND COLOR
          const finalColor = categoryColor || getFallbackCategoryColor(articleFromState.category)
          const dynamicBackground = createBackgroundStyle(finalColor)
          
          console.log('🎨 Setting dialogue background style:', dynamicBackground)
          setBackgroundStyle(dynamicBackground)
          
          setIsLoading(false)
        } else if (id) {
          // Article ID exists but no data - would fetch from backend in real app
          console.warn('⚠️ Article data not found in navigation state for ID:', id)
          setError('Article not found. Please return to the home page and try again.')
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

  // Chat state management functions
  const handleChatOpen = () => {
    console.log('💬 Opening chat for article:', article?.title)
    setIsChatOpen(true)
  }

  const handleChatClose = () => {
    console.log('💬 Closing chat')
    setIsChatOpen(false)
  }

  // Navigation functions
  const handleBackToHome = () => {
    console.log('🏠 Navigating back to home')
    navigate('/')
  }

  const handleBrowserBack = () => {
    console.log('⬅️ Browser back navigation')
    navigate(-1)
  }

  // Loading state
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

  // Error state
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

  // 🎨 Main render - article is loaded successfully with dynamic background
  return (
    <div className="news-dialogue-container" style={backgroundStyle}>
      {/* Navigation Header */}
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

      {/* Main Content Area */}
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

      {/* Overlay Chat Component */}
      {isChatOpen && (
        <NewsChat 
          isOpen={isChatOpen}
          onClose={handleChatClose}
          article={article}
        />
      )}
    </div>
  )
}