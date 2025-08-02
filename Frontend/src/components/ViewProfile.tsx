// Frontend/src/pages/ViewProfile.tsx
// FIXED ViewProfile component - displays REAL user data from database, no hardcoded info
// Shows actual user name, email, settings, and account details

import React from 'react'
import { User, Mail, Calendar, MapPin, Clock, Shield, Settings as SettingsIcon } from 'lucide-react'
import { getCountryName, getCountryFlag } from '../services/authService'
import type { User as AuthUser } from '../services/authService'
import '../styles/pages.css'

// Define the component props - receives real user data
interface ViewProfileProps {
  currentUser: AuthUser | null  // Real user data from database
}

/**
 * ViewProfile component that displays user profile information
 * FIXED: All data now comes from database via currentUser prop (no hardcoding)
 */
export default function ViewProfile({ currentUser }: ViewProfileProps) {
  
  /**
   * Format date for display
   * Converts ISO date string to readable format
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Unknown'
    }
  }

  /**
   * Get user's full name from database data
   */
  const getUserFullName = (): string => {
    if (!currentUser) return 'Loading...'
    
    const firstName = currentUser.first_name?.trim() || ''
    const lastName = currentUser.last_name?.trim() || ''
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else {
      return currentUser.username || 'User'
    }
  }

  /**
   * Get user initials for avatar display
   */
  const getUserInitials = (): string => {
    if (!currentUser) return 'U'
    
    const firstInitial = currentUser.first_name?.charAt(0)?.toUpperCase() || ''
    const lastInitial = currentUser.last_name?.charAt(0)?.toUpperCase() || ''
    
    return firstInitial + lastInitial || currentUser.username?.charAt(0)?.toUpperCase() || 'U'
  }

  /**
   * Get country information for display
   */
  const getCountryInfo = (): { flag: string; name: string } => {
    if (!currentUser?.country_of_interest) {
      return { flag: '🌍', name: 'Not specified' }
    }
    
    return {
      flag: getCountryFlag(currentUser.country_of_interest),
      name: getCountryName(currentUser.country_of_interest)
    }
  }

  /**
   * Calculate how long user has been a member
   */
  const getMembershipDuration = (): string => {
    if (!currentUser?.created_at) return 'Unknown'
    
    try {
      const createdDate = new Date(currentUser.created_at)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - createdDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        return '1 day'
      } else if (diffDays < 30) {
        return `${diffDays} days`
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `${months} month${months > 1 ? 's' : ''}`
      } else {
        const years = Math.floor(diffDays / 365)
        return `${years} year${years > 1 ? 's' : ''}`
      }
    } catch (error) {
      console.error('Error calculating membership duration:', error)
      return 'Unknown'
    }
  }

  // Show loading state if no user data available
  if (!currentUser) {
    console.log('⏳ ViewProfile: No user data available, showing loading state')
    return (
      <div className="page-container">
        <div className="loading-container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          gap: '20px'
        }}>
          <div style={{ fontSize: '48px' }}>🫖</div>
          <div style={{ color: 'white', fontSize: '18px' }}>Loading your profile...</div>
        </div>
      </div>
    )
  }

  console.log('🎨 ViewProfile: Rendering profile for user:', currentUser.username)

  const countryInfo = getCountryInfo()

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <User size={24} />
          </div>
          <div>
            <h1 className="page-title">Profile</h1>
            <p className="page-subtitle">View your profile information</p>
          </div>
        </div>
      </div>

      {/* Profile content */}
      <div className="profile-content">
        {/* Profile picture and basic info section */}
        <div className="settings-card">
          <div className="profile-picture-section">
            {/* Large avatar showing user initials from REAL data */}
            <div className="large-avatar">
              {currentUser.profile_picture ? (
                <img 
                  src={currentUser.profile_picture} 
                  alt={`${getUserFullName()} profile picture`}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span className="large-initial">
                  {getUserInitials()}
                </span>
              )}
            </div>
            
            {/* User name from database */}
            <h2 style={{ 
              color: 'white', 
              fontSize: '24px', 
              fontWeight: '600', 
              margin: '16px 0 8px 0' 
            }}>
              {getUserFullName()}
            </h2>
            
            {/* Username from database */}
            <p style={{ 
              color: '#888', 
              fontSize: '16px', 
              margin: '0 0 16px 0' 
            }}>
              @{currentUser.username}
            </p>
            
            <button className="change-picture-btn">
              📷 Change Picture
            </button>
          </div>
        </div>

        {/* Information grid */}
        <div className="info-grid">
          {/* Personal Information Card - using REAL database data */}
          <div className="settings-card">
            <h3 className="card-title">📋 Personal Information</h3>
            <p className="card-description">Your account details from our database</p>
            
            <div className="info-item">
              <label>
                <User size={16} style={{ marginRight: '8px' }} />
                Full Name
              </label>
              <p>{getUserFullName()}</p>
            </div>
            
            <div className="info-item">
              <label>
                <Mail size={16} style={{ marginRight: '8px' }} />
                Email Address
              </label>
              <p>{currentUser.email}</p>
            </div>
            
            <div className="info-item">
              <label>
                <User size={16} style={{ marginRight: '8px' }} />
                Username
              </label>
              <p>@{currentUser.username}</p>
            </div>
            
            <div className="info-item">
              <label>
                <MapPin size={16} style={{ marginRight: '8px' }} />
                Country of Interest
              </label>
              <p>{countryInfo.flag} {countryInfo.name}</p>
            </div>
          </div>

          {/* Account Activity Card - using REAL timestamps from database */}
          <div className="settings-card">
            <h3 className="card-title">📊 Account Activity</h3>
            <p className="card-description">Your account activity and status</p>
            
            <div className="info-item">
              <label>
                <Calendar size={16} style={{ marginRight: '8px' }} />
                Member Since
              </label>
              <p>{formatDate(currentUser.created_at)}</p>
            </div>
            
            <div className="info-item">
              <label>
                <Clock size={16} style={{ marginRight: '8px' }} />
                Last Login
              </label>
              <p>{formatDate(currentUser.last_login)}</p>
            </div>
            
            <div className="info-item">
              <label>
                <Shield size={16} style={{ marginRight: '8px' }} />
                Account Status
              </label>
              <p style={{ 
                color: currentUser.is_active ? '#22c55e' : '#ef4444',
                fontWeight: '600'
              }}>
                {currentUser.is_active ? '✅ Active' : '❌ Inactive'}
              </p>
            </div>
            
            <div className="info-item">
              <label>
                <Calendar size={16} style={{ marginRight: '8px' }} />
                Membership Duration
              </label>
              <p>{getMembershipDuration()}</p>
            </div>
          </div>

          {/* Account Management Card */}
          <div className="settings-card">
            <h3 className="card-title">⚙️ Account Management</h3>
            <p className="card-description">Manage your account settings and preferences</p>
            
            <div className="info-item">
              <label>
                <SettingsIcon size={16} style={{ marginRight: '8px' }} />
                Quick Actions
              </label>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                marginTop: '8px'
              }}>
                <button 
                  className="btn-secondary"
                  onClick={() => window.location.href = '/account'}
                  style={{ textAlign: 'left' }}
                >
                  📝 Edit Account Details
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => window.location.href = '/settings'}
                  style={{ textAlign: 'left' }}
                >
                  🔧 Update Preferences
                </button>
                <button 
                  className="btn-danger-small"
                  style={{ textAlign: 'left' }}
                >
                  📦 Download My Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}