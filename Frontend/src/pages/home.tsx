// src/pages/home.tsx
// Home page component that displays the main news feed
// This is the main landing page users see when they visit the app

import React from 'react'
import MainBody from '../components/MainBody'

// Define the Story interface to match what App.tsx expects
interface Story {
  id: string
  title: string
  category: string
  thumbnail?: string
}

// Define the props that this page component receives from App.tsx
interface HomeProps {
  onPlayStory?: (story: Story) => void // Function to play audio and show bottom bar
}

export default function Home({ onPlayStory }: HomeProps) {
  // The Home component is simple - it just renders the MainBody component
  // and passes down the onPlayStory function so news cards can trigger audio playback
  
  return (
    <div className="home-page">
      {/* MainBody contains all the news sections */}
      <MainBody onPlayStory={onPlayStory} />
    </div>
  )
}