// Frontend/src/components/NewsDialogue.tsx
// Enhanced dialogue component that displays article summary in a conversational format

import React, { useState } from 'react'
import { Clock, Calendar, User, ExternalLink, Bookmark, Share2, Volume2 } from 'lucide-react'
import type { NewsArticle } from '../services/newsApiService'
import '../styles/dialogue.css'

// Define component props interface
interface NewsDialogueProps {
  article: NewsArticle
}

/**
 * NewsDialogue Component
 * 
 * Displays the article in an enhanced dialogue format with:
 * - Article metadata (time, source, category)
 * - Enhanced summary content
 * - Action buttons (save, share, listen)
 * - Reading progress and engagement features
 */
export default function NewsDialogue({ article }: NewsDialogueProps) {
  // Component state for user interactions
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isReading, setIsReading] = useState(false)

  // Generate enhanced summary (for now, we'll create a mock enhanced version)
  const generateEnhancedSummary = (originalSummary: string): string => {
    // In a real app, this would come from GPT or backend enhancement
    // For now, we'll create a more detailed version
    const enhancedParts = [
      "Breaking down this developing story:",
      "",
      originalSummary,
      "",
      "Key implications of this development include potential shifts in regional policy and increased stakeholder engagement. Local communities are closely monitoring the situation as it unfolds.",
      "",
      "This story continues to develop, with officials promising updates as more information becomes available. The broader context suggests this could have lasting impacts on the region's economic and social landscape."
    ]
    
    return enhancedParts.join('\n')
  }

  const enhancedSummary = generateEnhancedSummary(article.summary)

  // Handle user actions
  const handleSave = () => {
    console.log('📌 Saving article:', article.title)
    setIsSaved(!isSaved)
    // In real app, would save to user's reading list
  }

  const handleShare = () => {
    console.log('📤 Sharing article:', article.title)
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      })
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Article link copied to clipboard!')
    }
  }

  const handleListen = () => {
    console.log('🔊 Text-to-speech for article:', article.title)
    setIsReading(!isReading)
    
    if (!isReading) {
      // Start text-to-speech
      const utterance = new SpeechSynthesisUtterance(enhancedSummary)
      utterance.rate = 0.8
      utterance.onend = () => setIsReading(false)
      speechSynthesis.speak(utterance)
    } else {
      // Stop text-to-speech
      speechSynthesis.cancel()
    }
  }

  const handleReadMore = () => {
    setIsExpanded(!isExpanded)
  }

  // Format timestamp for display
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
      return 'Recently'
    }
  }

  return (
    <div className="news-dialogue">
      {/* Breaking News Badge */}
      {article.isBreaking && (
        <div className="breaking-banner">
          <span className="breaking-indicator">🔴</span>
          <span className="breaking-text">BREAKING NEWS</span>
        </div>
      )}

      {/* Article Header */}
      <header className="dialogue-header">
        <div className="article-category">
          <span className="category-tag">{article.category}</span>
        </div>
        
        <h1 className="article-title">
          {article.title}
        </h1>

        {/* Article Metadata */}
        <div className="article-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>{formatTimestamp(article.timestamp)}</span>
          </div>
          
          <div className="meta-item">
            <User size={16} />
            <span>{article.source}</span>
          </div>
          
          <div className="meta-item">
            <Clock size={16} />
            <span>{article.readTime}</span>
          </div>
        </div>
      </header>

      {/* Enhanced Summary Content */}
      <main className="dialogue-content">
        <div className="summary-container">
          <h2 className="summary-title">Enhanced Analysis</h2>
          
          <div className={`summary-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {enhancedSummary.split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="summary-paragraph">
                  {paragraph}
                </p>
              ) : (
                <br key={index} />
              )
            ))}
          </div>

          {enhancedSummary.length > 300 && (
            <button 
              onClick={handleReadMore}
              className="read-more-button"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>

      </main>

      {/* Action Buttons */}
      <footer className="dialogue-actions">
        <div className="action-buttons">
          <button 
            onClick={handleSave}
            className={`action-button save-button ${isSaved ? 'saved' : ''}`}
            title={isSaved ? 'Remove from saved' : 'Save article'}
          >
            <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Saved' : 'Save'}
          </button>

          <button 
            onClick={handleShare}
            className="action-button share-button"
            title="Share article"
          >
            <Share2 size={20} />
            Share
          </button>

          <button 
            onClick={handleListen}
            className={`action-button listen-button ${isReading ? 'reading' : ''}`}
            title={isReading ? 'Stop reading' : 'Listen to article'}
          >
            <Volume2 size={20} />
            {isReading ? 'Stop' : 'Listen'}
          </button>
        </div>

        {/* Reading Progress */}
        <div className="reading-info">
          <span className="reading-time">
            Estimated reading time: {article.readTime}
          </span>
        </div>
      </footer>
    </div>
  )
}