// // src/layout/Sidebar.tsx
// // Fixed sidebar navigation with proper UI icons instead of emojis

// import React, { useState } from 'react'
// import { Link, useLocation } from 'react-router-dom'
// import { 
//   Home, 
//   Search, 
//   Bookmark, 
//   User, 
//   Settings, 
//   Menu,
//   X,
//   Newspaper,
//   TrendingUp,
//   Headphones
// } from 'lucide-react'

// export default function Sidebar() {
//   // Track collapsed state
//   const [isCollapsed, setIsCollapsed] = useState(false)
  
//   // Get current location for active link styling
//   const location = useLocation()

//   // Toggle sidebar collapse
//   const toggleSidebar = () => {
//     setIsCollapsed(!isCollapsed)
//   }

//   // Check if a link is active
//   const isActive = (path: string) => {
//     return location.pathname === path
//   }

//   return (
//     <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
//       {/* Sidebar header with brand and toggle */}
//       <div className="sidebar-header">
//         <h1 className="sidebar-brand">Vuka Unzwe</h1>
//       </div>

//       {/* Main navigation */}
//       <nav className="sidebar-nav">
//         {/* Toggle button */}
//         <button 
//           className="sidebar-toggle"
//           onClick={toggleSidebar}
//           aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//         >
//           {isCollapsed ? <Menu size={20} /> : <X size={20} />}
//         </button>
//         {/* Home */}
//         <Link 
//           to="/" 
//           className={`nav-link ${isActive('/') ? 'active' : ''}`}
//           data-tooltip="Home"
//         >
//           <span className="nav-icon">
//             <Home size={20} />
//           </span>
//           <span className="nav-text">Home</span>
//         </Link>

//         {/* Search */}
//         <Link 
//           to="/search" 
//           className={`nav-link ${isActive('/search') ? 'active' : ''}`}
//           data-tooltip="Search"
//         >
//           <span className="nav-icon">
//             <Search size={20} />
//           </span>
//           <span className="nav-text">Search</span>
//         </Link>

//         {/* Saved Articles */}
//         <Link 
//           to="/saved" 
//           className={`nav-link ${isActive('/saved') ? 'active' : ''}`}
//           data-tooltip="Saved"
//         >
//           <span className="nav-icon">
//             <Bookmark size={20} />
//           </span>
//           <span className="nav-text">Saved</span>
//         </Link>

//         {/* Currently Playing */}
//         <Link 
//           to="/playing" 
//           className={`nav-link ${isActive('/playing') ? 'active' : ''}`}
//           data-tooltip="Now Playing"
//         >
//           <span className="nav-icon">
//             <Headphones size={20} />
//           </span>
//           <span className="nav-text">Now Playing</span>
//         </Link>
//       </nav>

//       {/* Divider */}
//       <div className="sidebar-divider"></div>

//       {/* Categories section */}
//       <div className="sidebar-section">
//         {!isCollapsed && (
//           <h3 className="section-title">Categories</h3>
//         )}
        
//         <nav className="sidebar-nav">
//           {/* Politics */}
//           <Link 
//             to="/category/politics" 
//             className={`nav-link ${isActive('/category/politics') ? 'active' : ''}`}
//             data-tooltip="Politics"
//           >
//             <span className="nav-icon">
//               <Newspaper size={20} />
//             </span>
//             <span className="nav-text">Politics</span>
//           </Link>

//           {/* Local Trends */}
//           <Link 
//             to="/category/local" 
//             className={`nav-link ${isActive('/category/local') ? 'active' : ''}`}
//             data-tooltip="Local Trends"
//           >
//             <span className="nav-icon">
//               <TrendingUp size={20} />
//             </span>
//             <span className="nav-text">Local Trends</span>
//           </Link>
//         </nav>
//       </div>

//       {/* Bottom section */}
//       <div className="sidebar-bottom">
//         <div className="sidebar-divider"></div>
        
//         <nav className="sidebar-nav">
//           {/* Profile */}
//           <Link 
//             to="/profile" 
//             className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
//             data-tooltip="Profile"
//           >
//             <span className="nav-icon">
//               <User size={20} />
//             </span>
//             <span className="nav-text">Profile</span>
//           </Link>

//           {/* Settings */}
//           <Link 
//             to="/settings" 
//             className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
//             data-tooltip="Settings"
//           >
//             <span className="nav-icon">
//               <Settings size={20} />
//             </span>
//             <span className="nav-text">Settings</span>
//           </Link>
//         </nav>
//       </div>
//     </aside>
//   )
// }




// src/layout/Sidebar.tsx
// Updated sidebar to match the TeaCup design with new navigation structure

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  // Main navigation icons
  Coffee,        // For TeaCup brand icon
  Circle,        // For The Sip
  MessageSquare, // For Hot Takes
  List,          // For My Mix
  
  // Category icons
  Flag,        // For Politics
  Droplets,      // For Local Spills
  Vote,
  Radio,         // For Weather
  Cross,         // For Health
  Home,          // For Culture
  Globe,
  UserCheck,         // For Global
  
  // Bottom section icons
  Bookmark,      // For Saved Stories
  Settings,      // For Settings
  
  // UI icons
  Menu,
  X,
  CupSoda,
  CoffeeIcon
} from 'lucide-react'

export default function Sidebar() {
  // Track collapsed state - keeping this functionality from original
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Get current location for active link styling
  const location = useLocation()

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar header with TeaCup brand */}
      <div className="sidebar-header">
        <div className="brand-container">
          <Coffee size={24} className="brand-icon" />
          <h1 className="sidebar-brand">TeaCup</h1>
        </div>
      </div>

      {/* Main navigation section */}
      <nav className="sidebar-nav">
        {/* Home - Main page */}
                {/* Toggle button for collapse functionality */}
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        <Link 
          to="/" 
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
          data-tooltip="Home"
        >
          <span className="nav-icon">
            <Home size={20} />
          </span>
          <span className="nav-text">Home</span>
        </Link>

        {/* The Sip - Main feed */}
        <Link 
          to="/sip" 
          className={`nav-link ${isActive('/sip') ? 'active' : ''}`}
          data-tooltip="The Sip"
        >
          <span className="nav-icon">
            <CupSoda size={20} />
          </span>
          <span className="nav-text">General Sip</span>
        </Link>

        {/* Hot Takes - Trending content */}
        <Link 
          to="/hot-takes" 
          className={`nav-link ${isActive('/hot-takes') ? 'active' : ''}`}
          data-tooltip="Hot Takes"
        >
          <span className="nav-icon">
            <MessageSquare size={20} />
          </span>
          <span className="nav-text">Trending Tea</span>
        </Link>

        {/* My Mix - Personalized content */}
        <Link 
          to="/my-mix" 
          className={`nav-link ${isActive('/my-mix') ? 'active' : ''}`}
          data-tooltip="My Mix"
        >
          <span className="nav-icon">
            <List size={20} />
          </span>
          <span className="nav-text">For You</span>
        </Link>
      </nav>

      {/* PAPERBOY DELIVERY section */}
      <div className="sidebar-section">
        {!isCollapsed && (
          
          <h3 className="section-title">PAPERBOY DELIVERY 
            <img 
              src="./paperboy.png"
              className="section-icon"
              width={60}
              height={60}
            />
          </h3>
        )}
        
        <nav className="sidebar-nav">
          {/* Politics */}
          <Link 
            to="/politics" 
            className={`nav-link ${isActive('/politics') ? 'active' : ''}`}
            data-tooltip="Politics"
          >
            <span className="nav-icon">
              <Flag size={20} />
            </span>
            <span className="nav-text">Politics</span>
          </Link>

          {/* Local Spills */}
          <Link 
            to="/local-spills" 
            className={`nav-link ${isActive('/local-spills') ? 'active' : ''}`}
            data-tooltip="Local Spills"
          >
            <span className="nav-icon">
              <Radio size={20} />
            </span>
            <span className="nav-text">Local Spills</span>
          </Link>

          {/* Health */}
          <Link 
            to="/health" 
            className={`nav-link ${isActive('/health') ? 'active' : ''}`}
            data-tooltip="Health"
          >
            <span className="nav-icon">
              <Cross size={20} />
            </span>
            <span className="nav-text">Health</span>
          </Link>

          {/* Global */}
          <Link 
            to="/global" 
            className={`nav-link ${isActive('/global') ? 'active' : ''}`}
            data-tooltip="Global"
          >
            <span className="nav-icon">
              <Globe size={20} />
            </span>
            <span className="nav-text">Global</span>
          </Link>
        </nav>
      </div>

      {/* Community Section */}
      <div className="sidebar-section">
        {!isCollapsed && (
          <h3 className="section-title">Community</h3>
        )}
        
        <nav className="sidebar-nav">
          {/* Saved Stories */}
          <Link 
            to="/saved-stories" 
            className={`nav-link ${isActive('/saved-stories') ? 'active' : ''}`}
            data-tooltip="Saved Stories"
          >
            <span className="nav-icon">
              <Bookmark size={20} />
            </span>
            <span className="nav-text">Saved Stories</span>
          </Link>

          {/* Settings */}
          <Link 
            to="/hudle" 
            className={`nav-link ${isActive('/hudle') ? 'active' : ''}`}
            data-tooltip="hudle"
          >
            <span className="nav-icon">
              <UserCheck size={20} />
            </span>
            <span className="nav-text">Start a Tea Party</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}



