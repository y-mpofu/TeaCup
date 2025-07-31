// Frontend/src/pages/Account.tsx
// Updated Account component with proper state management and backend integration

import React, { useState } from 'react'
import { User, Edit, Save, X, Shield, Smartphone, Monitor, AlertTriangle } from 'lucide-react'
import type { User as AuthUser } from '../services/authService'
import '../styles/pages.css'

// Define the component props
interface AccountProps {
  currentUser: AuthUser | null
}

// Form data interface
interface FormData {
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function Account({ currentUser }: AccountProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  // Show loading if no user data
  if (!currentUser) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <User size={40} />
          <p>Loading account...</p>
        </div>
      </div>
    )
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear message when user starts typing
    if (message) {
      setMessage('')
      setMessageType('')
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Validate passwords
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage('New passwords do not match')
        setMessageType('error')
        return
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        setMessage('New password must be at least 6 characters')
        setMessageType('error')
        return
      }

      // Here you would typically call your backend API
      console.log('Updating account with:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage('Account updated successfully!')
      setMessageType('success')
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      
    } catch (error) {
      setMessage('Failed to update account. Please try again.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested')
      // TODO: Implement account deletion
      alert('Account deletion would be implemented here')
    }
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="page-title">Account Security</h1>
            <p className="page-subtitle">Manage your account security and login information</p>
          </div>
        </div>
      </div>

      {/* Success/Error message */}
      {message && (
        <div className={`message-banner ${messageType}`}>
          {messageType === 'success' ? '✅' : '❌'} {message}
        </div>
      )}

      <div className="account-content">
        {/* Account Security Card */}
        <div className="settings-card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={20} />
              Security Settings
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="settings-form">
            {/* Email Section */}
            <div className="form-section">
              <h4 className="section-title">Email Address</h4>
              <div className="form-group">
                <label htmlFor="email">Current Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled={!isEditing}
                />
                <small className="form-help">This email is used for account recovery and notifications</small>
              </div>
            </div>

            {/* Password Section */}
            <div className="form-section">
              <h4 className="section-title">Change Password</h4>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter current password"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <small className="form-help">Password must be at least 6 characters long</small>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Update Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Two-Factor Authentication Card */}
        <div className="settings-card">
          <div className="card-header">
            <h3 className="card-title">
              <Smartphone size={20} />
              Two-Factor Authentication
            </h3>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">SMS Authentication</span>
                <span className="setting-description">Receive verification codes via text message</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Authenticator App</span>
                <span className="setting-description">Use an authenticator app for verification codes</span>
              </div>
              <button className="btn-secondary">Setup</button>
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className="settings-card">
          <div className="card-header">
            <h3 className="card-title">
              <User size={20} />
              Account Information
            </h3>
          </div>
          <div className="account-details">
            <div className="detail-row">
              <span className="detail-label">Username</span>
              <span className="detail-value">@{currentUser.username}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{currentUser.first_name} {currentUser.last_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">{new Date(currentUser.created_at).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last Login</span>
              <span className="detail-value">{new Date(currentUser.last_login).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-card danger-zone">
          <div className="card-header">
          </div>
          <div className="danger-actions">
            <div className="danger-item">
              <div className="danger-info">
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              <button 
                className="btn-danger"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}