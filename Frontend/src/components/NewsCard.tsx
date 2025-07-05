// // // src/components/NewsCard.tsx
// // // Enhanced news card with Spotify-style visual design and Pan-African aesthetic

// // import React from 'react'
// // import { Clock, Bookmark, Share2, Play, Pause } from 'lucide-react'
// // import type { NewsArticle } from '../data/mockNews'

// // // Define the props that this component expects
// // interface NewsCardProps {
// //   article: NewsArticle
// //   onReadStory?: (articleId: string) => void
// //   onSaveStory?: (articleId: string) => void
// //   onPlayAudio?: (articleId: string) => void
// //   isPlaying?: boolean // Track if this story is currently playing
// //   variant?: 'default' | 'hero' | 'compact' // Different card styles
// // }

// // export default function NewsCard({ 
// //   article, 
// //   onReadStory, 
// //   onSaveStory, 
// //   onPlayAudio,
// //   isPlaying = false,
// //   variant = 'default'
// // }: NewsCardProps) {
  
// //   // Handle when user clicks to read the story
// //   const handleReadClick = () => {
// //     if (onReadStory) {
// //       onReadStory(article.id)
// //     }
// //   }

// //   // Handle when user clicks to save the story
// //   const handleSaveClick = (e: React.MouseEvent) => {
// //     e.stopPropagation()
// //     if (onSaveStory) {
// //       onSaveStory(article.id)
// //     }
// //   }

// //   // Handle when user clicks to play audio
// //   const handlePlayClick = (e: React.MouseEvent) => {
// //     e.stopPropagation()
// //     if (onPlayAudio) {
// //       onPlayAudio(article.id)
// //     }
// //   }

// //   // Get category color scheme (Pan-African inspired)
// //   const getCategoryColors = (category: string) => {
// //     const colorMap: { [key: string]: { bg: string; accent: string; text: string } } = {
// //       'Politics': { bg: 'bg-emerald-900', accent: 'border-emerald-500', text: 'text-emerald-300' },
// //       'Local Trends': { bg: 'bg-slate-700', accent: 'border-slate-400', text: 'text-slate-200' },
// //       'Health': { bg: 'bg-amber-900', accent: 'border-amber-500', text: 'text-amber-300' },
// //       'Sports': { bg: 'bg-red-900', accent: 'border-red-500', text: 'text-red-300' },
// //       'Business': { bg: 'bg-blue-900', accent: 'border-blue-500', text: 'text-blue-300' },
// //       'Technology': { bg: 'bg-purple-900', accent: 'border-purple-500', text: 'text-purple-300' },
// //       'Entertainment': { bg: 'bg-pink-900', accent: 'border-pink-500', text: 'text-pink-300' },
// //       'Weather': { bg: 'bg-cyan-900', accent: 'border-cyan-500', text: 'text-cyan-300' },
// //       'Education': { bg: 'bg-indigo-900', accent: 'border-indigo-500', text: 'text-indigo-300' }
// //     }
// //     return colorMap[category] || { bg: 'bg-gray-800', accent: 'border-gray-500', text: 'text-gray-300' }
// //   }

// //   const colors = getCategoryColors(article.category)

// //   // Hero variant for featured stories
// //   if (variant === 'hero') {
// //     return (
// //       <div 
// //         className={`news-card-hero ${colors.bg} ${colors.accent} relative overflow-hidden group cursor-pointer`}
// //         onClick={handleReadClick}
// //       >
// //         {/* Background pattern overlay */}
// //         <div className="absolute inset-0 opacity-10">
// //           <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-red-500 to-green-600"></div>
// //         </div>
        
// //         {/* Breaking news badge */}
// //         {article.isBreaking && (
// //           <div className="absolute top-4 left-4 z-10">
// //             <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold pulse">
// //               🔴 LIVE
// //             </span>
// //           </div>
// //         )}

// //         {/* Action buttons - moved to top right */}
// //         <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
// //           <button 
// //             className="action-btn-hero" 
// //             onClick={handleSaveClick}
// //             title="Save article"
// //           >
// //             <Bookmark size={18} />
// //           </button>
          
// //           <button 
// //             className="action-btn-hero" 
// //             onClick={(e) => e.stopPropagation()}
// //             title="Share article"
// //           >
// //             <Share2 size={18} />
// //           </button>
// //         </div>

// //         {/* Large play button overlay */}
// //         <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
// //           <button 
// //             className="play-button-large"
// //             onClick={handlePlayClick}
// //           >
// //             {isPlaying ? (
// //               <Pause size={32} className="text-white" />
// //             ) : (
// //               <Play size={32} className="text-white ml-1" />
// //             )}
// //           </button>
// //         </div>

// //         {/* Content */}
// //         <div className="relative z-10 p-6 h-full flex flex-col justify-end">
// //           <div className="mb-4">
// //             <span className={`${colors.text} text-sm font-medium uppercase tracking-wide`}>
// //               {article.category}
// //             </span>
// //           </div>
          
// //           <h2 className="text-white text-2xl font-bold mb-3 line-clamp-2">
// //             {article.title}
// //           </h2>
          
// //           <p className="text-gray-300 text-base mb-4 line-clamp-2">
// //             {article.summary}
// //           </p>

// //           <div className="flex items-center gap-3 text-gray-400 text-sm">
// //             <Clock size={14} />
// //             <span>{article.timestamp}</span>
// //             <span>•</span>
// //             <span>{article.readTime}</span>
// //           </div>
// //         </div>
// //       </div>
// //     )
// //   }

// //   // Default card variant
// //   return (
// //     <div 
// //       className={`news-card-spotify ${colors.bg} border-l-4 ${colors.accent} group`}
// //       onClick={handleReadClick}
// //       role="button"
// //       tabIndex={0}
// //     >
// //       {/* Breaking news badge */}
// //       {article.isBreaking && (
// //         <div className="breaking-badge-spotify">
// //            BREAKING
// //         </div>
// //       )}

// //       {/* Main content area */}
// //       <div className="p-4 flex-1">
// //         {/* Category tag */}
// //         <div className="mb-2">
// //           <span className={`category-tag ${colors.text}`}>
// //             {article.category}
// //           </span>
// //         </div>

// //         {/* Title */}
// //         <h3 className="news-title-spotify text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:text-gray-100">
// //           {article.title}
// //         </h3>
        
// //         {/* Summary */}
// //         <p className="news-summary-spotify text-gray-300 text-sm mb-4 line-clamp-3">
// //           {article.summary}
// //         </p>
        
// //         {/* Footer with metadata and actions */}
// //         <div className="flex items-center justify-between">
// //           <div className="flex items-center gap-2 text-gray-400 text-xs">
// //             <Clock size={12} />
// //             <span>{article.timestamp}</span>
// //             <span className="text-gray-600">•</span>
// //             <span>{article.readTime}</span>
// //           </div>
          
// //           {/* Action buttons */}
// //           <div className="flex items-center gap-1">
// //             {/* Play/Pause button with Spotify-style design */}
// //             <button 
// //               className={`play-btn-spotify ${isPlaying ? 'playing' : ''}`}
// //               onClick={handlePlayClick}
// //               title={isPlaying ? "Pause audio" : "Listen to article"}
// //             >
// //               {isPlaying ? (
// //                 <Pause size={16} />
// //               ) : (
// //                 <Play size={16} className="ml-0.5" />
// //               )}
// //             </button>
            
// //             <button 
// //               className="action-btn-spotify" 
// //               onClick={handleSaveClick}
// //               title="Save article"
// //             >
// //               <Bookmark size={14} />
// //             </button>
            
// //             <button 
// //               className="action-btn-spotify" 
// //               onClick={(e) => e.stopPropagation()}
// //               title="Share article"
// //             >
// //               <Share2 size={14} />
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Click to listen prompt */}
// //       <div className="click-to-listen">
// //         <span className="text-gray-400 text-xs">Click to listen</span>
// //       </div>
// //     </div>
// //   )
// // }






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

//   // Function to handle mouse entering the card
//   const handleMouseEnter = () => {
//     // Get the background color for this card's category
//     const colors = getCategoryColors(article.category)
    
//     // Convert Tailwind CSS classes to actual hex color values
//     const colorMap: { [key: string]: string } = {
//       'bg-emerald-900': '#064e3b',   // Dark green for Politics
//       'bg-slate-700': '#334155',     // Dark gray for Local Trends
//       'bg-amber-900': '#78350f',     // Dark orange for Health
//       'bg-red-900': '#7f1d1d',       // Dark red for Sports
//       'bg-blue-900': '#1e3a8a',      // Dark blue for Business
//       'bg-purple-900': '#581c87',    // Dark purple for Technology
//       'bg-pink-900': '#831843',      // Dark pink for Entertainment
//       'bg-cyan-900': '#164e63',      // Dark cyan for Weather
//       'bg-indigo-900': '#312e81',    // Dark indigo for Education
//       'bg-gray-800': '#1f2937'       // Default dark gray
//     }
    
//     // Get the actual color value for this card's background
//     const actualColor = colorMap[colors.bg] || '#1f2937'
    
//     // Send custom event to topbar with the card's color
//     const event = new CustomEvent('card-hover', {
//       detail: { color: actualColor }
//     })
//     window.dispatchEvent(event)
//   }

//   // Function to handle mouse leaving the card
//   const handleMouseLeave = () => {
//     // Send event to tell topbar to return to original orange color
//     const event = new CustomEvent('card-leave')
//     window.dispatchEvent(event)
//   }

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

//   const colors = getCategoryColors(article.category)

//   // Hero variant for featured stories
//   if (variant === 'hero') {
//     return (
//       <div 
//         className={`news-card-hero ${colors.bg} ${colors.accent} relative overflow-hidden group cursor-pointer`}
//         onClick={handleReadClick}
//         onMouseEnter={handleMouseEnter}  // Send color to topbar when hovering
//         onMouseLeave={handleMouseLeave}  // Reset topbar color when leaving
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
//       onMouseEnter={handleMouseEnter}  // Send color to topbar when hovering
//       onMouseLeave={handleMouseLeave}  // Reset topbar color when leaving
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
// Updated to use real background images from news articles

import React from 'react'
import { Clock, Bookmark, Share2, Play, Pause } from 'lucide-react'
import type { NewsArticle } from '../data/mockNews'

// Define the props that this component expects
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
  
  // Get category color scheme (Pan-African inspired)
  const getCategoryColors = (category: string) => {
    const colorMap: { [key: string]: { bg: string; accent: string; text: string } } = {
      'Politics': { bg: 'bg-emerald-900', accent: 'border-emerald-500', text: 'text-emerald-300' },
      'Local Trends': { bg: 'bg-slate-700', accent: 'border-slate-400', text: 'text-slate-200' },
      'Health': { bg: 'bg-amber-900', accent: 'border-amber-500', text: 'text-amber-300' },
      'Sports': { bg: 'bg-red-900', accent: 'border-red-500', text: 'text-red-300' },
      'Business': { bg: 'bg-blue-900', accent: 'border-blue-500', text: 'text-blue-300' },
      'Technology': { bg: 'bg-purple-900', accent: 'border-purple-500', text: 'text-purple-300' },
      'Entertainment': { bg: 'bg-pink-900', accent: 'border-pink-500', text: 'text-pink-300' },
      'Weather': { bg: 'bg-cyan-900', accent: 'border-cyan-500', text: 'text-cyan-300' },
      'Education': { bg: 'bg-indigo-900', accent: 'border-indigo-500', text: 'text-indigo-300' },
      'Breaking': { bg: 'bg-red-800', accent: 'border-red-400', text: 'text-red-200' }
    }
    return colorMap[category] || { bg: 'bg-gray-800', accent: 'border-gray-500', text: 'text-gray-300' }
  }

  // Function to handle mouse entering the card
  const handleMouseEnter = () => {
    const colors = getCategoryColors(article.category)
    
    const colorMap: { [key: string]: string } = {
      'bg-emerald-900': '#064e3b',
      'bg-slate-700': '#334155',
      'bg-amber-900': '#78350f',
      'bg-red-900': '#7f1d1d',
      'bg-red-800': '#991b1b',
      'bg-blue-900': '#1e3a8a',
      'bg-purple-900': '#581c87',
      'bg-pink-900': '#831843',
      'bg-cyan-900': '#164e63',
      'bg-indigo-900': '#312e81',
      'bg-gray-800': '#1f2937'
    }
    
    const actualColor = colorMap[colors.bg] || '#1f2937'
    
    const event = new CustomEvent('card-hover', {
      detail: { color: actualColor }
    })
    window.dispatchEvent(event)
  }

  // Function to handle mouse leaving the card
  const handleMouseLeave = () => {
    const event = new CustomEvent('card-leave')
    window.dispatchEvent(event)
  }

  // Handle when user clicks to read the story
  const handleReadClick = () => {
    if (onReadStory) {
      onReadStory(article.id)
    }
  }

  // Handle when user clicks to save the story
  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSaveStory) {
      onSaveStory(article.id)
    }
  }

  // Handle when user clicks to play audio
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPlayAudio) {
      onPlayAudio(article.id)
    }
  }

  const colors = getCategoryColors(article.category)

  // Hero variant for featured stories
  if (variant === 'hero') {
    return (
      <div 
        className={`news-card-hero ${colors.bg} ${colors.accent} relative overflow-hidden group cursor-pointer`}
        onClick={handleReadClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          // Use the actual news image as background if available
          backgroundImage: article.imageUrl ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${article.imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Fallback background pattern if no image */}
        {!article.imageUrl && (
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-yellow-400 via-red-500 to-green-600"></div>
          </div>
        )}
        
        {/* Breaking news badge */}
        {article.isBreaking && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold pulse">
              🔴 LIVE
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button 
            className="action-btn-hero" 
            onClick={handleSaveClick}
            title="Save article"
          >
            <Bookmark size={18} />
          </button>
          
          <button 
            className="action-btn-hero" 
            onClick={(e) => e.stopPropagation()}
            title="Share article"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Content */}
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

  // Default card variant with background image support
  return (
    <div 
      className={`news-card-spotify ${colors.bg} border-l-4 ${colors.accent} group relative overflow-hidden`}
      onClick={handleReadClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      style={{
        // Apply background image if available, with overlay for readability
        backgroundImage: article.imageUrl ? `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(${article.imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Breaking news badge */}
      {article.isBreaking && (
        <div className="breaking-badge-spotify">
           BREAKING
        </div>
      )}

      {/* Main content area */}
      <div className="p-4 flex-1 relative z-10">
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
          
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Play/Pause button with Spotify-style design */}
            <button 
              className={`play-btn-spotify ${isPlaying ? 'playing' : ''}`}
              onClick={handlePlayClick}
              title={isPlaying ? "Pause audio" : "Listen to article"}
            >
              {isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} className="ml-0.5" />
              )}
            </button>
            
            <button 
              className="action-btn-spotify" 
              onClick={handleSaveClick}
              title="Save article"
            >
              <Bookmark size={14} />
            </button>
            
            <button 
              className="action-btn-spotify" 
              onClick={(e) => e.stopPropagation()}
              title="Share article"
            >
              <Share2 size={14} />
            </button>
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