// Frontend/src/components/NewsCard.tsx
// ENHANCED: NewsCard component with category color passed to article dialogue
// Now includes the same color that will be used as dialogue background

import React from 'react'
import { Clock, Bookmark, Share2, Play, Pause } from 'lucide-react'
import type { NewsArticle } from '../services/newsApiService'
import { useNavigate } from 'react-router-dom'

// Define component props
interface NewsCardProps {
  article: NewsArticle
  onReadStory?: (articleId: string) => void
  onSaveStory?: (articleId: string) => void
  onPlayAudio?: (articleId: string) => void
  isPlaying?: boolean
  variant?: 'default' | 'hero' | 'compact'
}

export default function NewsCard({ 
  article, 
  onPlayAudio,
  variant = 'default'
}: NewsCardProps) {
  const navigate = useNavigate();
  
  /**
   * Get category-specific colors for news cards
   * Each category has its own distinct color scheme
   * 🎨 NEW: Now includes hex values for dialogue background matching
   */
  const getCategoryColors = (category: string) => {
    const colorMap: { [key: string]: { bg: string; accent: string; text: string; hex: string } } = {
      'Politics': { 
        bg: 'bg-emerald-900', 
        accent: 'border-emerald-500', 
        text: 'text-emerald-300',
        hex: '#064e3b' // Dark emerald for politics
      },
      'Local Trends': { 
        bg: 'bg-slate-700', 
        accent: 'border-slate-400', 
        text: 'text-slate-200',
        hex: '#334155' // Dark slate for local trends
      },
      'Health': { 
        bg: 'bg-amber-900', 
        accent: 'border-amber-500', 
        text: 'text-amber-300',
        hex: '#78350f' // Dark amber for health
      },
      'Sports': { 
        bg: 'bg-red-900', 
        accent: 'border-red-500', 
        text: 'text-red-300',
        hex: '#7f1d1d' // Dark red for sports
      },
      'Business': { 
        bg: 'bg-blue-900', 
        accent: 'border-blue-500', 
        text: 'text-blue-300',
        hex: '#1e3a8a' // Dark blue for business
      },
      'Technology': { 
        bg: 'bg-purple-900', 
        accent: 'border-purple-500', 
        text: 'text-purple-300',
        hex: '#581c87' // Dark purple for technology
      },
      'Entertainment': { 
        bg: 'bg-pink-900', 
        accent: 'border-pink-500', 
        text: 'text-pink-300',
        hex: '#831843' // Dark pink for entertainment
      },
      'Weather': { 
        bg: 'bg-cyan-900', 
        accent: 'border-cyan-500', 
        text: 'text-cyan-300',
        hex: '#164e63' // Dark cyan for weather
      },
      'Education': { 
        bg: 'bg-indigo-900', 
        accent: 'border-indigo-500', 
        text: 'text-indigo-300',
        hex: '#312e81' // Dark indigo for education
      }
    }
    
    return colorMap[category] || { 
      bg: 'bg-gray-800', 
      accent: 'border-gray-500', 
      text: 'text-gray-300',
      hex: '#1f2937' // Default dark gray
    }
  }

  /**
   * Handle mouse entering the card
   * Sends color change event to topbar for dynamic background
   */
  const handleMouseEnter = () => {
    const colors = getCategoryColors(article.category)
    
    console.log(`🎨 NewsCard: Hovering ${article.category} card, sending color:`, colors.hex)
    
    // Create and dispatch custom event with color information
    const colorEvent = new CustomEvent('card-hover', {
      detail: { 
        color: colors.hex,
        category: article.category 
      }
    })
    
    window.dispatchEvent(colorEvent)
  }

  /**
   * Handle mouse leaving the card
   * 🎨 NOTE: This no longer resets topbar color (sticky behavior implemented)
   * Keeping for potential future use or debugging
   */
  const handleMouseLeave = () => {
    // No longer dispatching card-leave event due to sticky topbar implementation
    // console.log('🎨 NewsCard: Left card')
  }

  /**
   * 🎯 ENHANCED: Handle click events for article navigation
   * Now passes both article data AND category color for dialogue background
   */
  const handleReadClick = () => {
    const colors = getCategoryColors(article.category);
    
    console.log('📰 NewsCard clicked:', article.title);
    console.log('🎨 Category color for dialogue:', colors.hex);
    
    // 🎨 Navigate with both article data AND category color
    navigate(`/news/${article.id}`, { 
      state: { 
        article,                    // Full article data
        categoryColor: colors.hex   // 🎨 NEW: Category color for dialogue background
      }
    });
  }

  // Get colors for this card's category
  const colors = getCategoryColors(article.category)

  // Hero variant for featured stories
  if (variant === 'hero') {
    return (
      <div 
        className={`news-card-hero ${colors.bg} ${colors.accent} relative overflow-hidden group cursor-pointer`}
        onClick={handleReadClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-red-500 to-green-600"></div>
        </div>
        
        {/* Breaking news badge */}
        {article.isBreaking && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold pulse">
              🔴 LIVE
            </span>
          </div>
        )}

        {/* Main content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-end">
          <div className="mb-4">
            <span className={`${colors.text} text-sm font-medium uppercase tracking-wide`}>
              {article.category}
            </span>
          </div>
          
          <h2 className="text-white text-2xl font-bold mb-3 line-clamp-2">
            {article.title}
          </h2>
          
          <p className="text-gray-300 text-base mb-4 line-clamp-2">
            {article.summary}
          </p>
        </div>
      </div>
    )
  }

  // Default Spotify-style card variant
  return (
    <div 
      className={`news-card-spotify ${colors.bg} border-l-4 ${colors.accent} group`}
      onClick={handleReadClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
    >
      {/* Breaking news badge */}
      {article.isBreaking && (
        <div className="breaking-badge-spotify">
           BREAKING
        </div>
      )}

      {/* Main content */}
      <div className="p-4 flex-1">
        {/* Category tag */}
        <div className="mb-2">
        </div>

        {/* Title */}
        <h3 className="news-title-spotify text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-gray-100">
          {article.title}
        </h3>
        
        {/* Summary */}
        <p className="news-summary-spotify text-gray-300 text-sm mb-4 line-clamp-3">
          {article.summary}
        </p>
        
        {/* Footer with metadata and actions */}
        <div className="flex items-center justify-between">
        </div>
      </div>

      {/* Click to listen prompt */}
      <div className="click-to-listen">
        <span className="text-gray-400 text-xs">Click to read</span>
      </div>
    </div>
  )
}