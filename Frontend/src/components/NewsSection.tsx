// src/components/NewsSection.tsx
// Enhanced news section with horizontal scrolling like Spotify

import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import NewsCard from './NewsCard'
import type { NewsArticle } from '../data/mockNews'

// Define the props this component expects
interface NewsSectionProps {
  title: string
  subtitle?: string
  articles: NewsArticle[]
  maxArticles?: number
  onReadStory?: (articleId: string) => void
  onSaveStory?: (articleId: string) => void
  onPlayAudio?: (articleId: string) => void
  currentlyPlaying?: string // ID of currently playing article
  layout?: 'spotify' | 'hero' | 'default' // Layout style
  showEmoji?: boolean // Whether to show emoji in title
}

export default function NewsSection({
  title,
  subtitle,
  articles,
  maxArticles,
  onReadStory,
  onSaveStory,
  onPlayAudio,
  currentlyPlaying,
  layout = 'spotify',
  showEmoji = true
}: NewsSectionProps) {
  
  // Reference to the scrollable container
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Limit the number of articles if maxArticles is specified
  const displayArticles = maxArticles 
    ? articles.slice(0, maxArticles) 
    : articles

  // Don't render anything if there are no articles
  if (displayArticles.length === 0) {
    return null
  }

  // Scroll left function
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of container width
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Scroll right function
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of container width
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Hero layout for featured stories
  if (layout === 'hero') {
    const featuredArticle = displayArticles[0]
    const remainingArticles = displayArticles.slice(1)

    return (
      <section className="hero-section">
        {/* Hero card */}
        <NewsCard
          article={featuredArticle}
          onReadStory={onReadStory}
          onSaveStory={onSaveStory}
          onPlayAudio={onPlayAudio}
          isPlaying={currentlyPlaying === featuredArticle.id}
          variant="hero"
        />

        {/* Remaining articles in horizontal scroll */}
        {remainingArticles.length > 0 && (
          <div className="news-scroll-container">
            {/* Scroll navigation buttons */}
            <button 
              className="scroll-nav scroll-nav-left"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              className="scroll-nav scroll-nav-right"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>

            {/* Horizontal scrolling grid */}
            <div className="news-grid-spotify" ref={scrollContainerRef}>
              {remainingArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onReadStory={onReadStory}
                  onSaveStory={onSaveStory}
                  onPlayAudio={onPlayAudio}
                  isPlaying={currentlyPlaying === article.id}
                  variant="default"
                />
              ))}
            </div>
          </div>
        )}
      </section>
    )
  }

  // Spotify layout with horizontal scrolling
  if (layout === 'spotify') {
    return (
      <section className="news-section-spotify">
        {/* Section header */}
        <div className="section-header-spotify">
          <h2 className="section-title-spotify">
            {showEmoji ? title : title.replace(/^[^\w\s]+\s*/, '')}
          </h2>
          {subtitle && (
            <p className="section-subtitle-spotify">{subtitle}</p>
          )}
        </div>

        {/* Horizontal scrolling container */}
        <div className="news-scroll-container">
          {/* Scroll navigation buttons */}
          <button 
            className="scroll-nav scroll-nav-left"
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            className="scroll-nav scroll-nav-right"
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>

          {/* Horizontal scrolling grid */}
          <div className="news-grid-spotify" ref={scrollContainerRef}>
            {displayArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onReadStory={onReadStory}
                onSaveStory={onSaveStory}
                onPlayAudio={onPlayAudio}
                isPlaying={currentlyPlaying === article.id}
                variant="default"
              />
            ))}
          </div>
        </div>

        {/* Show "View More" link if there are more articles than displayed */}
        {maxArticles && articles.length > maxArticles && (
          <div className="view-more">
            <button className="view-more-btn-spotify">
              Show all {articles.length} articles
            </button>
          </div>
        )}
      </section>
    )
  }

  // Default layout (legacy) - keep grid layout for backward compatibility
  return (
    <section className="news-section">
      {/* Section header */}
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {subtitle && (
          <p className="section-subtitle">{subtitle}</p>
        )}
      </div>

      {/* Grid of news cards */}
      <div className="news-grid">
        {displayArticles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onReadStory={onReadStory}
            onSaveStory={onSaveStory}
            onPlayAudio={onPlayAudio}
            isPlaying={currentlyPlaying === article.id}
            variant="default"
          />
        ))}
      </div>

      {/* Show "View More" link if there are more articles than displayed */}
      {maxArticles && articles.length > maxArticles && (
        <div className="view-more">
          <button className="view-more-btn">
            View All {title} ({articles.length})
          </button>
        </div>
      )}
    </section>
  )
}