// Frontend/src/pages/news_dialogue.tsx
// Main news dialogue page that displays article details with enhanced summary and chat functionality

import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import NewsDialogue from '../components/NewsDialogue'
import NewsSidebar from '../components/NewsSidebar'
import NewsChat from '../components/NewsChat'
import type { NewsArticle } from '../services/newsApiService'
import '../styles/news-dialogue.css'

/**
 * News Dialogue Page Component
 * 
 * This page displays:
 * - Enhanced article summary in a dialogue format
 * - Sidebar with sources, fact-checking, and chat option
 * - Overlay chat component for discussing the article
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

  // Initialize article data when component mounts
  useEffect(() => {
    const initializeArticle = () => {
      try {
        // Try to get article from navigation state (passed from NewsCard click)
        const articleFromState = location.state?.article as NewsArticle
        
        if (articleFromState && articleFromState.id === id) {
          // Article data is available from navigation
          console.log('📰 Article loaded from navigation state:', articleFromState.title)
          setArticle(articleFromState)
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
      <div className="news-dialogue-loading">
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
      <div className="news-dialogue-error">
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

  // Main render - article is loaded successfully
  return (
    <div className="news-dialogue-container">
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