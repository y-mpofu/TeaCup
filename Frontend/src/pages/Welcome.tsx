// Frontend/src/pages/Welcome.tsx
// Welcome page with login and registration functionality

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';
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
}

export default function Welcome() {
  const navigate = useNavigate();
  
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
    lastName: ''
  });
  
  // State for UI management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  /**
   * Check if user is already logged in when component mounts
   * If they are, redirect them to the home page
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (authService.isLoggedIn()) {
        console.log('🔍 User already logged in, verifying with backend...');
        
        const authResult = await authService.verifyAuth();
        if (authResult.valid) {
          console.log('✅ User authentication verified, redirecting to home');
          navigate('/');
        } else {
          console.log('❌ Stored token is invalid, staying on welcome page');
        }
      }
    };
    
    checkAuthStatus();
  }, [navigate]);
  
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
      console.log('🔐 Attempting login...');
      
      // Call the authentication service
      const result = await authService.login(loginForm.username, loginForm.password);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting to home page');
        navigate('/');
      } else {
        // Show the error message from the backend
        setErrors({ general: result.error.message });
      }
    } catch (error) {
      console.error('💥 Unexpected login error:', error);
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
      console.log('📝 Attempting registration...');
      
      // Prepare registration data
      const registrationData: RegisterRequest = {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        first_name: registerForm.firstName,
        last_name: registerForm.lastName
      };
      
      // Call the authentication service
      const result = await authService.register(registrationData);
      
      if (result.success) {
        console.log('✅ Registration successful');
        
        // Show success message and switch to login mode
        alert('Registration successful! You can now log in with your credentials.');
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
          lastName: ''
        });
      } else {
        // Show the error message from the backend
        setErrors({ general: result.error.message });
      }
    } catch (error) {
      console.error('💥 Unexpected registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Switch between login and registration modes
   */
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({}); // Clear any existing errors
    setShowPassword(false);
    setShowConfirmPassword(false);
  };
  
  /**
   * Handle input changes for login form
   */
  const handleLoginInputChange = (field: keyof LoginForm, value: string) => {
    setLoginForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  /**
   * Handle input changes for registration form
   */
  const handleRegisterInputChange = (field: keyof RegisterForm, value: string) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="welcome-container">
      {/* Background with TeaCup branding */}
      <div className="welcome-background">
        <div className="Logo">
          <img
            src="./TeaCup_Logo.png"
            className="section-icon"
            width={350}
            height={350}
          />
        </div>
        <div className="brand-info">
          <h1 className="brand-title">TeaCup</h1>
          <p className="brand-subtitle">Your Daily Dose of News</p>
        </div>
      </div>
      
      {/* Main form section */}
      <div className="form-section">
        <div className="form-container">
          {/* Form header */}
          <div className="form-header">
            <h2 className="form-title">
              {isLoginMode ? 'Welcome Back' : 'Join TeaCup'}
            </h2>
            <p className="form-subtitle">
              {isLoginMode 
                ? 'Sign in to continue reading the latest news' 
                : 'Create your account to get started'
              }
            </p>
          </div>
          
          {/* Error message display */}
          {errors.general && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <span>{errors.general}</span>
            </div>
          )}
          
          {/* Login Form */}
          {isLoginMode ? (
            <form onSubmit={handleLogin} className="auth-form">
              {/* Username/Email field */}
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username or Email
                </label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => handleLoginInputChange('username', e.target.value)}
                    placeholder="Enter your username or email"
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <span className="error-text">{errors.username}</span>
                )}
              </div>
              
              {/* Password field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => handleLoginInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>
              
              {/* Login button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="auth-form">
              {/* Name fields row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={registerForm.firstName}
                    onChange={(e) => handleRegisterInputChange('firstName', e.target.value)}
                    placeholder="First name"
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <span className="error-text">{errors.firstName}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={registerForm.lastName}
                    onChange={(e) => handleRegisterInputChange('lastName', e.target.value)}
                    placeholder="Last name"
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <span className="error-text">{errors.lastName}</span>
                  )}
                </div>
              </div>
              
              {/* Username field */}
              <div className="form-group">
                <label htmlFor="regUsername" className="form-label">
                  Username
                </label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    id="regUsername"
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => handleRegisterInputChange('username', e.target.value)}
                    placeholder="Choose a username"
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.username && (
                  <span className="error-text">{errors.username}</span>
                )}
              </div>
              
              {/* Email field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-wrapper">
                  <Mail size={20} className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>
              
              {/* Password field */}
              <div className="form-group">
                <label htmlFor="regPassword" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    id="regPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>
              
              {/* Confirm password field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerForm.confirmPassword}
                    onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>
              
              {/* Register button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Create Account
                  </>
                )}
              </button>
            </form>
          )}
          
          {/* Mode toggle */}
          <div className="form-footer">
            <p>
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={toggleMode}
                className="toggle-button"
                disabled={isLoading}
              >
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}