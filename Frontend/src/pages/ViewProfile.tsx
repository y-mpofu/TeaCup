
// Frontend/src/pages/ViewProfile.tsx
// Fixed ViewProfile component interface to accept currentUser prop

import React from 'react';
import { User, Mail, Calendar, MapPin, Clock, Shield, Settings as SettingsIcon } from 'lucide-react';
import { getCountryName, getCountryFlag } from '../services/authService';
import type { User as AuthUser } from '../services/authService';
import '../styles/pages.css';

// Define the component props interface - receives real user data
interface ViewProfileProps {
  currentUser: AuthUser | null;  // Real user data from App.tsx authentication
}

/**
 * ViewProfile component that displays user profile information
 * Now properly typed to receive currentUser prop from App.tsx
 */
export default function ViewProfile({ currentUser }: ViewProfileProps) {
  
  /**
   * Format date for display
   * Converts ISO date string to readable format
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  /**
   * Get user's full name from database data
   */
  const getUserFullName = (): string => {
    if (!currentUser) return 'Loading...';
    
    const firstName = currentUser.first_name?.trim() || '';
    const lastName = currentUser.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else {
      return currentUser.username || 'User';
    }
  };

  /**
   * Get user initials for avatar display
   */
  const getUserInitials = (): string => {
    if (!currentUser) return 'U';
    
    const firstInitial = currentUser.first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = currentUser.last_name?.charAt(0)?.toUpperCase() || '';
    
    return firstInitial + lastInitial || currentUser.username?.charAt(0)?.toUpperCase() || 'U';
  };

  // Show loading state if no user data
  if (!currentUser) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="view-profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser.profile_picture ? (
              <img 
                src={currentUser.profile_picture} 
                alt={`${getUserFullName()}'s profile`}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                {getUserInitials()}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">{getUserFullName()}</h1>
            <p className="profile-username">@{currentUser.username}</p>
            <div className="profile-country">
              <MapPin size={16} />
              <span>
                {getCountryFlag(currentUser.country_of_interest)} {getCountryName(currentUser.country_of_interest)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-card">
            <div className="detail-item">
              <Mail size={18} />
              <div className="detail-content">
                <label>Email Address</label>
                <span>{currentUser.email}</span>
              </div>
            </div>

            <div className="detail-item">
              <Calendar size={18} />
              <div className="detail-content">
                <label>Member Since</label>
                <span>{formatDate(currentUser.created_at)}</span>
              </div>
            </div>

            <div className="detail-item">
              <Clock size={18} />
              <div className="detail-content">
                <label>Last Login</label>
                <span>{formatDate(currentUser.last_login)}</span>
              </div>
            </div>

            <div className="detail-item">
              <Shield size={18} />
              <div className="detail-content">
                <label>Account Status</label>
                <span className={`status ${currentUser.is_active ? 'active' : 'inactive'}`}>
                  {currentUser.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}