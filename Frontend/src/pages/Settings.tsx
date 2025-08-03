
// Frontend/src/pages/Settings.tsx
// Fixed Settings component interface

import React, { useState } from 'react';
import { Globe, Bell, Moon, Volume2, Shield } from 'lucide-react';
import { getCountryName, getCountryFlag } from '../services/authService';
import type { User as AuthUser } from '../services/authService';
import '../styles/pages.css';

// Define the component props interface
interface SettingsProps {
  currentUser: AuthUser | null;  // Real user data from App.tsx
}

/**
 * Settings component for user preferences
 * Now properly typed to receive currentUser prop
 */
export default function Settings({ currentUser }: SettingsProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoPlay: false,
    emailUpdates: true
  });

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Show loading state if no user data
  if (!currentUser) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Customize your TeaCup experience</p>
      </div>

      <div className="settings-container">
        {/* Country Preference */}
        <div className="settings-card">
          <h3 className="card-title">
            <Globe size={20} />
            Location & News
          </h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <h4>Country Preference</h4>
              <p>Your selected country for personalized news</p>
            </div>
            <div className="setting-value">
              <span className="country-display">
                {getCountryFlag(currentUser.country_of_interest)} {getCountryName(currentUser.country_of_interest)}
              </span>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-card">
          <h3 className="card-title">
            <Bell size={20} />
            Notifications
          </h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <h4>Push Notifications</h4>
              <p>Get notified about breaking news</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.notifications}
                  onChange={() => handleSettingChange('notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Email Updates</h4>
              <p>Receive daily news summaries via email</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.emailUpdates}
                  onChange={() => handleSettingChange('emailUpdates')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}