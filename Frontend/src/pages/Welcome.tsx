// // Frontend/src/pages/Welcome.tsx
// // Welcome page with login and registration functionality

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';
// import { authService, type RegisterRequest } from '../services/authService';
// import '../styles/Welcome.css';

// // Define the component's internal state types
// interface FormErrors {
//   username?: string;
//   email?: string;
//   password?: string;
//   confirmPassword?: string;
//   firstName?: string;
//   lastName?: string;
//   general?: string;
// }

// interface LoginForm {
//   username: string;
//   password: string;
// }

// interface RegisterForm {
//   username: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   firstName: string;
//   lastName: string;
// }

// export default function Welcome() {
//   const navigate = useNavigate();
  
//   // State for switching between login and registration modes
//   const [isLoginMode, setIsLoginMode] = useState(true);
  
//   // State for form data
//   const [loginForm, setLoginForm] = useState<LoginForm>({
//     username: '',
//     password: ''
//   });
  
//   const [registerForm, setRegisterForm] = useState<RegisterForm>({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     firstName: '',
//     lastName: ''
//   });
  
//   // State for UI management
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<FormErrors>({});
  
//   /**
//    * Check if user is already logged in when component mounts
//    * If they are, redirect them to the home page
//    */
//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       if (authService.isLoggedIn()) {
//         console.log('🔍 User already logged in, verifying with backend...');
        
//         const authResult = await authService.verifyAuth();
//         if (authResult.valid) {
//           console.log('✅ User authentication verified, redirecting to home');
//           navigate('/');
//         } else {
//           console.log('❌ Stored token is invalid, staying on welcome page');
//         }
//       }
//     };
    
//     checkAuthStatus();
//   }, [navigate]);
  
//   /**
//    * Validate login form data
//    */
//   const validateLoginForm = (): boolean => {
//     const newErrors: FormErrors = {};
    
//     // Check username/email
//     if (!loginForm.username.trim()) {
//       newErrors.username = 'Username or email is required';
//     }
    
//     // Check password
//     if (!loginForm.password) {
//       newErrors.password = 'Password is required';
//     } else if (loginForm.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
  
//   /**
//    * Validate registration form data
//    */
//   const validateRegisterForm = (): boolean => {
//     const newErrors: FormErrors = {};
    
//     // Check username
//     if (!registerForm.username.trim()) {
//       newErrors.username = 'Username is required';
//     } else if (registerForm.username.length < 3) {
//       newErrors.username = 'Username must be at least 3 characters';
//     } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
//       newErrors.username = 'Username can only contain letters, numbers, and underscores';
//     }
    
//     // Check email
//     if (!registerForm.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }
    
//     // Check first name
//     if (!registerForm.firstName.trim()) {
//       newErrors.firstName = 'First name is required';
//     }
    
//     // Check last name
//     if (!registerForm.lastName.trim()) {
//       newErrors.lastName = 'Last name is required';
//     }
    
//     // Check password
//     if (!registerForm.password) {
//       newErrors.password = 'Password is required';
//     } else if (registerForm.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.password)) {
//       newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
//     }
    
//     // Check password confirmation
//     if (!registerForm.confirmPassword) {
//       newErrors.confirmPassword = 'Please confirm your password';
//     } else if (registerForm.password !== registerForm.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
  
//   /**
//    * Handle login form submission
//    */
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Clear previous errors
//     setErrors({});
    
//     // Validate form
//     if (!validateLoginForm()) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       console.log('🔐 Attempting login...');
      
//       // Call the authentication service
//       const result = await authService.login(loginForm.username, loginForm.password);
      
//       if (result.success) {
//         console.log('✅ Login successful, redirecting to home page');
//         navigate('/');
//       } else {
//         // Show the error message from the backend
//         setErrors({ general: result.error.message });
//       }
//     } catch (error) {
//       console.error('💥 Unexpected login error:', error);
//       setErrors({ general: 'An unexpected error occurred. Please try again.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   /**
//    * Handle registration form submission
//    */
//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Clear previous errors
//     setErrors({});
    
//     // Validate form
//     if (!validateRegisterForm()) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       console.log('📝 Attempting registration...');
      
//       // Prepare registration data
//       const registrationData: RegisterRequest = {
//         username: registerForm.username,
//         email: registerForm.email,
//         password: registerForm.password,
//         first_name: registerForm.firstName,
//         last_name: registerForm.lastName
//       };
      
//       // Call the authentication service
//       const result = await authService.register(registrationData);
      
//       if (result.success) {
//         console.log('✅ Registration successful');
        
//         // Show success message and switch to login mode
//         alert('Registration successful! You can now log in with your credentials.');
//         setIsLoginMode(true);
        
//         // Pre-fill login form with the registered username
//         setLoginForm({
//           username: registerForm.username,
//           password: ''
//         });
        
//         // Clear registration form
//         setRegisterForm({
//           username: '',
//           email: '',
//           password: '',
//           confirmPassword: '',
//           firstName: '',
//           lastName: ''
//         });
//       } else {
//         // Show the error message from the backend
//         setErrors({ general: result.error.message });
//       }
//     } catch (error) {
//       console.error('💥 Unexpected registration error:', error);
//       setErrors({ general: 'An unexpected error occurred. Please try again.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   /**
//    * Switch between login and registration modes
//    */
//   const toggleMode = () => {
//     setIsLoginMode(!isLoginMode);
//     setErrors({}); // Clear any existing errors
//     setShowPassword(false);
//     setShowConfirmPassword(false);
//   };
  
//   /**
//    * Handle input changes for login form
//    */
//   const handleLoginInputChange = (field: keyof LoginForm, value: string) => {
//     setLoginForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
    
//     // Clear field-specific error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: undefined
//       }));
//     }
//   };
  
//   /**
//    * Handle input changes for registration form
//    */
//   const handleRegisterInputChange = (field: keyof RegisterForm, value: string) => {
//     setRegisterForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
    
//     // Clear field-specific error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: undefined
//       }));
//     }
//   };

//   return (
//     <div className="welcome-container">
//       {/* Background with TeaCup branding */}
//       <div className="welcome-background">
//         <div className="logo-block">
//         <div className="logo-title-row">
//             <img
//             src="./TeaCup_Logo.png"
//             className="section-icon"
//             width={200}
//             height={200}
//             />
//             <h1 className="brand-title">TeaCup</h1>
//         </div>
        
//         <p className="brand-subtitle">
//             News that finds you. Bringing verified, real-time stories to your doorstep
//         </p>
//         </div>
//       </div>
      
//       {/* Main form section */}
//       <div className="form-section">
//         <div className="form-container">
//           {/* Form header */}
//           <div className="form-header">
//             <h2 className="form-title">
//               {isLoginMode ? 'Welcome Back' : 'Join TeaCup'}
//             </h2>
//             <p className="form-subtitle">
//               {isLoginMode 
//                 ? 'Sign in to continue reading the latest news' 
//                 : 'Create your account to get started'
//               }
//             </p>
//           </div>
          
//           {/* Error message display */}
//           {errors.general && (
//             <div className="error-banner">
//               <AlertCircle size={20} />
//               <span>{errors.general}</span>
//             </div>
//           )}
          
//           {/* Login Form */}
//           {isLoginMode ? (
//             <form onSubmit={handleLogin} className="auth-form">
//               {/* Username/Email field */}
//               <div className="form-group">
//                 <label htmlFor="username" className="form-label">
//                   Username or Email
//                 </label>
//                 <div className="input-wrapper">
//                   <User size={20} className="input-icon" />
//                   <input
//                     id="username"
//                     type="text"
//                     value={loginForm.username}
//                     onChange={(e) => handleLoginInputChange('username', e.target.value)}
//                     placeholder="Enter your username or email"
//                     className={`form-input ${errors.username ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                 </div>
//                 {errors.username && (
//                   <span className="error-text">{errors.username}</span>
//                 )}
//               </div>
              
//               {/* Password field */}
//               <div className="form-group">
//                 <label htmlFor="password" className="form-label">
//                   Password
//                 </label>
//                 <div className="input-wrapper">
//                   <Lock size={20} className="input-icon" />
//                   <input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     value={loginForm.password}
//                     onChange={(e) => handleLoginInputChange('password', e.target.value)}
//                     placeholder="Enter your password"
//                     className={`form-input ${errors.password ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="password-toggle"
//                     disabled={isLoading}
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <span className="error-text">{errors.password}</span>
//                 )}
//               </div>
              
//               {/* Login button */}
//               <button
//                 type="submit"
//                 className="submit-button"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <span className="loading-spinner"></span>
//                 ) : (
//                   <>
//                     <LogIn size={20} />
//                     Sign In
//                   </>
//                 )}
//               </button>
//             </form>
//           ) : (
//             /* Registration Form */
//             <form onSubmit={handleRegister} className="auth-form">
//               {/* Name fields row */}
//               <div className="form-row">
//                 <div className="form-group">
//                   <label htmlFor="firstName" className="form-label">
//                     First Name
//                   </label>
//                   <input
//                     id="firstName"
//                     type="text"
//                     value={registerForm.firstName}
//                     onChange={(e) => handleRegisterInputChange('firstName', e.target.value)}
//                     placeholder="First name"
//                     className={`form-input ${errors.firstName ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   {errors.firstName && (
//                     <span className="error-text">{errors.firstName}</span>
//                   )}
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="lastName" className="form-label">
//                     Last Name
//                   </label>
//                   <input
//                     id="lastName"
//                     type="text"
//                     value={registerForm.lastName}
//                     onChange={(e) => handleRegisterInputChange('lastName', e.target.value)}
//                     placeholder="Last name"
//                     className={`form-input ${errors.lastName ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   {errors.lastName && (
//                     <span className="error-text">{errors.lastName}</span>
//                   )}
//                 </div>
//               </div>
              
//               {/* Username field */}
//               <div className="form-group">
//                 <label htmlFor="regUsername" className="form-label">
//                   Username
//                 </label>
//                 <div className="input-wrapper">
//                   <User size={20} className="input-icon" />
//                   <input
//                     id="regUsername"
//                     type="text"
//                     value={registerForm.username}
//                     onChange={(e) => handleRegisterInputChange('username', e.target.value)}
//                     placeholder="Choose a username"
//                     className={`form-input ${errors.username ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                 </div>
//                 {errors.username && (
//                   <span className="error-text">{errors.username}</span>
//                 )}
//               </div>
              
//               {/* Email field */}
//               <div className="form-group">
//                 <label htmlFor="email" className="form-label">
//                   Email
//                 </label>
//                 <div className="input-wrapper">
//                   <Mail size={20} className="input-icon" />
//                   <input
//                     id="email"
//                     type="email"
//                     value={registerForm.email}
//                     onChange={(e) => handleRegisterInputChange('email', e.target.value)}
//                     placeholder="Enter your email"
//                     className={`form-input ${errors.email ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                 </div>
//                 {errors.email && (
//                   <span className="error-text">{errors.email}</span>
//                 )}
//               </div>
              
//               {/* Password field */}
//               <div className="form-group">
//                 <label htmlFor="regPassword" className="form-label">
//                   Password
//                 </label>
//                 <div className="input-wrapper">
//                   <Lock size={20} className="input-icon" />
//                   <input
//                     id="regPassword"
//                     type={showPassword ? 'text' : 'password'}
//                     value={registerForm.password}
//                     onChange={(e) => handleRegisterInputChange('password', e.target.value)}
//                     placeholder="Create a password"
//                     className={`form-input ${errors.password ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="password-toggle"
//                     disabled={isLoading}
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <span className="error-text">{errors.password}</span>
//                 )}
//               </div>
              
//               {/* Confirm password field */}
//               <div className="form-group">
//                 <label htmlFor="confirmPassword" className="form-label">
//                   Confirm Password
//                 </label>
//                 <div className="input-wrapper">
//                   <Lock size={20} className="input-icon" />
//                   <input
//                     id="confirmPassword"
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     value={registerForm.confirmPassword}
//                     onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
//                     placeholder="Confirm your password"
//                     className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="password-toggle"
//                     disabled={isLoading}
//                   >
//                     {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && (
//                   <span className="error-text">{errors.confirmPassword}</span>
//                 )}
//               </div>
              
//               {/* Register button */}
//               <button
//                 type="submit"
//                 className="submit-button"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <span className="loading-spinner"></span>
//                 ) : (
//                   <>
//                     <UserPlus size={20} />
//                     Create Account
//                   </>
//                 )}
//               </button>
//             </form>
//           )}
          
//           {/* Mode toggle */}
//           <div className="form-footer">
//             <p>
//               {isLoginMode ? "Don't have an account? " : "Already have an account? "}
//               <button
//                 type="button"
//                 onClick={toggleMode}
//                 className="toggle-button"
//                 disabled={isLoading}
//               >
//                 {isLoginMode ? 'Sign up' : 'Sign in'}
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







// // Frontend/src/pages/Welcome.tsx
// // Updated Welcome page with country of interest support and component integration

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, AlertCircle, Globe } from 'lucide-react';
// import { authService, COUNTRIES, getCountryFlag, type RegisterRequest } from '../services/authService';
// import '../styles/Welcome.css';

// // Define the component's internal state types
// interface FormErrors {
//   username?: string;
//   email?: string;
//   password?: string;
//   confirmPassword?: string;
//   firstName?: string;
//   lastName?: string;
//   country_of_interest?: string;  // NEW: Country field error
//   general?: string;
// }

// interface LoginForm {
//   username: string;
//   password: string;
// }

// interface RegisterForm {
//   username: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   firstName: string;
//   lastName: string;
//   country_of_interest: string;  // NEW: Country field
// }

// export default function Welcome() {
//   const navigate = useNavigate();
  
//   // State for switching between login and registration modes
//   const [isLoginMode, setIsLoginMode] = useState(true);
  
//   // State for form data
//   const [loginForm, setLoginForm] = useState<LoginForm>({
//     username: '',
//     password: ''
//   });
  
//   const [registerForm, setRegisterForm] = useState<RegisterForm>({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     firstName: '',
//     lastName: '',
//     country_of_interest: 'ZW'  // NEW: Default to Zimbabwe
//   });
  
//   // State for UI management
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<FormErrors>({});
  
//   /**
//    * Check if user is already logged in when component mounts
//    */
//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       if (authService.isLoggedIn()) {
//         console.log('🔍 User already logged in, verifying with backend...');
        
//         const authResult = await authService.verifyAuth();
//         if (authResult.valid) {
//           console.log('✅ User authentication verified, redirecting to home');
//           navigate('/');
//         } else {
//           console.log('❌ Stored token is invalid, staying on welcome page');
//         }
//       }
//     };
    
//     checkAuthStatus();
//   }, [navigate]);
  
//   /**
//    * Validate login form data
//    */
//   const validateLoginForm = (): boolean => {
//     const newErrors: FormErrors = {};
    
//     // Check username/email
//     if (!loginForm.username.trim()) {
//       newErrors.username = 'Username or email is required';
//     }
    
//     // Check password
//     if (!loginForm.password) {
//       newErrors.password = 'Password is required';
//     } else if (loginForm.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
  
//   /**
//    * Validate registration form data - UPDATED with country validation
//    */
//   const validateRegisterForm = (): boolean => {
//     const newErrors: FormErrors = {};
    
//     // Check username
//     if (!registerForm.username.trim()) {
//       newErrors.username = 'Username is required';
//     } else if (registerForm.username.length < 3) {
//       newErrors.username = 'Username must be at least 3 characters';
//     } else if (!/^[a-zA-Z0-9_]+$/.test(registerForm.username)) {
//       newErrors.username = 'Username can only contain letters, numbers, and underscores';
//     }
    
//     // Check email
//     if (!registerForm.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }
    
//     // Check first name
//     if (!registerForm.firstName.trim()) {
//       newErrors.firstName = 'First name is required';
//     }
    
//     // Check last name
//     if (!registerForm.lastName.trim()) {
//       newErrors.lastName = 'Last name is required';
//     }
    
//     // NEW: Check country of interest
//     if (!registerForm.country_of_interest) {
//       newErrors.country_of_interest = 'Please select a country of interest';
//     }
    
//     // Check password
//     if (!registerForm.password) {
//       newErrors.password = 'Password is required';
//     } else if (registerForm.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.password)) {
//       newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
//     }
    
//     // Check password confirmation
//     if (!registerForm.confirmPassword) {
//       newErrors.confirmPassword = 'Please confirm your password';
//     } else if (registerForm.password !== registerForm.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };
  
//   /**
//    * Handle login form submission
//    */
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Clear previous errors
//     setErrors({});
    
//     // Validate form
//     if (!validateLoginForm()) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       console.log('🔐 Attempting login...');
      
//       // Call the authentication service
//       const result = await authService.login(loginForm.username, loginForm.password);
      
//       if (result.success) {
//         console.log('✅ Login successful, redirecting to home page');
//         navigate('/');
//       } else {
//         // Show the error message from the backend
//         setErrors({ general: result.error.message });
//       }
//     } catch (error) {
//       console.error('💥 Unexpected login error:', error);
//       setErrors({ general: 'An unexpected error occurred. Please try again.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   /**
//    * Handle registration form submission - UPDATED with country support
//    */
//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Clear previous errors
//     setErrors({});
    
//     // Validate form
//     if (!validateRegisterForm()) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       console.log('📝 Attempting registration with country:', registerForm.country_of_interest);
      
//       // Prepare registration data with country
//       const registrationData: RegisterRequest = {
//         username: registerForm.username,
//         email: registerForm.email,
//         password: registerForm.password,
//         first_name: registerForm.firstName,
//         last_name: registerForm.lastName,
//         country_of_interest: registerForm.country_of_interest  // NEW: Include country
//       };
      
//       // Call the authentication service
//       const result = await authService.register(registrationData);
      
//       if (result.success) {
//         console.log('✅ Registration successful');
        
//         // Show success message and switch to login mode
//         alert('Registration successful! You can now log in with your credentials.');
//         setIsLoginMode(true);
        
//         // Pre-fill login form with the registered username
//         setLoginForm({
//           username: registerForm.username,
//           password: ''
//         });
        
//         // Clear registration form
//         setRegisterForm({
//           username: '',
//           email: '',
//           password: '',
//           confirmPassword: '',
//           firstName: '',
//           lastName: '',
//           country_of_interest: 'ZW'  // Reset to default
//         });
//       } else {
//         // Show the error message from the backend
//         setErrors({ general: result.error.message });
//       }
//     } catch (error) {
//       console.error('💥 Unexpected registration error:', error);
//       setErrors({ general: 'An unexpected error occurred. Please try again.' });
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   /**
//    * Switch between login and registration modes
//    */
//   const toggleMode = () => {
//     setIsLoginMode(!isLoginMode);
//     setErrors({}); // Clear any existing errors
//     setShowPassword(false);
//     setShowConfirmPassword(false);
//   };
  
//   /**
//    * Handle input changes for login form
//    */
//   const handleLoginInputChange = (field: keyof LoginForm, value: string) => {
//     setLoginForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
    
//     // Clear field-specific error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: undefined
//       }));
//     }
//   };
  
//   /**
//    * Handle input changes for registration form - UPDATED with country support
//    */
//   const handleRegisterInputChange = (field: keyof RegisterForm, value: string) => {
//     setRegisterForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
    
//     // Clear field-specific error when user starts typing
//     if (errors[field]) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: undefined
//       }));
//     }
//   };

//   return (
//     <div className="welcome-container">
//       {/* Background with TeaCup branding - Using your logo-block CSS */}
//       <div className="welcome-background">
//         <div className="logo-block">
//           <div className="logo-title-row">
//             <img
//               src="./TeaCup_Logo.png"
//               className="section-icon"
//               width={200}
//               height={200}
//             />
//             <h1 className="brand-title">TeaCup</h1>
//           </div>
          
//           <p className="brand-subtitle">
//             News that finds you. Bringing verified, real-time stories to your doorstep
//           </p>
//         </div>
//       </div>
      
//       {/* Main form section */}
//       <div className="form-section">
//         <div className="form-container">
//           {/* Form header */}
//           <div className="form-header">
//             <h2 className="form-title">
//               {isLoginMode ? 'Welcome Back' : 'Join TeaCup'}
//             </h2>
//             <p className="form-subtitle">
//               {isLoginMode 
//                 ? 'Sign in to continue reading the latest news' 
//                 : 'Create your account and select your country of interest'
//               }
//             </p>
//           </div>
          
//           {/* Error message display */}
//           {errors.general && (
//             <div className="error-banner">
//               <AlertCircle size={20} />
//               <span>{errors.general}</span>
//             </div>
//           )}
          
//           {/* Login Form */}
//           {isLoginMode ? (
//             <form onSubmit={handleLogin} className="auth-form">
//               {/* Username/Email field */}
//               <div className="form-group">
//                 <label htmlFor="username" className="form-label">
//                   Username or Email
//                 </label>
//                 <div className="input-wrapper">
//                   <User size={20} className="input-icon" />
//                   <input
//                     id="username"
//                     type="text"
//                     value={loginForm.username}
//                     onChange={(e) => handleLoginInputChange('username', e.target.value)}
//                     placeholder="Enter your username or email"
//                     className={`form-input ${errors.username ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                 </div>
//                 {errors.username && (
//                   <span className="error-text">{errors.username}</span>
//                 )}
//               </div>
              
//               {/* Password field */}
//               <div className="form-group">
//                 <label htmlFor="password" className="form-label">
//                   Password
//                 </label>
//                 <div className="input-wrapper">
//                   <Lock size={20} className="input-icon" />
//                   <input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     value={loginForm.password}
//                     onChange={(e) => handleLoginInputChange('password', e.target.value)}
//                     placeholder="Enter your password"
//                     className={`form-input ${errors.password ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="password-toggle"
//                     disabled={isLoading}
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <span className="error-text">{errors.password}</span>
//                 )}
//               </div>
              
//               {/* Login button */}
//               <button
//                 type="submit"
//                 className="submit-button"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <span className="loading-spinner"></span>
//                 ) : (
//                   <>
//                     <LogIn size={20} />
//                     Sign In
//                   </>
//                 )}
//               </button>
//             </form>
//           ) : (
//             /* Registration Form - UPDATED with country field */
//             <form onSubmit={handleRegister} className="auth-form">
//               {/* Name fields row */}
//               <div className="form-row">
//                 <div className="form-group">
//                   <label htmlFor="firstName" className="form-label">
//                     First Name
//                   </label>
//                   <input
//                     id="firstName"
//                     type="text"
//                     value={registerForm.firstName}
//                     onChange={(e) => handleRegisterInputChange('firstName', e.target.value)}
//                     placeholder="First name"
//                     className={`form-input ${errors.firstName ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   {errors.firstName && (
//                     <span className="error-text">{errors.firstName}</span>
//                   )}
//                 </div>
                
//                 <div className="form-group">
//                   <label htmlFor="lastName" className="form-label">
//                     Last Name
//                   </label>
//                   <input
//                     id="lastName"
//                     type="text"
//                     value={registerForm.lastName}
//                     onChange={(e) => handleRegisterInputChange('lastName', e.target.value)}
//                     placeholder="Last name"
//                     className={`form-input ${errors.lastName ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   {errors.lastName && (
//                     <span className="error-text">{errors.lastName}</span>
//                   )}
//                 </div>
//               </div>
              
//               {/* Username field */}
//               <div className="form-group">
//                 <label htmlFor="regUsername" className="form-label">
//                   Username
//                 </label>
//                 <div className="input-wrapper">
//                   <User size={20} className="input-icon" />
//                   <input
//                     id="regUsername"
//                     type="text"
//                     value={registerForm.username}
//                     onChange={(e) => handleRegisterInputChange('username', e.target.value)}
//                     placeholder="Choose a username"
//                     className={`form-input ${errors.username ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                 </div>
//                 {errors.username && (
//                   <span className="error-text">{errors.username}</span>
//                 )}
//               </div>
              
//               {/* Email field */}
//               <div className="form-group">
//                 <label htmlFor="email" className="form-label">
//                   Email
//                 </label>
//                 <div className="input-wrapper">
//                   <Mail size={20} className="input-icon" />
//                   <input
//                     id="email"
//                     type="email"
//                     value={registerForm.email}
//                     onChange={(e) => handleRegisterInputChange('email', e.target.value)}
//                     placeholder="Enter your email"
//                     className={`form-input ${errors.email ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                 </div>
//                 {errors.email && (
//                   <span className="error-text">{errors.email}</span>
//                 )}
//               </div>

//               {/* NEW: Country of Interest field */}
//               <div className="form-group">
//                 <label htmlFor="country_of_interest" className="form-label">
//                   Country of Interest
//                 </label>
//                 <div className="input-wrapper">
//                   <Globe size={20} className="input-icon" />
//                   <select
//                     id="country_of_interest"
//                     value={registerForm.country_of_interest}
//                     onChange={(e) => handleRegisterInputChange('country_of_interest', e.target.value)}
//                     className={`form-input ${errors.country_of_interest ? 'error' : ''}`}
//                     disabled={isLoading}
//                     style={{ 
//                       paddingLeft: '3rem',  // Space for icon
//                       cursor: 'pointer',
//                       appearance: 'none',
//                       backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
//                       backgroundPosition: 'right 0.5rem center',
//                       backgroundRepeat: 'no-repeat',
//                       backgroundSize: '1.5em 1.5em'
//                     }}
//                   >
//                     <option value="">Select your country of interest</option>
//                     {COUNTRIES.map(country => (
//                       <option key={country.code} value={country.code}>
//                         {country.flag} {country.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <p style={{ 
//                   color: '#999', 
//                   fontSize: '0.8rem', 
//                   margin: '0.5rem 0 0 0',
//                   lineHeight: 1.4
//                 }}>
//                   Choose the country you'd like to receive news from. This helps us personalize your news feed.
//                 </p>
//                 {errors.country_of_interest && (
//                   <span className="error-text">{errors.country_of_interest}</span>
//                 )}
//               </div>
              
//               {/* Password field */}
//               <div className="form-group">
//                 <label htmlFor="regPassword" className="form-label">
//                   Password
//                 </label>
//                 <div className="input-wrapper">
//                   <Lock size={20} className="input-icon" />
//                   <input
//                     id="regPassword"
//                     type={showPassword ? 'text' : 'password'}
//                     value={registerForm.password}
//                     onChange={(e) => handleRegisterInputChange('password', e.target.value)}
//                     placeholder="Create a password"
//                     className={`form-input ${errors.password ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="password-toggle"
//                     disabled={isLoading}
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <span className="error-text">{errors.password}</span>
//                 )}
//               </div>
              
//               {/* Confirm password field */}
//               <div className="form-group">
//                 <label htmlFor="confirmPassword" className="form-label">
//                   Confirm Password
//                 </label>
//                 <div className="input-wrapper">
//                   <Lock size={20} className="input-icon" />
//                   <input
//                     id="confirmPassword"
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     value={registerForm.confirmPassword}
//                     onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
//                     placeholder="Confirm your password"
//                     className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
//                     disabled={isLoading}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="password-toggle"
//                     disabled={isLoading}
//                   >
//                     {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && (
//                   <span className="error-text">{errors.confirmPassword}</span>
//                 )}
//               </div>
              
//               {/* Register button */}
//               <button
//                 type="submit"
//                 className="submit-button"
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <span className="loading-spinner"></span>
//                 ) : (
//                   <>
//                     <UserPlus size={20} />
//                     Create Account
//                   </>
//                 )}
//               </button>
//             </form>
//           )}
          
//           {/* Mode toggle */}
//           <div className="form-footer">
//             <p>
//               {isLoginMode ? "Don't have an account? " : "Already have an account? "}
//               <button
//                 type="button"
//                 onClick={toggleMode}
//                 className="toggle-button"
//                 disabled={isLoading}
//               >
//                 {isLoginMode ? 'Sign up' : 'Sign in'}
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// Frontend/src/pages/Welcome.tsx
// FIXED Welcome page - redirects authenticated users to /home instead of staying on welcome
// This is now the DEFAULT page users see when visiting the site

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, AlertCircle, Globe } from 'lucide-react'
import { authService, COUNTRIES, getCountryFlag, type RegisterRequest } from '../services/authService'
import '../styles/Welcome.css'

// Define form error types
interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  country_of_interest?: string
  general?: string
}

// Define form data types
interface LoginForm {
  username: string
  password: string
}

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  country_of_interest: string
}

export default function Welcome() {
  const navigate = useNavigate()
  
  // State for switching between login and registration modes
  const [isLoginMode, setIsLoginMode] = useState(true)
  
  // State for form data
  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: '',
    password: ''
  })
  
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country_of_interest: 'ZW'  // Default to Zimbabwe but user can change
  })
  
  // State for UI management
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  /**
   * Check if user is already logged in when component mounts
   * FIXED: Redirects to /home (not just /) after successful authentication
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Welcome: Checking if user is already authenticated...')
        
        if (authService.isLoggedIn()) {
          console.log('🔑 Welcome: Token found, verifying with backend...')
          
          // Verify the stored token is still valid
          const authResult = await authService.verifyAuth()
          
          if (authResult.valid) {
            console.log('✅ Welcome: User already authenticated, redirecting to home page')
            // FIXED: Redirect to /home instead of / 
            navigate('/home', { replace: true })
          } else {
            console.log('❌ Welcome: Stored token is invalid, staying on welcome page')
            // Clear invalid token
            await authService.logout()
          }
        } else {
          console.log('🔓 Welcome: No authentication token found, showing welcome page')
        }
      } catch (error) {
        console.error('💥 Welcome: Error checking auth status:', error)
      }
    }
    
    checkAuthStatus()
  }, [navigate])
  
  /**
   * Validate login form data
   */
  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Check username/email field
    if (!loginForm.username.trim()) {
      newErrors.username = 'Username or email is required'
    }
    
    // Check password field
    if (!loginForm.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  /**
   * Validate registration form data
   */
  const validateRegisterForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Check all required fields
    if (!registerForm.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!registerForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!registerForm.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!registerForm.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (!registerForm.password) {
      newErrors.password = 'Password is required'
    }
    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    }
    if (!registerForm.country_of_interest) {
      newErrors.country_of_interest = 'Please select a country'
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (registerForm.email && !emailRegex.test(registerForm.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password strength validation
    if (registerForm.password && registerForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Password confirmation validation
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Username length validation
    if (registerForm.username && registerForm.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  /**
   * Handle login form submission
   * FIXED: Redirects to /home after successful login
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateLoginForm()) {
      return
    }

    setIsLoading(true)
    setErrors({}) // Clear any previous errors
    
    try {
      console.log('🔑 Welcome: Attempting login for:', loginForm.username)
      
      // Call authentication service to login
      const result = await authService.login(loginForm.username, loginForm.password)
      
      if (result.success) {
        console.log('✅ Welcome: Login successful for user:', result.user.username)
        console.log('📊 Welcome: User data from database:', {
          id: result.user.id,
          name: `${result.user.first_name} ${result.user.last_name}`,
          email: result.user.email,
          country: result.user.country_of_interest
        })
        
        // FIXED: Redirect to /home after successful login
        navigate('/home', { replace: true })
      } else {
        console.error('❌ Welcome: Login failed:', result.error.message)
        setErrors({ general: result.error.message })
      }
    } catch (error) {
      console.error('💥 Welcome: Unexpected login error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Handle registration form submission
   * FIXED: Switches to login mode after successful registration
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateRegisterForm()) {
      return
    }

    setIsLoading(true)
    setErrors({}) // Clear any previous errors
    
    try {
      console.log('📝 Welcome: Attempting registration for:', registerForm.username)
      
      // Prepare registration data
      const registrationData: RegisterRequest = {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        first_name: registerForm.firstName,
        last_name: registerForm.lastName,
        country_of_interest: registerForm.country_of_interest
      }
      
      // Call authentication service to register new user
      const result = await authService.register(registrationData)
      
      if (result.success) {
        console.log('✅ Welcome: Registration successful for:', registerForm.username)
        
        // Show success message and switch to login mode
        setIsLoginMode(true)
        
        // Pre-fill login form with the registered username for convenience
        setLoginForm({
          username: registerForm.username,
          password: ''
        })
        
        // Clear registration form
        setRegisterForm({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          country_of_interest: 'ZW' // Reset to default
        })
        
        // Show success message (you could add a toast notification here)
        console.log('🎉 Welcome: Registration complete, switched to login mode')
      } else {
        console.error('❌ Welcome: Registration failed:', result.error.message)
        setErrors({ general: result.error.message })
      }
    } catch (error) {
      console.error('💥 Welcome: Unexpected registration error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }
  
  /**
   * Switch between login and registration modes
   */
  const toggleMode = () => {
    console.log('🔄 Welcome: Switching mode from', isLoginMode ? 'login' : 'register', 'to', isLoginMode ? 'register' : 'login')
    setIsLoginMode(!isLoginMode)
    setErrors({}) // Clear any existing errors
    setShowPassword(false)
    setShowConfirmPassword(false)
  }
  
  /**
   * Handle input changes for login form
   */
  const handleLoginInputChange = (field: keyof LoginForm, value: string) => {
    setLoginForm(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }
  
  /**
   * Handle input changes for registration form
   */
  const handleRegisterInputChange = (field: keyof RegisterForm, value: string) => {
    setRegisterForm(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  return (
    <div className="welcome-container">
      {/* Background with TeaCup branding */}
      <div className="welcome-background">
        <div className="logo-block">
          <div className="logo-title-row">
            <img
              src="./TeaCup_Logo.png"
              className="section-icon"
              width={200}
              height={200}
              alt="TeaCup Logo"
            />
            <h1 className="brand-title">TeaCup</h1>
          </div>
          
          <p className="brand-subtitle">
            News that finds you. Bringing verified, real-time stories to your doorstep.
          </p>
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
                ? 'Sign in to your account to continue reading' 
                : 'Create your account to get started'
              }
            </p>
          </div>

          {/* Display general errors */}
          {errors.general && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Login Form */}
          {isLoginMode ? (
            <form onSubmit={handleLogin} className="auth-form">
              {/* Username/Email field */}
              <div className="form-group">
                <label htmlFor="login-username">Username or Email</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    id="login-username"
                    value={loginForm.username}
                    onChange={(e) => handleLoginInputChange('username', e.target.value)}
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                  />
                </div>
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              {/* Password field */}
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    value={loginForm.password}
                    onChange={(e) => handleLoginInputChange('password', e.target.value)}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              {/* Login button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
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
              {/* Name fields row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="register-firstName">First Name</label>
                  <input
                    type="text"
                    id="register-firstName"
                    value={registerForm.firstName}
                    onChange={(e) => handleRegisterInputChange('firstName', e.target.value)}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="register-lastName">Last Name</label>
                  <input
                    type="text"
                    id="register-lastName"
                    value={registerForm.lastName}
                    onChange={(e) => handleRegisterInputChange('lastName', e.target.value)}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                  {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                </div>
              </div>

              {/* Username field */}
              <div className="form-group">
                <label htmlFor="register-username">Username</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    id="register-username"
                    value={registerForm.username}
                    onChange={(e) => handleRegisterInputChange('username', e.target.value)}
                    className={`form-input ${errors.username ? 'error' : ''}`}
                    placeholder="Choose a username"
                    autoComplete="username"
                  />
                </div>
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              {/* Email field */}
              <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="register-email"
                    value={registerForm.email}
                    onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {/* Country selection */}
              <div className="form-group">
                <label htmlFor="register-country">Country of Interest</label>
                <div className="input-with-icon">
                  <Globe className="input-icon" size={18} />
                  <select
                    id="register-country"
                    value={registerForm.country_of_interest}
                    onChange={(e) => handleRegisterInputChange('country_of_interest', e.target.value)}
                    className={`form-input ${errors.country_of_interest ? 'error' : ''}`}
                  >
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.country_of_interest && <span className="field-error">{errors.country_of_interest}</span>}
              </div>

              {/* Password fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="register-password">Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="register-password"
                      value={registerForm.password}
                      onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Create password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="register-confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="register-confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                      className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>
              </div>

              {/* Register button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
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

          {/* Mode toggle */}
          <div className="form-footer">
            <p>
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="mode-toggle"
                onClick={toggleMode}
                disabled={isLoading}
              >
                {isLoginMode ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}