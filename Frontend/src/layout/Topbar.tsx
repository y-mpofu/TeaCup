// src/layout/Topbar.tsx 
// FIXED: Topbar component with properly working color changes on news card hover
// Simplified event handling and fixed event listener issues

import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Profile from '../components/Profile'
import type { User as AuthUser } from '../services/authService'

// Define the component props
interface TopbarProps {
  currentUser: AuthUser | null
  onLogout: () => Promise<void>
}

/**
 * Convert hex color to RGB values
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
 * Topbar Component with Dynamic Color Changes
 * 
 * Features:
 * - Search functionality
 * - Dynamic background that changes color when hovering over news cards
 * - Smooth color transitions with proper timing
 * - User profile dropdown
 */
export default function Topbar({ currentUser, onLogout }: TopbarProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  
  // Color transition state
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
     * Handle when mouse leaves a news card
     * Returns topbar to default gray color
     */
    const handleCardLeave = () => {
      if (isTransitioning) return
      
      console.log('🎨 Topbar: Card left, returning to default color')
      
      setIsTransitioning(true)
      
      // Return to default gray
      setBackgroundColor('rgb(75, 75, 75)')
      
      // Reset transition lock
      setTimeout(() => setIsTransitioning(false), 500)
    }

    // Add event listeners
    window.addEventListener('card-hover', handleCardHover)
    window.addEventListener('card-leave', handleCardLeave)

    // Cleanup function
    return () => {
      window.removeEventListener('card-hover', handleCardHover)
      window.removeEventListener('card-leave', handleCardLeave)
    }
  }, [isTransitioning]) // Re-run when transition state changes

  /**
   * Handle search form submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('🔍 Topbar: Searching for:', searchQuery)
      // TODO: Implement actual search functionality
    }
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
        top: 0
      }}
    >
      {/* Search form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text"
            placeholder="Search news, topics, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="clear-search"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </form>

      {/* Profile section */}
      <div className="profile-container">
        <Profile 
          currentUser={currentUser}
          onLogout={onLogout}
        />
      </div>
    </header>
  )
}