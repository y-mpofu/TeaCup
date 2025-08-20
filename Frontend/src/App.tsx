// // src/App.tsx
// // DEBUGGING VERSION - This will help us see exactly what's happening
// // Replace your current App.tsx with this temporarily to diagnose the issue

// import { useState, useEffect } from 'react'
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// // Import styles - making sure they load
// import './index.css'

// // Define the different app states for better UX
// type AppState = 'checking' | 'unauthenticated' | 'authenticated' | 'server_down' | 'debug'

// function App() {
//   // === DEBUGGING STATE ===
//   const [appState, setAppState] = useState<AppState>('debug') // Start in debug mode
//   const [debugInfo, setDebugInfo] = useState<string[]>([])
//   const [currentUser, setCurrentUser] = useState<any>(null)
//   const [authError, setAuthError] = useState<string | null>(null)

//   // Helper function to add debug messages
//   const addDebugMessage = (message: string) => {
//     console.log(message) // Also log to console
//     setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
//   }

//   // === INITIAL DEBUGGING CHECK ===
//   useEffect(() => {
//     const debugInitialization = async () => {
//       addDebugMessage('🔍 Starting app initialization...')
      
//       try {
//         // Test 1: Check if basic imports work
//         addDebugMessage('✅ React and useState working')
        
//         // Test 2: Check if we can import services
//         addDebugMessage('🔄 Attempting to import authService...')
        
//         try {
//           const { authService } = await import('./services/authService')
//           addDebugMessage('✅ authService imported successfully')
//         } catch (error) {
//           addDebugMessage(`❌ authService import failed: ${error}`)
//         }

//         // Test 3: Check if we can import newsApiService
//         addDebugMessage('🔄 Attempting to import newsApiService...')
        
//         try {
//           const { newsApiService } = await import('./services/newsApiService')
//           addDebugMessage('✅ newsApiService imported successfully')
          
//           // Test 4: Check backend connection
//           addDebugMessage('🔄 Testing backend connection...')
//           const isHealthy = await newsApiService.checkBackendHealth()
//           addDebugMessage(`🏥 Backend health check: ${isHealthy ? '✅ Healthy' : '❌ Failed'}`)
          
//         } catch (error) {
//           addDebugMessage(`❌ newsApiService import failed: ${error}`)
//         }

//         // Test 5: Check if we can import page components
//         addDebugMessage('🔄 Attempting to import Welcome component...')
        
//         try {
//           const Welcome = await import('./pages/Welcome')
//           addDebugMessage('✅ Welcome component imported successfully')
//         } catch (error) {
//           addDebugMessage(`❌ Welcome component import failed: ${error}`)
//         }

//         addDebugMessage('🎯 All tests completed - check results above')
        
//       } catch (error) {
//         addDebugMessage(`💥 Critical error: ${error}`)
//       }
//     }

//     debugInitialization()
//   }, [])

//   // === RENDER DEBUG INTERFACE ===
//   return (
//     <div style={{
//       backgroundColor: '#000000',
//       color: '#ffffff',
//       minHeight: '100vh',
//       padding: '2rem',
//       fontFamily: 'monospace'
//     }}>
//       <div style={{
//         maxWidth: '800px',
//         margin: '0 auto'
//       }}>
//         <h1 style={{ color: '#00ff00' }}>🔧 TeaCup Debug Mode</h1>
        
//         <div style={{
//           backgroundColor: '#1a1a1a',
//           padding: '1rem',
//           borderRadius: '8px',
//           marginBottom: '2rem'
//         }}>
//           <h2 style={{ color: '#ffff00' }}>Current Status:</h2>
//           <p>App State: <strong style={{ color: '#00ffff' }}>{appState}</strong></p>
//           <p>Current User: <strong style={{ color: '#00ffff' }}>{currentUser ? 'Loaded' : 'None'}</strong></p>
//           <p>Auth Error: <strong style={{ color: '#ff6666' }}>{authError || 'None'}</strong></p>
//         </div>

//         <div style={{
//           backgroundColor: '#1a1a1a',
//           padding: '1rem',
//           borderRadius: '8px',
//           marginBottom: '2rem'
//         }}>
//           <h2 style={{ color: '#ffff00' }}>Debug Messages:</h2>
//           <div style={{
//             backgroundColor: '#000000',
//             padding: '1rem',
//             borderRadius: '4px',
//             maxHeight: '400px',
//             overflowY: 'auto',
//             fontSize: '0.9rem'
//           }}>
//             {debugInfo.length === 0 ? (
//               <p style={{ color: '#888888' }}>No debug messages yet...</p>
//             ) : (
//               debugInfo.map((message, index) => (
//                 <div key={index} style={{ 
//                   marginBottom: '0.5rem',
//                   color: message.includes('❌') ? '#ff6666' : 
//                          message.includes('✅') ? '#66ff66' : 
//                          message.includes('🔄') ? '#ffaa00' : '#ffffff'
//                 }}>
//                   {message}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         <div style={{
//           backgroundColor: '#1a1a1a',
//           padding: '1rem',
//           borderRadius: '8px'
//         }}>
//           <h2 style={{ color: '#ffff00' }}>Next Steps:</h2>
//           <ol style={{ lineHeight: '1.6' }}>
//             <li>Check the debug messages above for any ❌ errors</li>
//             <li>Open browser Developer Tools (F12) and check Console tab</li>
//             <li>Look for any red error messages in the console</li>
//             <li>Once you identify the issue, replace this debug version with your original App.tsx</li>
//           </ol>
          
//           <button 
//             onClick={() => window.location.reload()}
//             style={{
//               backgroundColor: '#667eea',
//               color: 'white',
//               border: 'none',
//               padding: '1rem 2rem',
//               borderRadius: '8px',
//               fontSize: '1rem',
//               cursor: 'pointer',
//               marginTop: '1rem'
//             }}
//           >
//             🔄 Reload Page
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default App


// src/App.tsx
// Enhanced App.tsx with authentication gate - checks server health and user auth before rendering app components
// Redirects to Welcome page if server is down or user is not authenticated

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Layout components (only rendered if authenticated)
import Sidebar from './layout/Sidebar'
import Topbar from './layout/Topbar'
import BottomBar from './layout/BottomBar'

// Page components
import Home from './pages/home'
import ViewProfile from './pages/ViewProfile'
import Account from './pages/Account'
import Settings from './pages/Settings'
import Welcome from './pages/Welcome'
import NewsDialogue from './pages/news_dialogue'

// Services
import { authService, type User } from './services/authService'
import { newsApiService } from './services/newsApiService'

// Styles
import './index.css'
import './styles/loading.css' // We'll need this for loading states

// Define story interface for bottom bar audio functionality
interface Story {
  id: string
  title: string
  category: string
  thumbnail?: string
}

// Define the different app states for better UX
type AppState = 'checking' | 'unauthenticated' | 'authenticated' | 'server_down'

function App() {
  // === AUTHENTICATION STATE ===
  const [appState, setAppState] = useState<AppState>('checking')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // === AUDIO PLAYER STATE ===
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // === INITIAL AUTHENTICATION CHECK ===
  useEffect(() => {
    /**
     * This runs when the app first loads to determine the user's authentication status
     * and server connectivity. This is our "authentication gate".
     */
    const initializeApp = async () => {
      console.log('🔍 App: Starting authentication and connectivity checks...')
      
      try {
        // STEP 1: Check if backend server is running and responsive
        console.log('🏥 App: Checking backend server health...')
        const isServerHealthy = await newsApiService.checkBackendHealth()
        
        if (!isServerHealthy) {
          console.error('❌ App: Backend server is down or not responding')
          setAppState('server_down')
          setAuthError('Unable to connect to the news service. Please try again later.')
          return
        }
        
        console.log('✅ App: Backend server is healthy and responding')
        
        // STEP 2: Check if user has valid authentication stored locally
        if (!authService.isLoggedIn()) {
          console.log('🚫 App: No valid authentication found locally')
          setAppState('unauthenticated')
          return
        }
        
        console.log('🔍 App: Found local authentication, verifying with backend...')
        
        // STEP 3: Verify the stored token is still valid with the backend
        const authResult = await authService.verifyAuth()
        
        if (authResult.valid) {
          console.log('✅ App: Authentication verified successfully')
          setCurrentUser(authResult.user)
          setAppState('authenticated')
          setAuthError(null)
        } else {
          console.log('❌ App: Authentication verification failed')
          // Clear any invalid stored authentication
          await authService.logout()
          setCurrentUser(null)
          setAppState('unauthenticated')
          setAuthError(authResult.error?.message || 'Session expired. Please log in again.')
        }
        
      } catch (error) {
        console.error('💥 App: Critical error during initialization:', error)
        setAppState('server_down')
        setAuthError('Unable to initialize the application. Please refresh and try again.')
      }
    }

    // Start the initialization process
    initializeApp()
  }, []) // Empty dependency array means this runs once when component mounts

  // === AUDIO PLAYER FUNCTIONS ===
  /**
   * Play a story in the bottom audio bar
   * Called when user clicks play button on a news card
   */
  const playStory = (story: Story) => {
    console.log('🎵 App: Playing story:', story.title)
    setCurrentStory(story)
    setIsBottomBarVisible(true)
    setIsPlaying(true)
  }

  /**
   * Close the bottom audio bar
   * Called when user clicks close or finishes listening
   */
  const closeBottomBar = () => {
    console.log('⏹️ App: Closing bottom audio bar')
    setIsBottomBarVisible(false)
    setIsPlaying(false)
    // Delay clearing the story to allow smooth animation
    setTimeout(() => setCurrentStory(null), 300)
  }

  /**
   * Toggle play/pause state
   */
  const handlePlayPause = () => {
    setIsPlaying(prev => !prev)
    console.log('🎵 App: Audio play/pause toggled:', !isPlaying)
  }

  /**
   * Skip to next story
   */
  const handleSkip = () => {
    console.log('⏭️ App: Skip to next story')
    // TODO: Implement actual skip logic with next story from queue
    closeBottomBar()
  }

  // === LOGOUT HANDLER ===
  /**
   * Handle user logout from any component
   * Clears authentication and redirects to welcome page
   */
  const handleLogout = async () => {
    console.log('🚪 App: User initiated logout')
    
    try {
      await authService.logout()
      setCurrentUser(null)
      setAppState('unauthenticated')
      setAuthError(null)
      console.log('✅ App: Logout completed successfully')
    } catch (error) {
      console.error('💥 App: Error during logout:', error)
      // Even if logout API fails, we still clear local state
      setCurrentUser(null)
      setAppState('unauthenticated')
    }
  }

  // === RENDER LOGIC BASED ON APP STATE ===

  /**
   * Show loading screen while checking authentication
   */
  if (appState === 'checking') {
    return (
      <div className="app-loading-container">
        <div className="loading-content">
          <div className="teacup-spinner">🫖</div>
          <h2>Checking your tea credentials...</h2>
          <p>Verifying authentication and server connectivity</p>
        </div>
      </div>
    )
  }

  /**
   * Show welcome page if server is down
   */
  if (appState === 'server_down') {
    return (
      <Router>
        <div className="app-error-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>Service Temporarily Unavailable</h2>
            <p>{authError}</p>
            <p>Our news brewing service is currently down. Please try again in a few moments.</p>
            <button 
              className="btn-primary" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </Router>
    )
  }

  /**
   * Show welcome page if user is not authenticated
   */
  if (appState === 'unauthenticated') {
    return (
      <Router>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          {/* Redirect all other routes to welcome page */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Router>
    )
  }

  /**
   * MAIN APP - Only rendered if user is authenticated and server is healthy
   */
  return (
    <Router>
      <div className="app-container">
        {/* Left sidebar navigation - only visible when authenticated */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="main-content">
          {/* Top header with search and profile - pass real user data */}
          <Topbar 
            currentUser={currentUser}
            onLogout={handleLogout}
          />
          
          {/* Main page content area */}
          <main className={`body-content ${isBottomBarVisible ? 'with-bottom-bar' : ''}`}>
            <Routes>
              {/* Home page - main news feed */}
              <Route 
                path="/" 
                element={<Home onPlayStory={playStory} />} 
              />
              
              {/* User profile pages */}
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
              
              {/* Redirect any unrecognized routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
              {/* route to news dialogue page */}
              <Route path="/news/:id" element={<NewsDialogue />} />
            </Routes>
          </main>
        </div>

        {/* Bottom audio bar - only shows when a story is playing */}
        {isBottomBarVisible && currentStory && (
          <BottomBar
            story={currentStory}
            onClose={closeBottomBar}
            onPlayPause={handlePlayPause}
            onSkip={handleSkip}
            isPlaying={isPlaying}
          />
        )}
      </div>
    </Router>
  )
}

export default App