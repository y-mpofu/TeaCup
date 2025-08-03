
// Frontend/src/pages/Account.tsx  
// Fixed Account component interface

import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Smartphone, Monitor } from 'lucide-react';
import type { User as AuthUser } from '../services/authService';
import '../styles/pages.css';

// Define the component props interface
interface AccountProps {
  currentUser: AuthUser | null;  // Real user data from App.tsx
}

/**
 * Account component for account settings and security
 * Now properly typed to receive currentUser prop
 */
export default function Account({ currentUser }: AccountProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password update logic
    console.log('Password update requested');
  };

  // Show loading state if no user data
  if (!currentUser) {
    return (
      <div className="account-loading">
        <div className="loading-spinner"></div>
        <p>Loading account...</p>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="page-header">
        <h1>Account Settings</h1>
        <p>Manage your account security and preferences</p>
      </div>

      <div className="settings-container">
        {/* Account Information Card */}
        <div className="settings-card">
          <h3 className="card-title">
            <User size={20} />
            Account Information
          </h3>
          
          <div className="account-info">
            <div className="info-item">
              <label>Full Name</label>
              <span>{currentUser.first_name} {currentUser.last_name}</span>
            </div>
            <div className="info-item">
              <label>Username</label>
              <span>@{currentUser.username}</span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>{currentUser.email}</span>
            </div>
            <div className="info-item">
              <label>User ID</label>
              <span className="user-id">{currentUser.id}</span>
            </div>
          </div>
        </div>

        {/* Password Security Card */}
        <div className="settings-card">
          <h3 className="card-title">
            <Lock size={20} />
            Password Security
          </h3>
          
          <form onSubmit={handlePasswordUpdate} className="password-form">
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

            <div className="form-row">
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
                <label htmlFor="confirmPassword">Confirm Password</label>
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
      </div>
    </div>
  );
}