// Frontend/src/pages/Welcome.tsx
// Enhanced Welcome page that works with the new authentication gate in App.tsx
// No longer needs to check existing auth since App.tsx handles all routing logic

import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, AlertCircle, Globe } from 'lucide-react';
import { authService, type RegisterRequest } from '../services/authService';
import '../styles/Welcome.css';

// Define the component's internal state types
interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  general?: string;
}

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  country: string;
}

// Country options for registration
const COUNTRY_OPTIONS = [
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
  // { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  // { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  // { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  // { code: 'CD', name: 'Democratic Republic of Congo', flag: '🇨🇩' },
  // { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  // { code: 'BI', name: 'Burundi', flag: '🇧🇮' }
];

export default function Welcome() {
  // State for switching between login and registration modes
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // State for form data
  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country: '' // User must select their country
  });
  
  // State for UI management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  /**
   * Validate login form data
   */
  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Check username/email
    if (!loginForm.username.trim()) {
      newErrors.username = 'Username or email is required';
    }
    
    // Check password
    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Validate registration form data
   */
  const validateRegisterForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Check username
    if (!registerForm.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (registerForm.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Check email
    if (!registerForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Check first name
    if (!registerForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    // Check last name
    if (!registerForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Check country selection
    if (!registerForm.country) {
      newErrors.country = 'Please select your country';
    }
    
    // Check password
    if (!registerForm.password) {
      newErrors.password = 'Password is required';
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Check password confirmation
    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Handle login form submission
   * On success, App.tsx will automatically detect the login and redirect
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateLoginForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(' Welcome: Attempting login...');
      
      // Call the authentication service
      const result = await authService.login(loginForm.username, loginForm.password);
      
      if (result.success) {
        console.log(' Welcome: Login successful - App.tsx will handle redirect');
        // App.tsx will detect the authentication change and redirect automatically
        // We trigger a page reload to ensure App.tsx re-runs its auth check
        window.location.href = '/';
      } else {
        // Show the error message from the backend
        setErrors({ general: result.error.message });
      }
    } catch (error) {
      console.error(' Welcome: Unexpected login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle registration form submission
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateRegisterForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(' Welcome: Attempting registration...');
      
      // Prepare registration data with country preference
      const registrationData: RegisterRequest & { country_of_interest: string } = {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        first_name: registerForm.firstName,
        last_name: registerForm.lastName,
        country_of_interest: registerForm.country // Include country selection
      };
      
      // Call the authentication service
      const result = await authService.register(registrationData);
      
      if (result.success) {
        console.log(' Welcome: Registration successful');
        
        // Show success message and switch to login mode
        alert(`Registration successful! Welcome to TeaCup. You can now log in with your credentials.`);
        setIsLoginMode(true);
        
        // Pre-fill login form with the registered username
        setLoginForm({
          username: registerForm.username,
          password: ''
        });
        
        // Clear registration form
        setRegisterForm({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          country: ''
        });
      } else {
        // Show the error message from the backend
        setErrors({ general: result.error.message });
      }
    } catch (error) {
      console.error(' Welcome: Unexpected registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle input changes for login form
   */
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  /**
   * Handle input changes for registration form
   */
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="welcome-container">
      {/* Background decoration */}
      <div className="welcome-bg">
        <div className="teacup-pattern"></div>
      </div>

      {/* Main content */}
      <div className="welcome-content">
        {/* Header */}
        <div className="welcome-header">
          <div className="logo">
            <image className="logo-icon">
                <img src="/TeaCup_Logo.png" alt="TeaCup Logo"
                width={200} height={200}
                />
            </image>
          </div>
          <span className='logo-text'>TeaCup</span>
          <p>News that finds you. Bringing verified, real-time stories to your doorstep.</p>
        </div>

        {/* Authentication Form */}
        <div className="auth-card">
          {/* Mode Toggle */}
          <div className="auth-toggle">
            <button
              type="button"
              className={`toggle-btn ${isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(true);
                setErrors({});
              }}
            >
              <LogIn size={18} />
              Sign In
            </button>
            <button
              type="button"
              className={`toggle-btn ${!isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(false);
                setErrors({});
              }}
            >
              <UserPlus size={18} />
              Create Account
            </button>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="error-banner">
              <AlertCircle size={18} />
              {errors.general}
            </div>
          )}

          {/* Login Form */}
          {isLoginMode ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username or Email</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    placeholder="Enter your username or email"
                    disabled={isLoading}
                  />
                </div>
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="auth-form">
              {/* Name Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={registerForm.firstName}
                      onChange={handleRegisterChange}
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                      placeholder="First name"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={registerForm.lastName}
                      onChange={handleRegisterChange}
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                      placeholder="Last name"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>
              </div>

              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="regUsername">Username</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="regUsername"
                    name="username"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    placeholder="Choose a username"
                    disabled={isLoading}
                  />
                </div>
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Country Selection */}
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <div className="input-wrapper">
                  <Globe size={18} className="input-icon" />
                  <select
                    id="country"
                    name="country"
                    value={registerForm.country}
                    onChange={handleRegisterChange}
                    className={`form-input form-select ${errors.country ? 'error' : ''}`}
                    disabled={isLoading}
                  >
                    <option value="">Select your country</option>
                    {COUNTRY_OPTIONS.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.country && <span className="error-text">{errors.country}</span>}
                <div className="field-hint">
                  This helps us provide relevant local news for your region
                </div>
              </div>

              {/* Password Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="regPassword">Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="regPassword"
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Create password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Account
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="welcome-footer">
          <p>Serving news from across Africa</p>
          <p>Stay informed with TeaCup's personalized news experience</p>
        </div>
      </div>
    </div>
  );
}