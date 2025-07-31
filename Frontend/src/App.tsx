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
// Main application component with authentication and routing

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './layout/Sidebar'
import Topbar from './layout/Topbar'
import BottomBar from './layout/BottomBar'
import Home from './pages/home'
import ViewProfile from './pages/ViewProfile'
import Account from './pages/Account'
import Settings from './pages/Settings'
import Welcome from './pages/Welcome'  // Import our new Welcome page
import { authService, type User } from './services/authService'  // Import authentication

// Import global styles and layout styles
import './index.css'

// Define story interface for bottom bar
interface Story {
  id: string
  title: string
  category: string
  thumbnail?: string
}

/**
 * ProtectedRoute component
 * This component protects routes that require authentication
 * If user is not logged in, redirects to welcome page
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user has a stored token
      if (authService.isLoggedIn()) {
        // Verify the token with the backend
        const authResult = await authService.verifyAuth();
        setIsAuthenticated(authResult.valid);
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(255,255,255,0.3)', 
            borderTop: '3px solid white', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // If authenticated, render the protected content
  // If not authenticated, redirect to welcome page
  return isAuthenticated ? <>{children}</> : <Navigate to="/welcome" replace />;
}

function App() {
  // State for the currently playing story in bottom bar
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false)
  
  // State for user authentication
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  /**
   * Check authentication status when app starts
   * This ensures we have the current user information available
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isLoggedIn()) {
        const authResult = await authService.verifyAuth();
        if (authResult.valid) {
          setCurrentUser(authResult.user);
          console.log('✅ User authenticated:', authResult.user.username);
        } else {
          console.log('❌ Stored token is invalid');
          setCurrentUser(null);
        }
      }
    };
    
    initializeAuth();
  }, []);

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
  
  /**
   * Handle user logout
   * This function is called from the Topbar or other components
   */
  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await authService.logout();
      setCurrentUser(null);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('💥 Error during logout:', error);
    }
  };

  return (
    <Router>
      <Routes>
        {/* Welcome/Login page - accessible without authentication */}
        <Route path="/welcome" element={<Welcome />} />
        
        {/* All other routes require authentication */}
        <Route path="/*" element={
          <ProtectedRoute>
            {/* Main application layout - only renders when authenticated */}
            <div className="app-container">
              {/* Left sidebar navigation */}
              <Sidebar />
              
              {/* Main content area */}
              <div className="main-content">
                {/* Top header with search and profile - pass user and logout function */}
                <Topbar 
                  currentUser={currentUser} 
                  onLogout={handleLogout}
                />
                
                {/* Main page content where all pages are displayed */}
                <main className={`body-content ${isBottomBarVisible ? 'with-bottom-bar' : ''}`}>
                  <Routes>
                    {/* Home page route - passes playStory function to handle story clicks */}
                    <Route 
                      path="/" 
                      element={<Home onPlayStory={playStory} />} 
                    />
                    
                    {/* Profile-related routes - pass current user information */}
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

                    {/* News category routes (you can add these later) */}
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

                    {/* Search and Saved pages */}
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
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App