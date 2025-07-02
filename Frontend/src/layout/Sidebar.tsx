// src/layout/Sidebar.tsx
// Fixed sidebar navigation with proper UI icons instead of emojis

import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Search, 
  Bookmark, 
  User, 
  Settings, 
  Menu,
  X,
  Newspaper,
  TrendingUp,
  Headphones
} from 'lucide-react'

export default function Sidebar() {
  // Track collapsed state
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
      {/* Sidebar header with brand and toggle */}
      <div className="sidebar-header">
        <h1 className="sidebar-brand">Vuka Unzwe</h1>
      </div>

      {/* Main navigation */}
      <nav className="sidebar-nav">
        {/* Toggle button */}
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        {/* Home */}
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

        {/* Search */}
        <Link 
          to="/search" 
          className={`nav-link ${isActive('/search') ? 'active' : ''}`}
          data-tooltip="Search"
        >
          <span className="nav-icon">
            <Search size={20} />
          </span>
          <span className="nav-text">Search</span>
        </Link>

        {/* Saved Articles */}
        <Link 
          to="/saved" 
          className={`nav-link ${isActive('/saved') ? 'active' : ''}`}
          data-tooltip="Saved"
        >
          <span className="nav-icon">
            <Bookmark size={20} />
          </span>
          <span className="nav-text">Saved</span>
        </Link>

        {/* Currently Playing */}
        <Link 
          to="/playing" 
          className={`nav-link ${isActive('/playing') ? 'active' : ''}`}
          data-tooltip="Now Playing"
        >
          <span className="nav-icon">
            <Headphones size={20} />
          </span>
          <span className="nav-text">Now Playing</span>
        </Link>
      </nav>

      {/* Divider */}
      <div className="sidebar-divider"></div>

      {/* Categories section */}
      <div className="sidebar-section">
        {!isCollapsed && (
          <h3 className="section-title">Categories</h3>
        )}
        
        <nav className="sidebar-nav">
          {/* Politics */}
          <Link 
            to="/category/politics" 
            className={`nav-link ${isActive('/category/politics') ? 'active' : ''}`}
            data-tooltip="Politics"
          >
            <span className="nav-icon">
              <Newspaper size={20} />
            </span>
            <span className="nav-text">Politics</span>
          </Link>

          {/* Local Trends */}
          <Link 
            to="/category/local" 
            className={`nav-link ${isActive('/category/local') ? 'active' : ''}`}
            data-tooltip="Local Trends"
          >
            <span className="nav-icon">
              <TrendingUp size={20} />
            </span>
            <span className="nav-text">Local Trends</span>
          </Link>
        </nav>
      </div>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider"></div>
        
        <nav className="sidebar-nav">
          {/* Profile */}
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            data-tooltip="Profile"
          >
            <span className="nav-icon">
              <User size={20} />
            </span>
            <span className="nav-text">Profile</span>
          </Link>

          {/* Settings */}
          <Link 
            to="/settings" 
            className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
            data-tooltip="Settings"
          >
            <span className="nav-icon">
              <Settings size={20} />
            </span>
            <span className="nav-text">Settings</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}