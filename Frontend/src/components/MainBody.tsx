// src/components/MainBody.tsx
// Main content area with Spotify-inspired layout and Pan-African aesthetic

import React, { useState } from 'react'
import NewsSection from './NewsSection'
import { 
  politicalNews, 
  localTrends, 
  sportsNews, 
  healthNews,
  getBreakingNews 
} from '../data/mockNews'
import {
  businessNews,
  techNews,
  weatherNews,
  entertainmentNews,
  educationNews
} from '../data/additionalNews'
import { 
  // ... your existing icons
  Coffee,  // Add this to your existing import 
} from 'lucide-react'

// Define the Story interface to match what's expected by App.tsx
interface Story {
  id: string
  title: string
  category: string
  thumbnail?: string
}

// Define the props this component expects
interface MainBodyProps {
  onPlayStory?: (story: Story) => void
}

export default function MainBody({ onPlayStory }: MainBodyProps) {
  // Track which story is currently playing for visual feedback
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  
  // Handle when user wants to read a story
  const handleReadStory = (articleId: string) => {
    console.log('Reading story:', articleId)
    // TODO: Navigate to full story page or open story modal
    // For now, we'll just log it
  }

  // Handle when user wants to save a story
  const handleSaveStory = (articleId: string) => {
    console.log('Saving story:', articleId)
    // TODO: Add to saved stories list
    // For now, we'll just log it
  }

  // Handle when user wants to play audio for a story
  const handlePlayAudio = (articleId: string) => {
    // Find the article in all our news arrays
    const allNews = [
      ...getBreakingNews(),
      ...politicalNews,
      ...localTrends,
      ...weatherNews,
      ...businessNews,
      ...sportsNews,
      ...techNews,
      ...healthNews,
      ...educationNews,
      ...entertainmentNews
    ]
    
    const article = allNews.find(item => item.id === articleId)
    
    if (article && onPlayStory) {
      // Set currently playing state
      setCurrentlyPlaying(articleId)
      
      // Convert our NewsArticle to the Story format expected by BottomBar
      const story = {
        id: article.id,
        title: article.title,
        category: article.category,
        thumbnail: article.imageUrl
      }
      
      // Call the function passed down from App.tsx to show the bottom bar
      onPlayStory(story)
    }
  }

  // Get breaking news to show at the top
  const breakingNews = getBreakingNews()

  return (
    <div className="main-body-container">
      <section className="breaking-news-header">
        <h1 className="breaking-news-title">
          <Coffee size={32} className="breaking-news-icon" />
          Hot Spills
        </h1>
        <p className="breaking-news-subtitle">Stay updated with the latest developments</p>
      </section>
      {/* Hero section with breaking news */}
      {breakingNews.length > 0 && (
        <NewsSection
          title=" Breaking News"
          subtitle="Latest urgent updates and developing stories"
          articles={breakingNews}
          maxArticles={10}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="hero"
          showEmoji={true}
        />
      )}

      {/* Politics Section */}
      <NewsSection
        title=" Politics"
        subtitle="Government updates, policy changes, and political developments"
        articles={politicalNews}
        maxArticles={6}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Weather Section */}
      <NewsSection
        title=" Weather"
        subtitle="Weather updates, forecasts, and climate information"
        articles={weatherNews}
        maxArticles={4}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Local Trends Section */}
      <NewsSection
        title=" Local Trends"
        subtitle="Community stories and local developments"
        articles={localTrends}
        maxArticles={4}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Business Section */}
      <NewsSection
        title=" Business & Economy"
        subtitle="Economic news, business developments, and market updates"
        articles={businessNews}
        maxArticles={4}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Sports Section */}
      <NewsSection
        title=" Sports"
        subtitle="Latest scores, matches, and sports news"
        articles={sportsNews}
        maxArticles={4}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Technology Section */}
      <NewsSection
        title=" Technology"
        subtitle="Tech updates, digital innovations, and IT developments"
        articles={techNews}
        maxArticles={3}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Health Section */}
      <NewsSection
        title="Health"
        subtitle="Health updates, medical news, and wellness information"
        articles={healthNews}
        maxArticles={4}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Education Section */}
      <NewsSection
        title="Education"
        subtitle="Educational developments, school news, and academic updates"
        articles={educationNews}
        maxArticles={3}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Entertainment Section */}
      <NewsSection
        title=" Entertainment"
        subtitle="Arts, culture, music, and entertainment news"
        articles={entertainmentNews}
        maxArticles={3}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />
    </div>
  )
}