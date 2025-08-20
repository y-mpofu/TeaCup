// // src/components/NewsCard.tsx
// // Enhanced news card with Spotify-style visual design and Pan-African aesthetic

// import React from 'react'
// import { Clock, Bookmark, Share2, Play, Pause } from 'lucide-react'
// import type { NewsArticle } from '../data/mockNews'

// // Define the props that this component expects
// interface NewsCardProps {
//   article: NewsArticle
//   onReadStory?: (articleId: string) => void
//   onSaveStory?: (articleId: string) => void
//   onPlayAudio?: (articleId: string) => void
//   isPlaying?: boolean // Track if this story is currently playing
//   variant?: 'default' | 'hero' | 'compact' // Different card styles
// }

// export default function NewsCard({ 
//   article, 
//   onReadStory, 
//   onSaveStory, 
//   onPlayAudio,
//   isPlaying = false,
//   variant = 'default'
// }: NewsCardProps) {
  
//   // Handle when user clicks to read the story
//   const handleReadClick = () => {
//     if (onReadStory) {
//       onReadStory(article.id)
//     }
//   }

//   // Handle when user clicks to save the story
//   const handleSaveClick = (e: React.MouseEvent) => {
//     e.stopPropagation()
//     if (onSaveStory) {
//       onSaveStory(article.id)
//     }
//   }

//   // Handle when user clicks to play audio
//   const handlePlayClick = (e: React.MouseEvent) => {
//     e.stopPropagation()
//     if (onPlayAudio) {
//       onPlayAudio(article.id)
//     }
//   }

//   // Get category color scheme (Pan-African inspired)
//   const getCategoryColors = (category: string) => {
//     const colorMap: { [key: string]: { bg: string; accent: string; text: string } } = {
//       'Politics': { bg: 'bg-emerald-900', accent: 'border-emerald-500', text: 'text-emerald-300' },
//       'Local Trends': { bg: 'bg-slate-700', accent: 'border-slate-400', text: 'text-slate-200' },
//       'Health': { bg: 'bg-amber-900', accent: 'border-amber-500', text: 'text-amber-300' },
//       'Sports': { bg: 'bg-red-900', accent: 'border-red-500', text: 'text-red-300' },
//       'Business': { bg: 'bg-blue-900', accent: 'border-blue-500', text: 'text-blue-300' },
//       'Technology': { bg: 'bg-purple-900', accent: 'border-purple-500', text: 'text-purple-300' },
//       'Entertainment': { bg: 'bg-pink-900', accent: 'border-pink-500', text: 'text-pink-300' },
//       'Weather': { bg: 'bg-cyan-900', accent: 'border-cyan-500', text: 'text-cyan-300' },
//       'Education': { bg: 'bg-indigo-900', accent: 'border-indigo-500', text: 'text-indigo-300' }
//     }
//     return colorMap[category] || { bg: 'bg-gray-800', accent: 'border-gray-500', text: 'text-gray-300' }
//   }

//   const colors = getCategoryColors(article.category)

//   // Hero variant for featured stories
//   if (variant === 'hero') {
//     return (
//       <div 
//         className={`news-card-hero ${colors.bg} ${colors.accent} relative overflow-hidden group cursor-pointer`}
//         onClick={handleReadClick}
//       >
//         {/* Background pattern overlay */}
//         <div className="absolute inset-0 opacity-10">
//           <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-red-500 to-green-600"></div>
//         </div>
        
//         {/* Breaking news badge */}
//         {article.isBreaking && (
//           <div className="absolute top-4 left-4 z-10">
//             <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold pulse">
//               🔴 LIVE
//             </span>
//           </div>
//         )}

//         {/* Action buttons - moved to top right */}
//         <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
//           <button 
//             className="action-btn-hero" 
//             onClick={handleSaveClick}
//             title="Save article"
//           >
//             <Bookmark size={18} />
//           </button>
          
//           <button 
//             className="action-btn-hero" 
//             onClick={(e) => e.stopPropagation()}
//             title="Share article"
//           >
//             <Share2 size={18} />
//           </button>
//         </div>

//         {/* Large play button overlay */}
//         <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//           <button 
//             className="play-button-large"
//             onClick={handlePlayClick}
//           >
//             {isPlaying ? (
//               <Pause size={32} className="text-white" />
//             ) : (
//               <Play size={32} className="text-white ml-1" />
//             )}
//           </button>
//         </div>

//         {/* Content */}
//         <div className="relative z-10 p-6 h-full flex flex-col justify-end">
//           <div className="mb-4">
//             <span className={`${colors.text} text-sm font-medium uppercase tracking-wide`}>
//               {article.category}
//             </span>
//           </div>
          
//           <h2 className="text-white text-2xl font-bold mb-3 line-clamp-2">
//             {article.title}
//           </h2>
          
//           <p className="text-gray-300 text-base mb-4 line-clamp-2">
//             {article.summary}
//           </p>

//           <div className="flex items-center gap-3 text-gray-400 text-sm">
//             <Clock size={14} />
//             <span>{article.timestamp}</span>
//             <span>•</span>
//             <span>{article.readTime}</span>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Default card variant
//   return (
//     <div 
//       className={`news-card-spotify ${colors.bg} border-l-4 ${colors.accent} group`}
//       onClick={handleReadClick}
//       role="button"
//       tabIndex={0}
//     >
//       {/* Breaking news badge */}
//       {article.isBreaking && (
//         <div className="breaking-badge-spotify">
//            BREAKING
//         </div>
//       )}

//       {/* Main content area */}
//       <div className="p-4 flex-1">
//         {/* Category tag */}
//         <div className="mb-2">
//           <span className={`category-tag ${colors.text}`}>
//             {article.category}
//           </span>
//         </div>

//         {/* Title */}
//         <h3 className="news-title-spotify text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-gray-100">
//           {article.title}
//         </h3>
        
//         {/* Summary */}
//         <p className="news-summary-spotify text-gray-300 text-sm mb-4 line-clamp-3">
//           {article.summary}
//         </p>
        
//         {/* Footer with metadata and actions */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2 text-gray-400 text-xs">
//             <Clock size={12} />
//             <span>{article.timestamp}</span>
//             <span className="text-gray-600">•</span>
//             <span>{article.readTime}</span>
//           </div>
          
//           {/* Action buttons */}
//           <div className="flex items-center gap-1">
//             {/* Play/Pause button with Spotify-style design */}
//             <button 
//               className={`play-btn-spotify ${isPlaying ? 'playing' : ''}`}
//               onClick={handlePlayClick}
//               title={isPlaying ? "Pause audio" : "Listen to article"}
//             >
//               {isPlaying ? (
//                 <Pause size={16} />
//               ) : (
//                 <Play size={16} className="ml-0.5" />
//               )}
//             </button>
            
//             <button 
//               className="action-btn-spotify" 
//               onClick={handleSaveClick}
//               title="Save article"
//             >
//               <Bookmark size={14} />
//             </button>
            
//             <button 
//               className="action-btn-spotify" 
//               onClick={(e) => e.stopPropagation()}
//               title="Share article"
//             >
//               <Share2 size={14} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Click to listen prompt */}
//       <div className="click-to-listen">
//         <span className="text-gray-400 text-xs">Click to listen</span>
//       </div>
//     </div>
//   )
// }





// src/components/NewsCard.tsx
// FIXED: NewsCard component with working topbar color changes
// Simplified event dispatch and improved color mapping

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
  onReadStory, 
  onSaveStory, 
  onPlayAudio,
  isPlaying = false,
  variant = 'default'
}: NewsCardProps) {
  const navigate = useNavigate();
  
  /**
   * Get category-specific colors for news cards
   * Each category has its own distinct color scheme
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
   * Sends color change event to topbar
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
   * Tells topbar to return to default color
   */
  const handleMouseLeave = () => {
    console.log('🎨 NewsCard: Left card, resetting topbar color')
    
    // Create and dispatch leave event
    const leaveEvent = new CustomEvent('card-leave')
    window.dispatchEvent(leaveEvent)
  }

  /**
   * Handle click events for different card actions
   */
  const handleReadClick = () => {
  navigate(`/news/${article.id}`, { 
    state: { article } 
  })
}

  

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPlayAudio) {
      onPlayAudio(article.id)
    }
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

          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <Clock size={14} />
            <span>{article.timestamp}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
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
          🔴 BREAKING
        </div>
      )}

      {/* Main content */}
      <div className="p-4 flex-1">
        {/* Category tag */}
        <div className="mb-2">
          <span className={`category-tag ${colors.text}`}>
            {article.category}
          </span>
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
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Clock size={12} />
            <span>{article.timestamp}</span>
            <span className="text-gray-600">•</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      {/* Click to listen prompt */}
      <div className="click-to-listen">
        <span className="text-gray-400 text-xs">Click to listen</span>
      </div>
    </div>
  )
}