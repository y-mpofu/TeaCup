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
// Settings page connected with authentication backend

import React, { useState, useEffect } from 'react'
import { User, Save, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { authService, type User as AuthUser } from '../services/authService'
import '../styles/pages.css'
import '../styles/enhanced-settings.css'

// Define types for our settings structure (same as before but with better organization)
type NotificationSettings = {
  email: boolean
  push: boolean
  sms: boolean
}

type PrivacySettings = {
  profile_visibility: string  // Changed to match backend format
  data_collection: boolean
  analytics: boolean
}

type PreferenceSettings = {
  theme: string
  language: string
  autoplay: boolean
  font_size: string  // Changed to match backend format
}

type AllSettings = {
  notifications: NotificationSettings
  privacy: PrivacySettings
  preferences: PreferenceSettings
}

// Define the component props to receive current user information
interface SettingsProps {
  currentUser: AuthUser | null
}

export default function Settings({ currentUser }: SettingsProps) {
  // State for managing various settings
  const [settings, setSettings] = useState<AllSettings>({
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    privacy: {
      profile_visibility: 'public',
      data_collection: true,
      analytics: false
    },
    preferences: {
      theme: 'dark',
      language: 'english',
      autoplay: false,
      font_size: 'medium'
    }
  })
  
  // State for UI management
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  /**
   * Load user settings from the backend when component mounts
   */
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!currentUser) {
        console.log('⚠️ No current user, using default settings');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('📥 Loading settings for user:', currentUser.username);
        setIsLoading(true);
        
        // Fetch settings from backend
        const result = await authService.getUserSettings(currentUser.id);
        
        if (result.success) {
          console.log('✅ Settings loaded successfully');
          setSettings(result.settings);
        } else {
          console.error('❌ Failed to load settings:', result.error.message);
          setErrorMessage(`Failed to load settings: ${result.error.message}`);
        }
      } catch (error) {
        console.error('💥 Error loading settings:', error);
        setErrorMessage('Failed to load settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserSettings();
  }, [currentUser]);
  
  /**
   * Save settings to the backend
   */
  const saveSettings = async () => {
    if (!currentUser) {
      setErrorMessage('You must be logged in to save settings');
      return;
    }
    
    try {
      console.log('💾 Saving settings for user:', currentUser.username);
      setIsSaving(true);
      setSaveStatus('idle');
      setErrorMessage('');
      
      // Save settings to backend
      const result = await authService.updateUserSettings(currentUser.id, settings);
      
      if (result.success) {
        console.log('✅ Settings saved successfully');
        setSaveStatus('success');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } else {
        console.error('❌ Failed to save settings:', result.error.message);
        setErrorMessage(`Failed to save settings: ${result.error.message}`);
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('💥 Error saving settings:', error);
      setErrorMessage('Failed to save settings. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

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
    
    // Clear any previous save status when settings change
    setSaveStatus('idle');
  }

  // Handle dropdown/select changes - using proper typing
  const handleSelectChange = (section: keyof AllSettings, setting: string, value: string) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      
      if (section === 'privacy') {
        const key = setting as keyof PrivacySettings
        if (typeof prev.privacy[key] === 'string') {
          newSettings.privacy = {
            ...prev.privacy,
            [key]: value
          }
        }
      } else if (section === 'preferences') {
        const key = setting as keyof PreferenceSettings
        if (typeof prev.preferences[key] === 'string') {
          newSettings.preferences = {
            ...prev.preferences,
            [key]: value
          }
        }
      }
      
      return newSettings
    })
    
    // Clear any previous save status when settings change
    setSaveStatus('idle');
  }

  // Show loading screen while fetching settings
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
      {/* Page header with user information */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <User size={24} />
          </div>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">
              Manage your TeaCup preferences, {currentUser.first_name}
            </p>
          </div>
        </div>
        
        {/* Save button in header */}
        <button 
          onClick={saveSettings}
          disabled={isSaving}
          className={`save-button ${saveStatus === 'success' ? 'success' : saveStatus === 'error' ? 'error' : ''}`}
        >
          {isSaving ? (
            <Loader size={16} className="button-spinner" />
          ) : saveStatus === 'success' ? (
            <CheckCircle size={16} />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Error message display */}
      {errorMessage && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings sections */}
      <div className="settings-grid">
        {/* Notifications Section */}
        <div className="settings-card">
          <div className="card-header">
            <h2 className="card-title">Notifications</h2>
            <p className="card-subtitle">Choose how you want to be notified</p>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Email Notifications</span>
                <span className="setting-description">Receive news updates via email</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={() => handleToggle('notifications', 'email')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Push Notifications</span>
                <span className="setting-description">Get notified about breaking news</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={() => handleToggle('notifications', 'push')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">SMS Notifications</span>
                <span className="setting-description">Receive important alerts via text</span>
              </div>
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

        {/* Privacy Section */}
        <div className="settings-card">
          <div className="card-header">
            <h2 className="card-title">Privacy</h2>
            <p className="card-subtitle">Control your privacy and data settings</p>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Profile Visibility</span>
                <span className="setting-description">Who can see your profile</span>
              </div>
              <select
                value={settings.privacy.profile_visibility}
                onChange={(e) => handleSelectChange('privacy', 'profile_visibility', e.target.value)}
                className="setting-select"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Data Collection</span>
                <span className="setting-description">Allow data collection for personalization</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.privacy.data_collection}
                  onChange={() => handleToggle('privacy', 'data_collection')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Analytics</span>
                <span className="setting-description">Help improve TeaCup with usage analytics</span>
              </div>
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

        {/* Preferences Section */}
        <div className="settings-card">
          <div className="card-header">
            <h2 className="card-title">Preferences</h2>
            <p className="card-subtitle">Customize your TeaCup experience</p>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Theme</span>
                <span className="setting-description">Choose your preferred color scheme</span>
              </div>
              <select
                value={settings.preferences.theme}
                onChange={(e) => handleSelectChange('preferences', 'theme', e.target.value)}
                className="setting-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Language</span>
                <span className="setting-description">Select your preferred language</span>
              </div>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleSelectChange('preferences', 'language', e.target.value)}
                className="setting-select"
              >
                <option value="english">English</option>
                <option value="spanish">Español</option>
                <option value="french">Français</option>
                <option value="german">Deutsch</option>
              </select>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Autoplay Videos</span>
                <span className="setting-description">Automatically play video content</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.preferences.autoplay}
                  onChange={() => handleToggle('preferences', 'autoplay')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Font Size</span>
                <span className="setting-description">Adjust text size for better readability</span>
              </div>
              <select
                value={settings.preferences.font_size}
                onChange={(e) => handleSelectChange('preferences', 'font_size', e.target.value)}
                className="setting-select"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with save reminder */}
      <div className="settings-footer">
        <p className="footer-text">
          Don't forget to save your changes! Your settings will be automatically synced across all your devices.
        </p>
      </div>
    </div>
  )
}