// src/layout/Topbar.tsx 
// FIXED Topbar component - properly passes REAL user data to Profile component
// NO MORE HARDCODED INITIALS - everything comes from database

import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Profile from '../components/Profile'
import type { User as AuthUser } from '../services/authService'

// Define the component props - receives REAL user data from App.tsx
interface TopbarProps {
  currentUser: AuthUser | null  // Real user data from database
  onLogout: () => Promise<void>  // Logout function from App.tsx
}

/**
 * Function to convert RGB values to hex format for color transitions
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (value: number) => {
    const hex = Math.round(value).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Function to extract RGB values from hex color
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// Default topbar color in RGB - change these values to easily update the base color
const DEFAULT_R = 128  // Red value (0-255) - Grey color
const DEFAULT_G = 128  // Green value (0-255) - Grey color  
const DEFAULT_B = 128  // Blue value (0-255) - Grey color

/**
 * Topbar Component
 * 
 * The top navigation bar that includes:
 * - Search functionality with autocomplete
 * - Dynamic background color that responds to card hovers
 * - User profile dropdown with real database data
 * 
 * @param currentUser - Real user data from database (includes name, email, etc.)
 * @param onLogout - Function to handle user logout
 */
export default function Topbar({ currentUser, onLogout }: TopbarProps) {
  // State to manage the search input
  const [searchQuery, setSearchQuery] = useState('')
  // State to store the current top color RGB values for smooth transitions
  const [topColor, setTopColor] = useState({ r: DEFAULT_R, g: DEFAULT_G, b: DEFAULT_B })
  // State to control the fade effect
  const [opacity, setOpacity] = useState(1)
  // State to control transition timing (fade out vs fade in)
  const [transitionDuration, setTransitionDuration] = useState('4s')
  // State to track if we're transitioning
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Debug logging to track user data in Topbar
  useEffect(() => {
    if (currentUser) {
      console.log('🔝 Topbar: User data received:', {
        username: currentUser.username,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
        email: currentUser.email
      })
    } else {
      console.log('🔝 Topbar: No user data available')
    }
  }, [currentUser])

  // Listen for custom events from cards being hovered
  useEffect(() => {
    /**
     * Function to handle when a card is hovered
     * Changes the topbar background color to match the card's theme
     */
    const handleCardHover = (event: CustomEvent) => {
      const cardColor = event.detail.color
      // Extract RGB values from the card color
      const cardRgb = hexToRgb(cardColor)
      
      if (!isTransitioning) {
        setIsTransitioning(true)
        // Set fast fade out timing (0.8 seconds)
        setTransitionDuration('0.8s')
        // Fade out current color over 0.8 seconds
        setOpacity(0)
        
        // After fade out completes, change color and fade in over 4 seconds
        setTimeout(() => {
          setTopColor(cardRgb)
          // Set slow fade in timing (4 seconds)
          setTransitionDuration('4s')
          setOpacity(1)
          // Reset transition state after fade in completes
          setTimeout(() => setIsTransitioning(false), 4000)
        }, 800) // Wait 0.8 seconds for fade out to complete
      }
    }

    /**
     * Function to handle when mouse leaves a card
     * Returns the topbar background to default grey color
     */
    const handleCardLeave = () => {
      if (!isTransitioning) {
        setIsTransitioning(true)
        // Set fast fade out timing (0.8 seconds)
        setTransitionDuration('0.8s')
        // Fade out current color over 0.8 seconds
        setOpacity(0)
        
        // After fade out completes, change to grey and fade in over 4 seconds
        setTimeout(() => {
          setTopColor({ r: DEFAULT_R, g: DEFAULT_G, b: DEFAULT_B })
          // Set slow fade in timing (4 seconds)
          setTransitionDuration('4s')
          setOpacity(1)
          // Reset transition state after fade in completes
          setTimeout(() => setIsTransitioning(false), 4000)
        }, 800) // Wait 0.8 seconds for fade out to complete
      }
    }

    // Add event listeners for custom events from cards
    window.addEventListener('card-hover', handleCardHover as EventListener)
    window.addEventListener('card-leave', handleCardLeave)

    // Clean up event listeners when component unmounts
    return () => {
      window.removeEventListener('card-hover', handleCardHover as EventListener)
      window.removeEventListener('card-leave', handleCardLeave)
    }
  }, [isTransitioning]) // Include isTransitioning in dependency array

  /**
   * Handle search form submission
   * Currently logs search query - can be extended to implement actual search
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('🔍 Topbar: Searching for:', searchQuery)
      // TODO: Implement actual search functionality
      // This could navigate to a search results page or filter content
    }
  }

  return (
    <header 
      className="topbar"
      style={{ 
        // Dynamic background gradient that changes based on card hover
        background: `linear-gradient(to bottom, rgb(${topColor.r}, ${topColor.g}, ${topColor.b}), rgb(0, 0, 0))`,
        opacity: opacity,
        // Dynamic transition timing - 0.8s for fade out, 4s for fade in
        transition: `opacity ${transitionDuration} ease`
      }}
    >
      {/* Search form container */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          {/* Search icon */}
          <Search className="search-icon" size={20} />
          {/* Search input field */}
          <input 
            type="text"
            placeholder="Search news, topics, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {/* Clear search button - only shows when there's text */}
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

      {/* Profile component container */}
      {/* This passes REAL user data from database to Profile component */}
      <div className="profile-container">
        <Profile 
          currentUser={currentUser}
          onLogout={onLogout}
        />
      </div>
    </header>
  )
}