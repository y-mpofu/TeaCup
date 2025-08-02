// Frontend/src/components/Profile.tsx
// FIXED Profile component - gets user info from database, no hardcoded data
// Shows REAL user name, email, and initials from authentication

import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/profile.css'
import { LogOut, Settings, User, UserCog } from 'lucide-react'
import { getCountryName, getCountryFlag } from '../services/authService'
import type { User as AuthUser } from '../services/authService'

// Define the component props - receives real user data from App.tsx
interface ProfileProps {
  currentUser: AuthUser | null  // Real user data from database
  onLogout: () => Promise<void>  // Logout function from App.tsx
}

/**
 * Profile component that displays user dropdown menu
 * FIXED: All user info now comes from database via currentUser prop
 */
export default function Profile({ currentUser, onLogout }: ProfileProps) {
  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug logging to track user data changes
  useEffect(() => {
    if (currentUser) {
      console.log('👤 Profile: User data updated:', {
        username: currentUser.username,
        name: `${currentUser.first_name} ${currentUser.last_name}`,
        email: currentUser.email,
        country: currentUser.country_of_interest
      })
    } else {
      console.log('👤 Profile: No user data available')
    }
  }, [currentUser])

  /**
   * Toggle dropdown menu visibility
   */
  const toggleDropdown = () => {
    console.log('🔽 Profile: Avatar clicked, toggling dropdown from:', isDropdownOpen)
    setIsDropdownOpen(!isDropdownOpen)
  }

  /**
   * Close dropdown when clicking outside of it
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('👆 Profile: Clicked outside, closing dropdown')
        setIsDropdownOpen(false)
      }
    }

    // Only add listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    // Cleanup listener on unmount or when dropdown closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  /**
   * Handle user logout
   * Closes dropdown and calls parent logout function
   */
  const handleLogout = async () => {
    try {
      console.log('🚪 Profile: Logout button clicked')
      setIsDropdownOpen(false) // Close dropdown immediately
      await onLogout() // Call parent logout function
      console.log('✅ Profile: Logout completed')
    } catch (error) {
      console.error('💥 Profile: Error during logout:', error)
    }
  }

  /**
   * Generate user initials from REAL database data ONLY
   * ABSOLUTELY NO HARDCODING - uses actual user data from database
   */
  const getUserInitials = (): string => {
    // If no user data, return generic fallback
    if (!currentUser) {
      console.log('⚠️ Profile: No currentUser data available, using fallback')
      return '?'
    }
    
    console.log('🔍 Profile: Generating initials for user:', {
      username: currentUser.username,
      firstName: currentUser.first_name,
      lastName: currentUser.last_name
    })
    
    // Get first letter of first name and last name from database
    const firstInitial = currentUser.first_name?.trim()?.charAt(0)?.toUpperCase() || ''
    const lastInitial = currentUser.last_name?.trim()?.charAt(0)?.toUpperCase() || ''
    
    // Priority: Use first + last name initials from database
    if (firstInitial && lastInitial) {
      const initials = firstInitial + lastInitial
      console.log('✅ Profile: Generated initials from name:', initials)
      return initials
    } 
    // Fallback: Use just first name initial
    else if (firstInitial) {
      console.log('✅ Profile: Generated initial from first name:', firstInitial)
      return firstInitial
    } 
    // Last resort: Use username initial
    else if (currentUser.username) {
      const usernameInitial = currentUser.username.charAt(0).toUpperCase()
      console.log('✅ Profile: Generated initial from username:', usernameInitial)
      return usernameInitial
    } 
    // Absolute fallback if somehow no data exists
    else {
      console.log('⚠️ Profile: No name or username data, using fallback')
      return '?'
    }
  }

  /**
   * Get user's full name from database data ONLY
   * ABSOLUTELY NO HARDCODING - uses actual user data from database
   */
  const getUserFullName = (): string => {
    // If no user data, return loading message
    if (!currentUser) {
      console.log('⚠️ Profile: No currentUser data for full name')
      return 'Loading...'
    }
    
    console.log('🔍 Profile: Generating full name for user:', {
      username: currentUser.username,
      firstName: currentUser.first_name,
      lastName: currentUser.last_name
    })
    
    // Get names from database and clean them
    const firstName = currentUser.first_name?.trim() || ''
    const lastName = currentUser.last_name?.trim() || ''
    
    // Priority: Use both first and last name from database
    if (firstName && lastName) {
      const fullName = `${firstName} ${lastName}`
      console.log('✅ Profile: Generated full name:', fullName)
      return fullName
    } 
    // Fallback: Use just first name
    else if (firstName) {
      console.log('✅ Profile: Using first name only:', firstName)
      return firstName
    } 
    // Last resort: Use username
    else if (currentUser.username) {
      console.log('✅ Profile: Using username as display name:', currentUser.username)
      return currentUser.username
    } 
    // Absolute fallback
    else {
      console.log('⚠️ Profile: No name data available, using fallback')
      return 'User'
    }
  }

  /**
   * Get user's country information for display
   */
  const getUserCountryInfo = (): string => {
    if (!currentUser?.country_of_interest) {
      return ''
    }
    
    const flag = getCountryFlag(currentUser.country_of_interest)
    const name = getCountryName(currentUser.country_of_interest)
    return `${flag} ${name}`
  }

  // Show loading state if no user data available
  if (!currentUser) {
    console.log('⏳ Profile: No user data, showing loading state')
    return (
      <div className="profile-container">
        <div className="profile-avatar">
          <User size={20} />
        </div>
        <span style={{ 
          color: 'white', 
          marginLeft: '8px', 
          fontSize: '12px',
          opacity: 0.7
        }}>
          Loading...
        </span>
      </div>
    )
  }

  console.log('🎨 Profile: Rendering dropdown with user:', currentUser.username, 'Open:', isDropdownOpen)

  return (
    <div className="profile-container" ref={dropdownRef}>
      {/* Profile avatar button - shows user initials from database */}
      <button 
        className="profile-button" 
        onClick={toggleDropdown} 
        aria-label={`Open profile menu for ${getUserFullName()}`}
        title={`${getUserFullName()} - Click to open menu`}
      >
        <div className="profile-avatar">
          {currentUser.profile_picture ? (
            // Show profile picture if user has uploaded one
            <img 
              src={currentUser.profile_picture} 
              alt={`${getUserFullName()} profile picture`}
              className="profile-image"
            />
          ) : (
            // Show initials generated from REAL user data (not hardcoded)
            <span className="profile-initial">
              {getUserInitials()}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown menu - only shows when clicked */}
      {isDropdownOpen && (
        <div className="profile-dropdown">
          {/* User info section - displays REAL user data from database */}
          <div className="profile-info">
            {/* Small avatar in dropdown */}
            <div className="profile-avatar-small">
              {currentUser.profile_picture ? (
                <img 
                  src={currentUser.profile_picture} 
                  alt="Profile"
                  className="profile-image-small"
                />
              ) : (
                <span className="profile-initial">
                  {getUserInitials()}
                </span>
              )}
            </div>
            
            {/* User details from database - NO HARDCODED VALUES */}
            <div className="profile-details">
              {/* Display REAL user name from database */}
              <div className="profile-name" title={getUserFullName()}>
                {getUserFullName()}
              </div>
              
              {/* Display REAL user email from database */}
              <div className="profile-email" title={currentUser.email}>
                {currentUser.email}
              </div>
              
              {/* Display user's country if available */}
              {currentUser.country_of_interest && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666', 
                  marginTop: '2px' 
                }}>
                  {getUserCountryInfo()}
                </div>
              )}
            </div>
          </div>

          {/* Menu items using CSS classes */}
          <div className="profile-menu">
            {/* Account settings link */}
            <Link
              to="/account"
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
              title="Manage your account settings"
            >
              <UserCog className="dropdown-icon" size={16} />
              <span>Account</span>
            </Link>

            {/* General settings link */}
            <Link
              to="/settings"
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
              title="Adjust your preferences"
            >
              <Settings className="dropdown-icon" size={16} />
              <span>Settings</span>
            </Link>

            {/* Divider line */}
            <hr className="dropdown-divider" />

            {/* Logout button */}
            <button
              className="dropdown-item logout-item"
              onClick={handleLogout}
              title={`Sign out ${getUserFullName()}`}
            >
              <LogOut className="dropdown-icon" size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}