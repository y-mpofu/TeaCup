// Frontend/src/layout/Topbar.tsx 
// ENHANCED: Topbar component with integrated SearchComponent that navigates to article dialogue
// Now includes working search functionality with the same navigation behavior as NewsCard clicks

import React, { useState, useEffect } from 'react'
import Profile from '../components/Profile'
import SearchComponent from '../components/SearchComponent' // Import our enhanced SearchComponent
import type { User as AuthUser } from '../services/authService'
import type { NewsArticle } from '../services/newsApiService'

// Define the component props
interface TopbarProps {
  currentUser: AuthUser | null
  onLogout: () => Promise<void>
}

/**
 * Convert hex color to RGB values for background transitions
 * Used when news cards are hovered to change topbar color
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 75, g: 75, b: 75 } // Default gray if parsing fails
}

/**
 * Enhanced Topbar Component with Integrated Search
 * 
 * Features:
 * - Integrated SearchComponent that navigates to article dialogue
 * - Dynamic background that changes color when hovering over news cards
 * - Smooth color transitions with proper timing
 * - User profile dropdown
 * - Search results that behave exactly like NewsCard clicks
 */
export default function Topbar({ currentUser, onLogout }: TopbarProps) {
  // Color transition state for dynamic background
  const [backgroundColor, setBackgroundColor] = useState('rgb(75, 75, 75)') // Default dark gray
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Debug logging for user data
  useEffect(() => {
    if (currentUser) {
      console.log('🔝 Topbar: User data loaded:', {
        username: currentUser.username,
        name: `${currentUser.first_name} ${currentUser.last_name}`
      })
    }
  }, [currentUser])

  // Set up event listeners for card hover effects
  useEffect(() => {
    /**
     * Handle when a news card is hovered
     * Changes topbar background to match the card's category color
     * NEW: Color persists until another card is hovered (no reset on card leave)
     */
    const handleCardHover = (event: any) => {
      if (isTransitioning) return // Prevent rapid color changes
      
      const cardColor = event.detail?.color
      if (!cardColor) {
        console.warn('🔝 Topbar: No color received from card hover event')
        return
      }

      console.log('🎨 Topbar: Card hovered, changing color to:', cardColor)
      
      setIsTransitioning(true)
      
      // Convert hex to RGB for background
      const rgb = hexToRgb(cardColor)
      const newBackground = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
      
      // Apply the new color
      setBackgroundColor(newBackground)
      
      // Reset transition lock after animation completes
      setTimeout(() => setIsTransitioning(false), 500)
    }

    /**
     * REMOVED: handleCardLeave function 
     * 
     * Previously, this would reset the topbar to gray when leaving a card.
     * Now we want the topbar to retain the last card's color until a new card is hovered.
     * This eliminates the annoying "flicker" effect when moving cursor between cards.
     */

    // Only add event listener for card hover (not card leave)
    window.addEventListener('card-hover', handleCardHover)

    // Cleanup function - only remove the hover listener
    return () => {
      window.removeEventListener('card-hover', handleCardHover)
    }
  }, [isTransitioning]) // Re-run when transition state changes

  /**
   * 🎯 KEY FEATURE: Handle article selection from search results
   * 
   * This function receives the selected article from SearchComponent
   * and ensures it navigates to the article dialogue page.
   * 
   * Since SearchComponent already handles the navigation internally,
   * this is primarily for logging and any additional processing.
   */
  const handleSearchArticleSelect = (article: NewsArticle) => {
    console.log('🔍 Topbar: Search article selected:', article.title)
    console.log('🚀 SearchComponent will handle navigation to article dialogue')
    
    // The SearchComponent already handles navigation via useNavigate,
    // so we don't need to do anything else here.
    // This callback is available for any additional processing if needed.
    
    // Example: Track search interactions for analytics
    // analytics.track('search_article_selected', {
    //   article_id: article.id,
    //   article_title: article.title,
    //   search_source: 'topbar'
    // })
  }

  return (
    <header 
      className="topbar"
      style={{ 
        // Dynamic background with smooth transition
        background: `linear-gradient(to bottom, ${backgroundColor}, rgb(0, 0, 0))`,
        // Smooth color transitions
        transition: 'background 0.5s ease',
        // Ensure topbar stays on top
        zIndex: 1000,
        position: 'sticky',
        top: 0,
        // Additional styling for better layout
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '80px'
      }}
    >
      {/* Left side: Logo/Brand */}
      <div className="topbar-brand">
        <h1 style={{
          color: 'white',
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
           TeaCup
        </h1>
      </div>

      {/* 🎯 CENTER: INTEGRATED SEARCH COMPONENT */}
      <div className="topbar-search" style={{
        flex: 1,
        maxWidth: '500px',
        margin: '0 2rem'
      }}>
        <SearchComponent
          onArticleSelect={handleSearchArticleSelect}
          placeholder="Search news articles..."
          className="topbar-search-component"
        />
      </div>

      {/* Right side: Profile section */}
      <div className="topbar-profile">
        <Profile 
          currentUser={currentUser}
          onLogout={onLogout}
        />
      </div>
    </header>
  )
}