// // src/App.tsx
// // Main application component that handles routing and global state

// import { useState } from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import Sidebar from './layout/Sidebar'
// import Topbar from './layout/Topbar'
// import BottomBar from './layout/BottomBar'
// import Home from './pages/home'
// import ViewProfile from './pages/ViewProfile'
// import Account from './pages/Account'
// import Settings from './pages/Settings'

// // Import global styles and layout styles
// import './index.css'

// // Define story interface for bottom bar
// interface Story {
//   id: string
//   title: string
//   category: string
//   thumbnail?: string
// }

// function App() {
//   // State for the currently playing story in bottom bar
//   const [currentStory, setCurrentStory] = useState<Story | null>(null)
//   const [isBottomBarVisible, setIsBottomBarVisible] = useState(false)

//   // Function to play a story (called when story card play button is clicked)
//   const playStory = (story: Story) => {
//     console.log('Playing story:', story) // Debug log
//     setCurrentStory(story)
//     setIsBottomBarVisible(true)
//   }

//   // Function to close the bottom bar
//   const closeBottomBar = () => {
//     setIsBottomBarVisible(false)
//     // Delay clearing the story to allow animation to complete
//     setTimeout(() => setCurrentStory(null), 300)
//   }

//   return (
//     <Router>
//       {/* Main application container with flex layout */}
//       <div className="app-container">
//         {/* Left sidebar navigation */}
//         <Sidebar />
        
//         {/* Main content area */}
//         <div className="main-content">
//           {/* Top header with search and profile */}
//           <Topbar />
          
//           {/* Main page content where all pages are displayed */}
//           <main className={`body-content ${isBottomBarVisible ? 'with-bottom-bar' : ''}`}>
//             <Routes>
//               {/* Home page route - passes playStory function to handle story clicks */}
//               <Route 
//                 path="/" 
//                 element={<Home onPlayStory={playStory} />} 
//               />
              
//               {/* Profile-related routes */}
//               <Route path="/profile" element={<ViewProfile />} />
//               <Route path="/account" element={<Account />} />
//               <Route path="/settings" element={<Settings />} />

//               {/* Search and Saved pages (you can add these later) */}
//               <Route path="/search" element={
//                 <div className="page-container">
//                   <h1 className="page-title">🔍 Search</h1>
//                   <p className="page-subtitle">Search functionality coming soon...</p>
//                 </div>
//               } />
              
//               <Route path="/saved" element={
//                 <div className="page-container">
//                   <h1 className="page-title"> Saved Articles</h1>
//                   <p className="page-subtitle">Your saved articles will appear here...</p>
//                 </div>
//               } />

//               {/* 404 Not Found page */}
//               <Route path="*" element={
//                 <div className="page-container">
//                   <div className="error-container">
//                     <div className="error-icon"></div>
//                     <h1 className="error-title">Page Not Found</h1>
//                     <p className="error-message">
//                       The page you're looking for doesn't exist. 
//                       Head back to the homepage to continue reading the news.
//                     </p>
//                     <button 
//                       className="error-button"
//                       onClick={() => window.location.href = '/'}
//                     >
//                       Go to Homepage
//                     </button>
//                   </div>
//                 </div>
//               } />
//             </Routes>
//           </main>
//         </div>

//         {/* Bottom media player bar - only shows when a story is playing */}
//         <BottomBar 
//           story={currentStory}
//           isVisible={isBottomBarVisible}
//           onClose={closeBottomBar}
//         />
//       </div>
//     </Router>
//   )
// }

// export default App

// Frontend/src/App.tsx
// Main application component with proper routing - WELCOME PAGE FIRST
// FIXED: Welcome page is now the default, user data comes from database not hardcoded

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './layout/Sidebar'
import Topbar from './layout/Topbar'
import BottomBar from './layout/BottomBar'
import Home from './pages/home'
import ViewProfile from './pages/ViewProfile'
import Account from './pages/Account'
import Settings from './pages/Settings'
import Welcome from './pages/Welcome'
import { authService, type User } from './services/authService'

// Import global styles
import './index.css'

// Define story interface for bottom bar functionality
interface Story {
  id: string
  title: string
  category: string
  thumbnail?: string
}

/**
 * Protected Route Component
 * Only allows access to main app if user is authenticated
 * Otherwise redirects to welcome page
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔒 ProtectedRoute: Checking authentication...')
        
        // Check if user has a stored authentication token
        if (authService.isLoggedIn()) {
          console.log('🔑 ProtectedRoute: Token found, verifying with backend...')
          
          // Verify the token is still valid with the backend
          const authResult = await authService.verifyAuth()
          setIsAuthenticated(authResult.valid)
          
          if (authResult.valid) {
            console.log('✅ ProtectedRoute: Authentication valid, allowing access')
          } else {
            console.log('❌ ProtectedRoute: Token invalid, redirecting to welcome')
          }
        } else {
          console.log('🚫 ProtectedRoute: No token found, redirecting to welcome')
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('💥 ProtectedRoute: Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [])

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#1a1a1a',
        color: 'white',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px', animation: 'bounce 1s infinite' }}>🫖</div>
        <div style={{ fontSize: '18px' }}>Checking authentication...</div>
      </div>
    )
  }

  // If authenticated, show protected content; otherwise redirect to welcome
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

function App() {
  // State for bottom bar media player functionality
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false)
  
  // State for user authentication - gets REAL user data from database
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  /**
   * Initialize authentication and get current user data from database
   * This runs when the app starts and fetches REAL user info (not hardcoded)
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 App: Initializing authentication...')
        
        if (authService.isLoggedIn()) {
          console.log('🔍 App: Token found, fetching user data from database...')
          
          // Get current user data from database via API call
          const authResult = await authService.verifyAuth()
          
          if (authResult.valid && authResult.user) {
            // Set REAL user data from database (not hardcoded!)
            setCurrentUser(authResult.user)
            console.log('✅ App: User data loaded from database:', {
              id: authResult.user.id,
              username: authResult.user.username,
              email: authResult.user.email,
              fullName: `${authResult.user.first_name} ${authResult.user.last_name}`,
              country: authResult.user.country_of_interest,
              lastLogin: authResult.user.last_login
            })
          } else {
            console.log('❌ App: Authentication failed, clearing user data')
            setCurrentUser(null)
            // Clear invalid authentication data
            await authService.logout()
          }
        } else {
          console.log('🔓 App: No authentication token found')
          setCurrentUser(null)
        }
      } catch (error) {
        console.error('💥 App: Error during authentication initialization:', error)
        setCurrentUser(null)
        // Clear any corrupted authentication data
        try {
          await authService.logout()
        } catch (logoutError) {
          console.error('💥 App: Error during cleanup logout:', logoutError)
        }
      } finally {
        setIsLoadingUser(false)
        console.log('🏁 App: Authentication initialization complete')
      }
    }

    initializeAuth()
  }, [])

  /**
   * Function to play a story (called when story card play button is clicked)
   * This handles the bottom bar media player functionality
   */
  const playStory = (story: Story) => {
    console.log('🎵 App: Playing story:', story.title)
    setCurrentStory(story)
    setIsBottomBarVisible(true)
  }

  /**
   * Function to close the bottom bar media player
   */
  const closeBottomBar = () => {
    console.log('❌ App: Closing bottom bar media player')
    setIsBottomBarVisible(false)
    // Delay clearing the story to allow close animation to complete
    setTimeout(() => setCurrentStory(null), 300)
  }

  /**
   * Handle user logout
   * This clears user data and redirects to welcome page
   */
  const handleLogout = async () => {
    try {
      console.log('🚪 App: User logging out...')
      
      // Call backend logout and clear local storage
      await authService.logout()
      
      // Clear user state
      setCurrentUser(null)
      
      console.log('✅ App: Logout completed successfully')
    } catch (error) {
      console.error('💥 App: Error during logout:', error)
      // Still clear user state even if logout API call fails
      setCurrentUser(null)
    }
  }

  return (
    <Router>
      <Routes>
        {/* FIXED: Welcome page is now the DEFAULT route that users see first */}
        <Route path="/" element={<Welcome />} />
        
        {/* Login page alias - redirects to welcome */}
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        {/* Protected routes - require authentication to access */}
        <Route path="/home" element={
          <ProtectedRoute>
            {/* Main application layout - only renders when authenticated */}
            <div className="app-container">
              {/* Left sidebar navigation */}
              <Sidebar />
              
              {/* Main content area */}
              <div className="main-content">
                {/* Top header with search and profile - passes REAL user data */}
                <Topbar 
                  currentUser={currentUser} 
                  onLogout={handleLogout}
                />
                
                {/* Main page content area */}
                <main className={`body-content ${isBottomBarVisible ? 'with-bottom-bar' : ''}`}>
                  <Routes>
                    {/* Home/Dashboard - default protected route */}
                    <Route 
                      path="/home" 
                      element={<Home onPlayStory={playStory} />} 
                    />
                    
                    {/* Profile-related routes - pass REAL current user data from database */}
                    <Route 
                      path="/profile" 
                      element={<ViewProfile currentUser={currentUser} />} 
                    />
                    <Route 
                      path="/account" 
                      element={<Account currentUser={currentUser} />} 
                    />
                    <Route 
                      path="/settings" 
                      element={<Settings currentUser={currentUser} />} 
                    />

                    {/* News category routes */}
                    <Route path="/sip" element={
                      <div className="page-container">
                        <h1 className="page-title">🫖 General Sip</h1>
                        <p className="page-subtitle">General news coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/hot-takes" element={
                      <div className="page-container">
                        <h1 className="page-title">🔥 Hot Takes</h1>
                        <p className="page-subtitle">Trending news coming soon...</p>
                      </div>
                    } />

                    {/* Utility routes */}
                    <Route path="/search" element={
                      <div className="page-container">
                        <h1 className="page-title">🔍 Search</h1>
                        <p className="page-subtitle">Search functionality coming soon...</p>
                      </div>
                    } />
                    
                    <Route path="/saved" element={
                      <div className="page-container">
                        <h1 className="page-title">📖 Saved Articles</h1>
                        <p className="page-subtitle">Your saved articles will appear here...</p>
                      </div>
                    } />

                    {/* 404 Not Found page */}
                    <Route path="*" element={
                      <div className="page-container">
                        <div className="error-container">
                          <div className="error-icon">🫖</div>
                          <h1 className="error-title">Page Not Found</h1>
                          <p className="error-message">
                            The page you're looking for doesn't exist. 
                            Head back to the home page to continue reading news.
                          </p>
                          <button 
                            className="error-button"
                            onClick={() => window.location.href = '/home'}
                          >
                            Go to Home
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
          </ProtectedRoute>
        } />

        {/* All other protected routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="app-container">
              <Sidebar />
              <div className="main-content">
                <Topbar currentUser={currentUser} onLogout={handleLogout} />
                <main className="body-content">
                  <ViewProfile currentUser={currentUser} />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/account" element={
          <ProtectedRoute>
            <div className="app-container">
              <Sidebar />
              <div className="main-content">
                <Topbar currentUser={currentUser} onLogout={handleLogout} />
                <main className="body-content">
                  <Account currentUser={currentUser} />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <div className="app-container">
              <Sidebar />
              <div className="main-content">
                <Topbar currentUser={currentUser} onLogout={handleLogout} />
                <main className="body-content">
                  <Settings currentUser={currentUser} />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Catch-all redirect to welcome for any unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App