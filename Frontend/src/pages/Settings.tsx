// import React, { useState } from 'react'
// import '../styles/pages.css'

// // Define types for our settings structure
// type NotificationSettings = {
//   email: boolean
//   push: boolean
//   sms: boolean
// }

// type PrivacySettings = {
//   profileVisibility: string
//   dataCollection: boolean
//   analytics: boolean
// }

// type PreferenceSettings = {
//   theme: string
//   language: string
//   autoplay: boolean
//   fontSize: string
// }

// type AllSettings = {
//   notifications: NotificationSettings
//   privacy: PrivacySettings
//   preferences: PreferenceSettings
// }

// export default function Settings() {
//   // State for managing various settings
//   const [settings, setSettings] = useState<AllSettings>({
//     notifications: {
//       email: true,
//       push: false,
//       sms: true
//     },
//     privacy: {
//       profileVisibility: 'public',
//       dataCollection: true,
//       analytics: false
//     },
//     preferences: {
//       theme: 'dark',
//       language: 'english',
//       autoplay: false,
//       fontSize: 'medium'
//     }
//   })

//   // Handle toggle switches - using proper typing
//   const handleToggle = (section: keyof AllSettings, setting: string) => {
//     setSettings(prev => {
//       // Create a copy of the current settings
//       const newSettings = { ...prev }
      
//       // Handle each section specifically to maintain type safety
//       if (section === 'notifications') {
//         const key = setting as keyof NotificationSettings
//         newSettings.notifications = {
//           ...prev.notifications,
//           [key]: !prev.notifications[key]
//         }
//       } else if (section === 'privacy') {
//         const key = setting as keyof PrivacySettings
//         if (typeof prev.privacy[key] === 'boolean') {
//           newSettings.privacy = {
//             ...prev.privacy,
//             [key]: !prev.privacy[key]
//           }
//         }
//       } else if (section === 'preferences') {
//         const key = setting as keyof PreferenceSettings
//         if (typeof prev.preferences[key] === 'boolean') {
//           newSettings.preferences = {
//             ...prev.preferences,
//             [key]: !prev.preferences[key]
//           }
//         }
//       }
      
//       return newSettings
//     })
//   }

//   // Handle dropdown/select changes - using proper typing
//   const handleSelectChange = (section: keyof AllSettings, setting: string, value: string) => {
//     setSettings(prev => {
//       // Create a copy of the current settings
//       const newSettings = { ...prev }
      
//       // Handle each section specifically to maintain type safety
//       if (section === 'privacy') {
//         const key = setting as keyof PrivacySettings
//         newSettings.privacy = {
//           ...prev.privacy,
//           [key]: value
//         }
//       } else if (section === 'preferences') {
//         const key = setting as keyof PreferenceSettings
//         newSettings.preferences = {
//           ...prev.preferences,
//           [key]: value
//         }
//       }
      
//       return newSettings
//     })
//   }

//   return (
//     <div className="page-container">
//       {/* Page header */}
//       <div className="page-header">
//         <h1 className="page-title">Settings</h1>
//         <p className="page-subtitle">Customize your Vuka Unzwe experience</p>
//       </div>

//       <div className="settings-content">
//         {/* Notification Settings */}
//         <div className="settings-card">
//           <h3 className="card-title"> Notifications</h3>
//           <p className="card-description">Manage how you receive updates and alerts</p>
          
//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>Email Notifications</h4>
//               <p>Receive news summaries and updates via email</p>
//             </div>
//             <div className="setting-control">
//               <label className="toggle-switch">
//                 <input 
//                   type="checkbox" 
//                   checked={settings.notifications.email}
//                   onChange={() => handleToggle('notifications', 'email')}
//                 />
//                 <span className="toggle-slider"></span>
//               </label>
//             </div>
//           </div>

//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>Push Notifications</h4>
//               <p>Get instant alerts for breaking news</p>
//             </div>
//             <div className="setting-control">
//               <label className="toggle-switch">
//                 <input 
//                   type="checkbox" 
//                   checked={settings.notifications.push}
//                   onChange={() => handleToggle('notifications', 'push')}
//                 />
//                 <span className="toggle-slider"></span>
//               </label>
//             </div>
//           </div>

//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>SMS Alerts</h4>
//               <p>Receive critical news via text message</p>
//             </div>
//             <div className="setting-control">
//               <label className="toggle-switch">
//                 <input 
//                   type="checkbox" 
//                   checked={settings.notifications.sms}
//                   onChange={() => handleToggle('notifications', 'sms')}
//                 />
//                 <span className="toggle-slider"></span>
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Privacy Settings */}
//         <div className="settings-card">
//           <h3 className="card-title"> Privacy & Data</h3>
//           <p className="card-description">Control your privacy and data preferences</p>

//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>Profile Visibility</h4>
//               <p>Who can see your profile information</p>
//             </div>
//             <div className="setting-control">
//               <select 
//                 className="setting-select"
//                 value={settings.privacy.profileVisibility}
//                 onChange={(e) => handleSelectChange('privacy', 'profileVisibility', e.target.value)}
//               >
//                 <option value="public">Public</option>
//                 <option value="friends">Friends Only</option>
//                 <option value="private">Private</option>
//               </select>
//             </div>
//           </div>

//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>Data Collection</h4>
//               <p>Allow collection of usage data to improve experience</p>
//             </div>
//             <div className="setting-control">
//               <label className="toggle-switch">
//                 <input 
//                   type="checkbox" 
//                   checked={settings.privacy.dataCollection}
//                   onChange={() => handleToggle('privacy', 'dataCollection')}
//                 />
//                 <span className="toggle-slider"></span>
//               </label>
//             </div>
//           </div>

//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>Analytics Tracking</h4>
//               <p>Share anonymous usage analytics</p>
//             </div>
//             <div className="setting-control">
//               <label className="toggle-switch">
//                 <input 
//                   type="checkbox" 
//                   checked={settings.privacy.analytics}
//                   onChange={() => handleToggle('privacy', 'analytics')}
//                 />
//                 <span className="toggle-slider"></span>
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Appearance & Preferences */}
//         <div className="settings-card">
//           <h3 className="card-title"> Appearance & Preferences</h3>
//           <p className="card-description">Customize how the app looks and behaves</p>

//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>Theme</h4>
//               <p>Choose your preferred color scheme</p>
//             </div>
//             <div className="setting-control">
//               <select 
//                 className="setting-select"
//                 value={settings.preferences.theme}
//                 onChange={(e) => handleSelectChange('preferences', 'theme', e.target.value)}
//               >
//                 <option value="dark">Dark</option>
//                 <option value="light">Light</option>
//                 <option value="auto">Auto</option>
//               </select>
//             </div>
//           </div>

//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>Language</h4>
//               <p>Select your preferred language</p>
//             </div>
//             <div className="setting-control">
//               <select 
//                 className="setting-select"
//                 value={settings.preferences.language}
//                 onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
//               >
//                 <option value="english">English</option>
//                 <option value="shona">Shona</option>
//                 <option value="ndebele">Ndebele</option>
//               </select>
//             </div>
//           </div>

//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>Font Size</h4>
//               <p>Adjust text size for better readability</p>
//             </div>
//             <div className="setting-control">
//               <select 
//                 className="setting-select"
//                 value={settings.preferences.fontSize}
//                 onChange={(e) => handleSelectChange('preferences', 'fontSize', e.target.value)}
//               >
//                 <option value="small">Small</option>
//                 <option value="medium">Medium</option>
//                 <option value="large">Large</option>
//                 <option value="extra-large">Extra Large</option>
//               </select>
//             </div>
//           </div>

//           <div className="setting-item">
//             <div className="setting-info">
//               <h4>Auto-play Audio</h4>
//               <p>Automatically play news narration</p>
//             </div>
//             <div className="setting-control">
//               <label className="toggle-switch">
//                 <input 
//                   type="checkbox" 
//                   checked={settings.preferences.autoplay}
//                   onChange={() => handleToggle('preferences', 'autoplay')}
//                 />
//                 <span className="toggle-slider"></span>
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* News Categories */}
//         <div className="settings-card">
//           <h3 className="card-title"> News Categories</h3>
//           <p className="card-description">Select the types of news you want to see</p>
          
//           <div className="categories-grid">
//             {['Politics', 'Sports', 'Technology', 'Health', 'Business', 'Entertainment', 'Weather', 'Crime'].map((category) => (
//               <label key={category} className="category-checkbox">
//                 <input type="checkbox" defaultChecked />
//                 <span className="category-name">{category}</span>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* Save Settings Button */}
//         <div className="settings-actions">
//           <button className="btn-primary">Save All Settings</button>
//           <button className="btn-secondary">Reset to Defaults</button>
//         </div>
//       </div>
//     </div>
//   )
// }


// Frontend/src/pages/Settings.tsx
// Updated Settings page with country of interest management
// Frontend/src/pages/Settings.tsx
// Simplified Settings page with just country and notifications - using CSS classes only






import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader, Globe, Bell } from 'lucide-react'
import { authService, COUNTRIES, getCountryName, getCountryFlag, type User as AuthUser } from '../services/authService'
import '../styles/pages.css'
import '../styles/enhanced-settings.css'

// Simplified notifications structure
type NotificationSettings = {
  email: boolean
  push: boolean
  sms: boolean
}

interface SettingsProps {
  currentUser: AuthUser | null
}

export default function Settings({ currentUser }: SettingsProps) {
  // State for managing notifications
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: false,
    sms: false
  })
  
  // State for UI management
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isCountryChanging, setIsCountryChanging] = useState(false)
  
  /**
   * Load user settings when component mounts
   */
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    console.log('📥 Loading settings for user:', currentUser.username);
    // For now, use default notification settings
    setIsLoading(false);
  }, [currentUser]);
  
  /**
   * Handle country of interest change
   */
  const handleCountryChange = async (newCountryCode: string) => {
    if (!currentUser || newCountryCode === currentUser.country_of_interest) {
      return;
    }
    
    try {
      console.log('🌍 Updating country of interest to:', newCountryCode);
      setIsCountryChanging(true);
      setErrorMessage('');
      
      const result = await authService.updateCountryOfInterest(newCountryCode);
      
      if (result.success) {
        console.log('✅ Country updated successfully');
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        console.error('❌ Country update failed:', result.error.message);
        setErrorMessage(`Failed to update country: ${result.error.message}`);
      }
    } catch (error) {
      console.error('💥 Error updating country:', error);
      setErrorMessage('Failed to update country. Please try again.');
    } finally {
      setIsCountryChanging(false);
    }
  };

  // Handle notification toggles
  const handleNotificationToggle = (setting: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Show success briefly when toggling
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <Loader className="loading-spinner" size={40} />
          <p>Loading your settings...</p>
        </div>
      </div>
    )
  }

  // Show message if user is not logged in
  if (!currentUser) {
    return (
      <div className="page-container">
        <div className="error-container">
          <AlertCircle size={48} />
          <h1>Authentication Required</h1>
          <p>Please log in to access your settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <h1 className="settings-title">Settings</h1>
        <p className="page-subtitle">
          Manage your preferences, {currentUser.first_name}
        </p>
      </div>

      {/* Error message display */}
      {errorMessage && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success message */}
      {saveStatus === 'success' && (
        <div className="success-banner">
          <CheckCircle size={20} />
          <span>Settings updated successfully!</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="settings-card">
        
        {/* Country of Interest Section */}
        <div className="card-header">
          <h2 className="settings-card-title">
            <Globe size={24} />
            Country & Notifications
          </h2>
          <p className="card-subtitle">
            Choose your country of interest and notification preferences
          </p>
        </div>
        
        <div className="settings-list">
          {/* Country Selection */}
          <div className="setting-item">
            <div className="setting-info">
              <span className="settings-label">
                Country of Interest</span>
              <span className="setting-description">
                Currently: {getCountryFlag(currentUser.country_of_interest)} {getCountryName(currentUser.country_of_interest)}
              </span>
            </div>
            
            <div>
              {isCountryChanging && (
                <div className="country-changing">
                  <Loader size={16} className="button-spinner" />
                  <span>Updating...</span>
                </div>
              )}
              <select
                value={currentUser.country_of_interest}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="setting-select"
                disabled={isCountryChanging}
              >
                {COUNTRIES.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="setting-item">
            <div className="setting-info">
              <span className="settings-label">Email Notifications</span>
              <span className="setting-description">Receive news updates via email</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => handleNotificationToggle('email')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {/* Push Notifications */}
          <div className="setting-item">
            <div className="setting-info">
              <span className="settings-label">Push Notifications</span>
              <span className="setting-description">Get notified about breaking news instantly</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={() => handleNotificationToggle('push')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {/* SMS Notifications */}
          <div className="setting-item">
            <div className="setting-info">
              <span className="settings-label">SMS Notifications</span>
              <span className="setting-description">Receive important alerts via text message</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={() => handleNotificationToggle('sms')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}