import React, { useState } from 'react'
import '../styles/pages.css'

// Define types for our settings structure
type NotificationSettings = {
  email: boolean
  push: boolean
  sms: boolean
}

type PrivacySettings = {
  profileVisibility: string
  dataCollection: boolean
  analytics: boolean
}

type PreferenceSettings = {
  theme: string
  language: string
  autoplay: boolean
  fontSize: string
}

type AllSettings = {
  notifications: NotificationSettings
  privacy: PrivacySettings
  preferences: PreferenceSettings
}

export default function Settings() {
  // State for managing various settings
  const [settings, setSettings] = useState<AllSettings>({
    notifications: {
      email: true,
      push: false,
      sms: true
    },
    privacy: {
      profileVisibility: 'public',
      dataCollection: true,
      analytics: false
    },
    preferences: {
      theme: 'dark',
      language: 'english',
      autoplay: false,
      fontSize: 'medium'
    }
  })

  // Handle toggle switches - using proper typing
  const handleToggle = (section: keyof AllSettings, setting: string) => {
    setSettings(prev => {
      // Create a copy of the current settings
      const newSettings = { ...prev }
      
      // Handle each section specifically to maintain type safety
      if (section === 'notifications') {
        const key = setting as keyof NotificationSettings
        newSettings.notifications = {
          ...prev.notifications,
          [key]: !prev.notifications[key]
        }
      } else if (section === 'privacy') {
        const key = setting as keyof PrivacySettings
        if (typeof prev.privacy[key] === 'boolean') {
          newSettings.privacy = {
            ...prev.privacy,
            [key]: !prev.privacy[key]
          }
        }
      } else if (section === 'preferences') {
        const key = setting as keyof PreferenceSettings
        if (typeof prev.preferences[key] === 'boolean') {
          newSettings.preferences = {
            ...prev.preferences,
            [key]: !prev.preferences[key]
          }
        }
      }
      
      return newSettings
    })
  }

  // Handle dropdown/select changes - using proper typing
  const handleSelectChange = (section: keyof AllSettings, setting: string, value: string) => {
    setSettings(prev => {
      // Create a copy of the current settings
      const newSettings = { ...prev }
      
      // Handle each section specifically to maintain type safety
      if (section === 'privacy') {
        const key = setting as keyof PrivacySettings
        newSettings.privacy = {
          ...prev.privacy,
          [key]: value
        }
      } else if (section === 'preferences') {
        const key = setting as keyof PreferenceSettings
        newSettings.preferences = {
          ...prev.preferences,
          [key]: value
        }
      }
      
      return newSettings
    })
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your Vuka Unzwe experience</p>
      </div>

      <div className="settings-content">
        {/* Notification Settings */}
        <div className="settings-card">
          <h3 className="card-title"> Notifications</h3>
          <p className="card-description">Manage how you receive updates and alerts</p>
          
          <div className="setting-item">
            <div className="setting-info">
              <h4>Email Notifications</h4>
              <p>Receive news summaries and updates via email</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.email}
                  onChange={() => handleToggle('notifications', 'email')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Push Notifications</h4>
              <p>Get instant alerts for breaking news</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.push}
                  onChange={() => handleToggle('notifications', 'push')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>SMS Alerts</h4>
              <p>Receive critical news via text message</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.notifications.sms}
                  onChange={() => handleToggle('notifications', 'sms')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-card">
          <h3 className="card-title"> Privacy & Data</h3>
          <p className="card-description">Control your privacy and data preferences</p>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Profile Visibility</h4>
              <p>Who can see your profile information</p>
            </div>
            <div className="setting-control">
              <select 
                className="setting-select"
                value={settings.privacy.profileVisibility}
                onChange={(e) => handleSelectChange('privacy', 'profileVisibility', e.target.value)}
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Data Collection</h4>
              <p>Allow collection of usage data to improve experience</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.privacy.dataCollection}
                  onChange={() => handleToggle('privacy', 'dataCollection')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Analytics Tracking</h4>
              <p>Share anonymous usage analytics</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.privacy.analytics}
                  onChange={() => handleToggle('privacy', 'analytics')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance & Preferences */}
        <div className="settings-card">
          <h3 className="card-title"> Appearance & Preferences</h3>
          <p className="card-description">Customize how the app looks and behaves</p>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Theme</h4>
              <p>Choose your preferred color scheme</p>
            </div>
            <div className="setting-control">
              <select 
                className="setting-select"
                value={settings.preferences.theme}
                onChange={(e) => handleSelectChange('preferences', 'theme', e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Language</h4>
              <p>Select your preferred language</p>
            </div>
            <div className="setting-control">
              <select 
                className="setting-select"
                value={settings.preferences.language}
                onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
              >
                <option value="english">English</option>
                <option value="shona">Shona</option>
                <option value="ndebele">Ndebele</option>
              </select>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Font Size</h4>
              <p>Adjust text size for better readability</p>
            </div>
            <div className="setting-control">
              <select 
                className="setting-select"
                value={settings.preferences.fontSize}
                onChange={(e) => handleSelectChange('preferences', 'fontSize', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Auto-play Audio</h4>
              <p>Automatically play news narration</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.preferences.autoplay}
                  onChange={() => handleToggle('preferences', 'autoplay')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* News Categories */}
        <div className="settings-card">
          <h3 className="card-title"> News Categories</h3>
          <p className="card-description">Select the types of news you want to see</p>
          
          <div className="categories-grid">
            {['Politics', 'Sports', 'Technology', 'Health', 'Business', 'Entertainment', 'Weather', 'Crime'].map((category) => (
              <label key={category} className="category-checkbox">
                <input type="checkbox" defaultChecked />
                <span className="category-name">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="settings-actions">
          <button className="btn-primary">Save All Settings</button>
          <button className="btn-secondary">Reset to Defaults</button>
        </div>
      </div>
    </div>
  )
}