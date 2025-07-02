import React, { useState } from 'react'
import '../styles/pages.css'

export default function Account() {
  // State for managing form inputs
  const [formData, setFormData] = useState({
    email: 'john@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Add actual form submission logic here
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage your account security and login information</p>
      </div>

      <div className="account-content">
        {/* Account Security Card */}
        <div className="settings-card">
          <h3 className="card-title"> Security Settings</h3>
          
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
                />
                <button type="button" className="btn-link">Change Email</button>
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
                />
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
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>

        {/* Two-Factor Authentication Card */}
        <div className="settings-card">
          <h3 className="card-title"> Two-Factor Authentication</h3>
          <div className="setting-item">
            <div className="setting-info">
              <h4>SMS Authentication</h4>
              <p>Receive verification codes via text message</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input type="checkbox" />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4>Authenticator App</h4>
              <p>Use an authenticator app for verification codes</p>
            </div>
            <div className="setting-control">
              <button className="btn-secondary">Setup</button>
            </div>
          </div>
        </div>

        {/* Login Sessions Card */}
        <div className="settings-card">
          <h3 className="card-title"> Active Sessions</h3>
          <div className="session-list">
            {/* Current session */}
            <div className="session-item current">
              <div className="session-info">
                <h4>Current Device</h4>
                <p>Chrome on Windows • Harare, Zimbabwe</p>
                <span className="session-time">Active now</span>
              </div>
              <span className="session-badge current">Current</span>
            </div>
            
            {/* Other sessions */}
            <div className="session-item">
              <div className="session-info">
                <h4>Mobile Device</h4>
                <p>Safari on iPhone • Harare, Zimbabwe</p>
                <span className="session-time">2 hours ago</span>
              </div>
              <button className="btn-danger-small">Revoke</button>
            </div>
          </div>
          <button className="btn-secondary">Revoke All Other Sessions</button>
        </div>

        {/* Danger Zone */}
        <div className="settings-card danger-zone">
          <h3 className="card-title"> Danger Zone</h3>
          <div className="danger-actions">
            <div className="danger-item">
              <div>
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all data</p>
              </div>
              <button className="btn-danger">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}