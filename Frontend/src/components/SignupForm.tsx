// Frontend/src/components/SignupForm.tsx
// Signup form component with country of interest selection

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, User, Mail, Lock, Globe } from 'lucide-react'
import { authService, COUNTRIES, getCountryFlag, type RegisterRequest } from '../services/authService'
import '../styles/pages.css'

interface SignupFormProps {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export default function SignupForm({ onSuccess, onError }: SignupFormProps) {
  // Form state
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    country_of_interest: 'ZW' // Default to Zimbabwe
  })

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmPassword, setConfirmPassword] = useState('')

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value)
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    }
    if (!formData.country_of_interest) {
      newErrors.country_of_interest = 'Please select a country'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Password confirmation
    if (confirmPassword && formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Username validation
    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      console.log('📝 Submitting signup form:', {
        ...formData,
        password: '[HIDDEN]'
      })

      const result = await authService.register(formData)
      
      if (result.success) {
        console.log('✅ Signup successful!')
        onSuccess?.(result.message)
      } else {
        console.error('❌ Signup failed:', result.error.message)
        onError?.(result.error.message)
      }
    } catch (error) {
      console.error('❌ Signup error:', error)
      onError?.('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Create Your Account</h1>
        <p className="page-subtitle">Join TeaCup to get personalized news</p>
      </div>

      <div className="account-content">
        <div className="settings-card">
          <form onSubmit={handleSubmit} className="settings-form">
            {/* Personal Information Section */}
            <div className="form-section">
              <h4 className="section-title">Personal Information</h4>
              
              {/* Name fields row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`form-input ${errors.first_name ? 'error' : ''}`}
                    placeholder="Enter your first name"
                    disabled={isLoading}
                  />
                  {errors.first_name && (
                    <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                      {errors.first_name}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`form-input ${errors.last_name ? 'error' : ''}`}
                    placeholder="Enter your last name"
                    disabled={isLoading}
                  />
                  {errors.last_name && (
                    <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                      {errors.last_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  placeholder="Choose a unique username"
                  disabled={isLoading}
                />
                {errors.username && (
                  <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                    {errors.username}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
                {errors.email && (
                  <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                    {errors.email}
                  </span>
                )}
              </div>
            </div>

            {/* News Preferences Section */}
            <div className="form-section">
              <h4 className="section-title">News Preferences</h4>
              
              {/* Country of Interest - NEW FIELD */}
              <div className="form-group">
                <label htmlFor="country_of_interest">
                  <Globe size={16} style={{ marginRight: '8px' }} />
                  Country of Interest
                </label>
                <select
                  id="country_of_interest"
                  name="country_of_interest"
                  value={formData.country_of_interest}
                  onChange={handleInputChange}
                  className={`form-input ${errors.country_of_interest ? 'error' : ''}`}
                  disabled={isLoading}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
                <p style={{ 
                  color: '#888', 
                  fontSize: '0.85rem', 
                  margin: '0.5rem 0 0 0' 
                }}>
                  Choose the country you'd like to receive news from. This helps us personalize your news feed.
                </p>
                {errors.country_of_interest && (
                  <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                    {errors.country_of_interest}
                  </span>
                )}
              </div>
            </div>

            {/* Security Section */}
            <div className="form-section">
              <h4 className="section-title">Security</h4>
              
              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Create a secure password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isLoading}
                style={{ 
                  width: '100%', 
                  maxWidth: '300px',
                  opacity: isLoading ? 0.7 : 1 
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <p style={{ color: '#888', textAlign: 'center', margin: 0 }}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: '#667eea', 
                    textDecoration: 'none' 
                  }}
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}