// // Frontend/src/services/authService.ts
// // Authentication service for communicating with the backend

// // Interface definitions for type safety
// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   profile_picture?: string;
//   created_at: string;
//   last_login: string;
//   is_active: boolean;
// }

// export interface LoginRequest {
//   username: string; // Can be username or email
//   password: string;
// }

// export interface RegisterRequest {
//   username: string;
//   email: string;
//   password: string;
//   first_name: string;
//   last_name: string;
// }

// export interface LoginResponse {
//   success: boolean;
//   message: string;
//   user: User;
//   access_token: string;
//   token_type: string;
// }

// export interface AuthError {
//   message: string;
//   status: number;
// }

// /**
//  * Authentication Service Class
//  * Handles all authentication-related API calls and token management
//  */
// export class AuthService {
//   private baseUrl: string;
//   private tokenKey: string = 'teacup_auth_token';
//   private userKey: string = 'teacup_user_info';

//   constructor() {
//     // Backend authentication API URL
//     this.baseUrl = "http://localhost:8000/api/auth";
//   }

//   /**
//    * Store authentication token in localStorage
//    * Note: In production, consider using httpOnly cookies for better security
//    */
//   private setToken(token: string): void {
//     localStorage.setItem(this.tokenKey, token);
//   }

//   /**
//    * Get authentication token from localStorage
//    */
//   private getToken(): string | null {
//     return localStorage.getItem(this.tokenKey);
//   }

//   /**
//    * Remove authentication token from localStorage
//    */
//   private removeToken(): void {
//     localStorage.removeItem(this.tokenKey);
//     localStorage.removeItem(this.userKey);
//   }

//   /**
//    * Store user information in localStorage
//    */
//   private setUser(user: User): void {
//     localStorage.setItem(this.userKey, JSON.stringify(user));
//   }

//   /**
//    * Get user information from localStorage
//    */
//   public getCurrentUser(): User | null {
//     const userStr = localStorage.getItem(this.userKey);
//     if (userStr) {
//       try {
//         return JSON.parse(userStr);
//       } catch (e) {
//         console.error('Error parsing user data:', e);
//         this.removeToken(); // Clear corrupted data
//       }
//     }
//     return null;
//   }

//   /**
//    * Check if user is currently logged in (has valid token)
//    */
//   public isLoggedIn(): boolean {
//     const token = this.getToken();
//     const user = this.getCurrentUser();
//     return !!(token && user);
//   }

//   /**
//    * Create authorization headers for API requests
//    */
//   private getAuthHeaders(): HeadersInit {
//     const token = this.getToken();
//     const headers: HeadersInit = {
//       'Content-Type': 'application/json',
//     };
    
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }
    
//     return headers;
//   }

//   /**
//    * Handle API errors consistently
//    */
//   private async handleApiError(response: Response): Promise<AuthError> {
//     let errorMessage = 'An error occurred';
    
//     try {
//       const errorData = await response.json();
//       errorMessage = errorData.detail || errorData.message || errorMessage;
//     } catch (e) {
//       // If response isn't JSON, use status text
//       errorMessage = response.statusText || errorMessage;
//     }
    
//     return {
//       message: errorMessage,
//       status: response.status
//     };
//   }

//   /**
//    * Login user with username/email and password
//    */
//   async login(username: string, password: string): Promise<{ success: true; user: User } | { success: false; error: AuthError }> {
//     try {
//       console.log('🔐 Attempting login for:', username);
      
//       const response = await fetch(`${this.baseUrl}/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           username: username,
//           password: password
//         })
//       });

//       if (response.ok) {
//         const data: LoginResponse = await response.json();
        
//         // Store token and user information
//         this.setToken(data.access_token);
//         this.setUser(data.user);
        
//         console.log('✅ Login successful for:', username);
        
//         return {
//           success: true,
//           user: data.user
//         };
//       } else {
//         const error = await this.handleApiError(response);
//         console.error('❌ Login failed:', error.message);
        
//         return {
//           success: false,
//           error: error
//         };
//       }
//     } catch (e) {
//       console.error('💥 Login request failed:', e);
      
//       return {
//         success: false,
//         error: {
//           message: 'Network error - please check your connection',
//           status: 0
//         }
//       };
//     }
//   }

//   /**
//    * Register new user account
//    */
//   async register(userData: RegisterRequest): Promise<{ success: true; message: string } | { success: false; error: AuthError }> {
//     try {
//       console.log('📝 Attempting registration for:', userData.username);
      
//       const response = await fetch(`${this.baseUrl}/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData)
//       });

//       if (response.ok) {
//         const data = await response.json();
        
//         console.log('✅ Registration successful for:', userData.username);
        
//         return {
//           success: true,
//           message: data.message
//         };
//       } else {
//         const error = await this.handleApiError(response);
//         console.error('❌ Registration failed:', error.message);
        
//         return {
//           success: false,
//           error: error
//         };
//       }
//     } catch (e) {
//       console.error('💥 Registration request failed:', e);
      
//       return {
//         success: false,
//         error: {
//           message: 'Network error - please check your connection',
//           status: 0
//         }
//       };
//     }
//   }

//   /**
//    * Logout current user
//    */
//   async logout(): Promise<{ success: boolean; error?: AuthError }> {
//     try {
//       console.log('🚪 Attempting logout...');
      
//       const token = this.getToken();
      
//       if (!token) {
//         // Already logged out
//         this.removeToken();
//         return { success: true };
//       }
      
//       const response = await fetch(`${this.baseUrl}/logout`, {
//         method: 'POST',
//         headers: this.getAuthHeaders()
//       });

//       // Always clear local storage, even if API call fails
//       this.removeToken();
      
//       if (response.ok) {
//         console.log('✅ Logout successful');
//         return { success: true };
//       } else {
//         const error = await this.handleApiError(response);
//         console.warn('⚠️ Logout API failed but local logout completed:', error.message);
//         return { success: true }; // Still count as success since we cleared local data
//       }
//     } catch (e) {
//       console.error('💥 Logout request failed:', e);
      
//       // Still clear local storage on network error
//       this.removeToken();
      
//       return {
//         success: true, // Still count as success since we cleared local data
//         error: {
//           message: 'Network error during logout, but you have been logged out locally',
//           status: 0
//         }
//       };
//     }
//   }

//   /**
//    * Verify current authentication status with backend
//    * Call this to check if the stored token is still valid
//    */
//   async verifyAuth(): Promise<{ valid: true; user: User } | { valid: false; error?: AuthError }> {
//     try {
//       const token = this.getToken();
      
//       if (!token) {
//         return { valid: false };
//       }
      
//       const response = await fetch(`${this.baseUrl}/me`, {
//         method: 'GET',
//         headers: this.getAuthHeaders()
//       });

//       if (response.ok) {
//         const user: User = await response.json();
        
//         // Update stored user information
//         this.setUser(user);
        
//         return {
//           valid: true,
//           user: user
//         };
//       } else {
//         // Token is invalid or expired
//         this.removeToken();
        
//         const error = await this.handleApiError(response);
        
//         return {
//           valid: false,
//           error: error
//         };
//       }
//     } catch (e) {
//       console.error('💥 Auth verification failed:', e);
      
//       return {
//         valid: false,
//         error: {
//           message: 'Network error during authentication verification',
//           status: 0
//         }
//       };
//     }
//   }

//   /**
//    * Get user settings from backend
//    */
//   async getUserSettings(userId: string): Promise<{ success: true; settings: any } | { success: false; error: AuthError }> {
//     try {
//       const response = await fetch(`${this.baseUrl}/settings/${userId}`, {
//         method: 'GET',
//         headers: this.getAuthHeaders()
//       });

//       if (response.ok) {
//         const data = await response.json();
//         return {
//           success: true,
//           settings: data.settings
//         };
//       } else {
//         const error = await this.handleApiError(response);
//         return {
//           success: false,
//           error: error
//         };
//       }
//     } catch (e) {
//       console.error('💥 Get settings failed:', e);
      
//       return {
//         success: false,
//         error: {
//           message: 'Network error while fetching settings',
//           status: 0
//         }
//       };
//     }
//   }

//   /**
//    * Update user settings
//    */
//   async updateUserSettings(userId: string, settings: any): Promise<{ success: true; message: string } | { success: false; error: AuthError }> {
//     try {
//       const response = await fetch(`${this.baseUrl}/settings/${userId}`, {
//         method: 'PUT',
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(settings)
//       });

//       if (response.ok) {
//         const data = await response.json();
//         return {
//           success: true,
//           message: data.message
//         };
//       } else {
//         const error = await this.handleApiError(response);
//         return {
//           success: false,
//           error: error
//         };
//       }
//     } catch (e) {
//       console.error('💥 Update settings failed:', e);
      
//       return {
//         success: false,
//         error: {
//           message: 'Network error while updating settings',
//           status: 0
//         }
//       };
//     }
//   }
// }

// // Create and export singleton instance
// export const authService = new AuthService();

// // Export individual methods for easier importing
// export const {
//   login,
//   register,
//   logout,
//   verifyAuth,
//   isLoggedIn,
//   getCurrentUser,
//   getUserSettings,
//   updateUserSettings
// } = authService;






// Frontend/src/services/authService.ts
// Updated authentication service with country of interest support

// Updated interface definitions with country support
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  country_of_interest: string;  // NEW: Country they want news from
  profile_picture?: string;
  created_at: string;
  last_login: string;
  is_active: boolean;
}

export interface LoginRequest {
  username: string; // Can be username or email
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  country_of_interest: string;  // NEW: Required during registration
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

export interface AuthError {
  message: string;
  status: number;
}

// NEW: List of supported African countries for dropdown
export const COUNTRIES = [
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'CD', name: 'Democratic Republic of Congo', flag: '🇨🇩' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' }
];

// NEW: Helper function to get country name from code
export function getCountryName(countryCode: string): string {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country ? country.name : countryCode;
}

// NEW: Helper function to get country flag from code
export function getCountryFlag(countryCode: string): string {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country ? country.flag : '🌍';
}

/**
 * Authentication Service Class
 * Updated with country of interest support
 */
export class AuthService {
  private baseUrl: string;
  private tokenKey: string = 'teacup_auth_token';
  private userKey: string = 'teacup_user_info';

  constructor() {
    // Backend authentication API URL
    this.baseUrl = "http://localhost:8000/api/auth";
  }

  /**
   * Store authentication token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Remove authentication token from localStorage
   */
  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Store user information in localStorage
   */
  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Get user information from localStorage
   */
  public getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.removeToken(); // Clear corrupted data
      }
    }
    return null;
  }

  /**
   * Check if user is currently logged in
   */
  public isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Create authorization headers for API requests
   */
  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Handle API errors consistently
   */
  private async handleApiError(response: Response): Promise<AuthError> {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // If response isn't JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    return {
      message: errorMessage,
      status: response.status
    };
  }

  /**
   * Login user with username/email and password
   */
  async login(username: string, password: string): Promise<{ success: true; user: User } | { success: false; error: AuthError }> {
    try {
      console.log('🔐 Attempting login for:', username);
      
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        
        // Store token and user information
        this.setToken(data.access_token);
        this.setUser(data.user);
        
        console.log('✅ Login successful for:', username, 'Country:', data.user.country_of_interest);
        
        return {
          success: true,
          user: data.user
        };
      } else {
        const error = await this.handleApiError(response);
        console.error('❌ Login failed:', error.message);
        
        return {
          success: false,
          error: error
        };
      }
    } catch (e) {
      console.error('💥 Login request failed:', e);
      
      return {
        success: false,
        error: {
          message: 'Network error - please check your connection',
          status: 0
        }
      };
    }
  }

  /**
   * Register new user account - UPDATED with country support
   */
  async register(userData: RegisterRequest): Promise<{ success: true; message: string } | { success: false; error: AuthError }> {
    try {
      console.log('📝 Attempting registration for:', userData.username, 'Country:', userData.country_of_interest);
      
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ Registration successful for:', userData.username);
        
        return {
          success: true,
          message: data.message
        };
      } else {
        const error = await this.handleApiError(response);
        console.error('❌ Registration failed:', error.message);
        
        return {
          success: false,
          error: error
        };
      }
    } catch (e) {
      console.error('💥 Registration request failed:', e);
      
      return {
        success: false,
        error: {
          message: 'Network error - please check your connection',
          status: 0
        }
      };
    }
  }

  /**
   * NEW: Update user's country of interest
   */
  async updateCountryOfInterest(countryCode: string): Promise<{ success: true; message: string } | { success: false; error: AuthError }> {
    try {
      console.log('🌍 Updating country of interest to:', countryCode);
      
      const response = await fetch(`${this.baseUrl}/profile/country`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          country_of_interest: countryCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update stored user data
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          currentUser.country_of_interest = countryCode;
          this.setUser(currentUser);
        }
        
        console.log('✅ Country updated successfully to:', countryCode);
        
        return {
          success: true,
          message: data.message
        };
      } else {
        const error = await this.handleApiError(response);
        console.error('❌ Country update failed:', error.message);
        
        return {
          success: false,
          error: error
        };
      }
    } catch (e) {
      console.error('💥 Country update request failed:', e);
      
      return {
        success: false,
        error: {
          message: 'Network error - please check your connection',
          status: 0
        }
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      console.log('🚪 Attempting logout...');
      
      const token = this.getToken();
      
      if (!token) {
        // Already logged out
        this.removeToken();
        return { success: true };
      }
      
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      // Always clear local storage, even if API call fails
      this.removeToken();
      
      if (response.ok) {
        console.log('✅ Logout successful');
        return { success: true };
      } else {
        const error = await this.handleApiError(response);
        console.warn('⚠️ Logout API failed but local logout completed:', error.message);
        return { success: true }; // Still count as success since we cleared local data
      }
    } catch (e) {
      console.error('💥 Logout request failed:', e);
      
      // Still clear local storage on network error
      this.removeToken();
      
      return {
        success: true, // Still count as success since we cleared local data
        error: {
          message: 'Network error during logout, but you have been logged out locally',
          status: 0
        }
      };
    }
  }

  /**
   * Verify current authentication status with backend
   */
  async verifyAuth(): Promise<{ valid: true; user: User } | { valid: false; error?: AuthError }> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return { valid: false };
      }
      
      // You can implement a verify endpoint on backend if needed
      // For now, we'll just check if we have valid local data
      const user = this.getCurrentUser();
      
      if (user) {
        return { valid: true, user };
      } else {
        return { valid: false };
      }
    } catch (e) {
      console.error('💥 Auth verification failed:', e);
      return { 
        valid: false, 
        error: { message: 'Authentication verification failed', status: 0 } 
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();