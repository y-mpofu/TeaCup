// Frontend/src/components/Profile.tsx
// Fixed Profile component using CSS classes with authentication support

import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/profile.css'
import { LogOut, Settings, User, UserCog } from 'lucide-react'
import type { User as AuthUser } from '../services/authService'

// Define the component props
interface ProfileProps {
  currentUser: AuthUser | null
  onLogout: () => Promise<void>
}

export default function Profile({ currentUser, onLogout }: ProfileProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug logging
  useEffect(() => {
    console.log('Profile component mounted with user:', currentUser)
  }, [currentUser])

  const toggleDropdown = () => {
    console.log('Profile: Avatar clicked, current state:', isDropdownOpen)
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Handle logout with loading state
  const handleLogout = async () => {
    try {
      console.log('Profile: Logout button clicked')
      setIsDropdownOpen(false) // Close dropdown first
      await onLogout()
      console.log('Profile: Logout completed')
    } catch (error) {
      console.error('Profile: Error during logout:', error)
    }
  }

  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (!currentUser) return 'U'
    
    const firstInitial = currentUser.first_name?.charAt(0)?.toUpperCase() || ''
    const lastInitial = currentUser.last_name?.charAt(0)?.toUpperCase() || ''
    
    return firstInitial + lastInitial || currentUser.username?.charAt(0)?.toUpperCase() || 'U'
  }

  // Show loading state if no user - using CSS classes
  if (!currentUser) {
    console.log('Profile: No current user, showing loading state')
    return (
      <div className="profile-container">
        <div className="profile-avatar">
          <User size={20} />
        </div>
        <span style={{ color: 'white', marginLeft: '8px', fontSize: '12px' }}>
          Loading...
        </span>
      </div>
    )
  }

  console.log('Profile: Rendering with user:', currentUser.username, 'Dropdown open:', isDropdownOpen)

  return (
    <div className="profile-container" ref={dropdownRef}>
      {/* Profile button using CSS classes */}
      <button className="profile-button" onClick={toggleDropdown} aria-label="Open profile menu">
        <div className="profile-avatar">
          {currentUser.profile_picture ? (
            <img 
              src={currentUser.profile_picture} 
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <span className="profile-initial">
              {getUserInitials()}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown menu using CSS classes */}
      {isDropdownOpen && (
        <div className="profile-dropdown">
          {/* User info section using CSS classes */}

          

          {/* Menu items using CSS classes */}
          <div className="dropdown-menu">

            <Link
              to="/account"
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              <UserCog className="dropdown-icon" />
              <span>Account</span>
            </Link>

            <Link
              to="/settings"
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Settings className="dropdown-icon" />
              <span>Settings</span>
            </Link>

            <hr className="dropdown-divider" />

            {/* Logout button using CSS classes */}
            <button
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              <LogOut className="dropdown-icon" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}