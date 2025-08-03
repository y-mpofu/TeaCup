// src/App.tsx
// Main application component that handles routing and global state

import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './layout/Sidebar'
import Topbar from './layout/Topbar'
import BottomBar from './layout/BottomBar'
import Home from './pages/home'
import ViewProfile from './pages/ViewProfile'
import Account from './pages/Account'
import Settings from './pages/Settings'

// Import global styles and layout styles
import './index.css'

// Define story interface for bottom bar
interface Story {
  id: string
  title: string
  category: string
  thumbnail?: string
}

function App() {
  // State for the currently playing story in bottom bar
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false)

  // Function to play a story (called when story card play button is clicked)
  const playStory = (story: Story) => {
    console.log('Playing story:', story) // Debug log
    setCurrentStory(story)
    setIsBottomBarVisible(true)
  }

  // Function to close the bottom bar
  const closeBottomBar = () => {
    setIsBottomBarVisible(false)
    // Delay clearing the story to allow animation to complete
    setTimeout(() => setCurrentStory(null), 300)
  }

  return (
    <Router>
      {/* Main application container with flex layout */}
      <div className="app-container">
        {/* Left sidebar navigation */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="main-content">
          {/* Top header with search and profile */}
          <Topbar 
            currentUser={null} // TODO: Replace with actual user object
            onLogout={async () => { /* TODO: Implement logout logic */ }}
          />
          
          {/* Main page content where all pages are displayed */}
          <main className={`body-content ${isBottomBarVisible ? 'with-bottom-bar' : ''}`}>
            <Routes>
              {/* Home page route - passes playStory function to handle story clicks */}
              <Route 
                path="/" 
                element={<Home onPlayStory={playStory} />} 
              />
              
              {/* Profile-related routes */}
              <Route path="/profile" element={<ViewProfile />} />
              <Route path="/account" element={<Account />} />
              <Route path="/settings" element={<Settings />} />

              {/* Search and Saved pages (you can add these later) */}
              <Route path="/search" element={
                <div className="page-container">
                  <h1 className="page-title">🔍 Search</h1>
                  <p className="page-subtitle">Search functionality coming soon...</p>
                </div>
              } />
              
              <Route path="/saved" element={
                <div className="page-container">
                  <h1 className="page-title"> Saved Articles</h1>
                  <p className="page-subtitle">Your saved articles will appear here...</p>
                </div>
              } />

              {/* 404 Not Found page */}
              <Route path="*" element={
                <div className="page-container">
                  <div className="error-container">
                    <div className="error-icon"></div>
                    <h1 className="error-title">Page Not Found</h1>
                    <p className="error-message">
                      The page you're looking for doesn't exist. 
                      Head back to the homepage to continue reading the news.
                    </p>
                    <button 
                      className="error-button"
                      onClick={() => window.location.href = '/'}
                    >
                      Go to Homepage
                    </button>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>

        {/* Bottom media player bar - only shows when a story is playing */}
        <BottomBar 
          story={currentStory}
          isVisible={isBottomBarVisible}
          onClose={closeBottomBar}
        />
      </div>
    </Router>
  )
}

export default App

