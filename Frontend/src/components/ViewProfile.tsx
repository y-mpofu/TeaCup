import React from 'react'
import '../styles/pages.css'

export default function ViewProfile() {
  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">View and manage your profile information</p>
      </div>

      {/* Profile content */}
      <div className="profile-content">
        {/* Profile picture section */}
        <div className="profile-picture-section">
          <div className="large-avatar">
            <span className="large-initial">JD</span>
          </div>
          <button className="change-picture-btn">
             Change Picture
          </button>
        </div>

        {/* User information cards */}
        <div className="info-grid">
          {/* Personal Information Card */}
          <div className="info-card">
            <h3 className="card-title">Personal Information</h3>
            <div className="info-item">
              <label>Full Name</label>
              <p>John Doe</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>john@example.com</p>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="info-item">
              <label>Location</label>
              <p>Harare, Zimbabwe</p>
            </div>
          </div>

          {/* News Preferences Card */}
          <div className="info-card">
            <h3 className="card-title">News Preferences</h3>
            <div className="info-item">
              <label>Favorite Categories</label>
              <div className="preference-tags">
                <span className="tag">Politics</span>
                <span className="tag">Sports</span>
                <span className="tag">Technology</span>
              </div>
            </div>
            <div className="info-item">
              <label>Language</label>
              <p>English</p>
            </div>
            <div className="info-item">
              <label>Reading Time</label>
              <p>Morning (7:00 - 9:00 AM)</p>
            </div>
          </div>

          {/* Account Statistics Card */}
          <div className="info-card">
            <h3 className="card-title">Account Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">127</span>
                <span className="stat-label">Articles Read</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">23</span>
                <span className="stat-label">Saved Articles</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">45</span>
                <span className="stat-label">Days Active</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">8</span>
                <span className="stat-label">Categories Followed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="profile-actions">
          <button className="btn-primary">Edit Profile</button>
          <button className="btn-secondary">Download Data</button>
        </div>
      </div>
    </div>
  )
}