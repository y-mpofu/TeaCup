// Frontend/src/services/authService.ts
// Enhanced authentication service with country preference support
// Works with the new authentication gate in App.tsx

// Interface definitions for type safety
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  country_of_interest: string; // Added country preference field
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
  country_of_interest: string; // Required country selection
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

/**
 * Enhanced Authentication Service Class
 * Handles all authentication-related API calls with country preference support
 * Designed to work with the new authentication gate in App.tsx
 */
export class AuthService {
  private baseUrl: string;
  private tokenKey: string = 'teacup_auth_token';
  private userKey: string = 'teacup_user_info';

  constructor() {
    // Backend authentication API URL
    this.baseUrl = "http://localhost:8000/api/auth";
  }

  // === TOKEN MANAGEMENT ===

  /**
   * Store authentication token in localStorage
   * Note: In production, consider using httpOnly cookies for better security
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
   * Remove authentication token and user data from localStorage
   */
  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // === USER DATA MANAGEMENT ===

  /**
   * Store user information in localStorage
   */
  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Get user information from localStorage
   * Returns null if no user data or if data is corrupted
   */
  public getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Validate that the user object has required fields
        if (user && user.id && user.username && user.country_of_interest) {
          return user;
        } else {
          console.warn('⚠️ Stored user data is incomplete, clearing...');
          this.removeToken();
          return null;
        }
      } catch (e) {
        console.error('❌ Error parsing user data:', e);
        this.removeToken(); // Clear corrupted data
      }
    }
    return null;
  }

  /**
   * Check if user is currently logged in (has valid token and user data)
   */
  public isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    // User is logged in if both token and user data exist
    // App.tsx will verify the token validity with the backend
    return !!(token && user);
  }

  // === HTTP HELPERS ===

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
   * Handle API errors consistently across all methods
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

  // === AUTHENTICATION METHODS ===

  /**
   * Login user with username/email and password
   * On success, stores token and user data locally
   */
  async login(username: string, password: string): Promise<{ success: true; user: User } | { success: false; error: AuthError }> {
    try {
      console.log('🔐 AuthService: Attempting login for:', username);
      
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
        
        // Validate that the user has a country preference
        if (!data.user.country_of_interest) {
          console.error('❌ AuthService: User missing country preference');
          return {
            success: false,
            error: {
              message: 'Account setup incomplete. Please contact support.',
              status: 400
            }
          };
        }
        
        // Store token and user information
        this.setToken(data.access_token);
        this.setUser(data.user);
        
        console.log('✅ AuthService: Login successful for:', username);
        console.log('🌍 AuthService: User country preference:', data.user.country_of_interest);
        
        return {
          success: true,
          user: data.user
        };
      } else {
        const error = await this.handleApiError(response);
        console.error('❌ AuthService: Login failed:', error.message);
        
        return {
          success: false,
          error: error
        };
      }
    } catch (e) {
      console.error('💥 AuthService: Login request failed:', e);
      
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
   * Register new user account with country preference
   * Country selection is required for personalized news
   */
  async register(userData: RegisterRequest): Promise<{ success: true; message: string } | { success: false; error: AuthError }> {
    try {
      console.log('📝 AuthService: Attempting registration for:', userData.username);
      console.log('🌍 AuthService: Selected country:', userData.country_of_interest);
      
      // Validate required fields on the frontend as well
      if (!userData.country_of_interest) {
        return {
          success: false,
          error: {
            message: 'Country selection is required for personalized news',
            status: 400
          }
        };
      }
      
      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ AuthService: Registration successful for:', userData.username);
        
        return {
          success: true,
          message: data.message
        };
      } else {
        const error = await this.handleApiError(response);
        console.error('❌ AuthService: Registration failed:', error.message);
        
        return {
          success: false,
          error: error
        };
      }
    } catch (e) {
      console.error('💥 AuthService: Registration request failed:', e);
      
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
   * Clears local storage and notifies backend
   */
  async logout(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      console.log('🚪 AuthService: Attempting logout...');
      
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
        console.log('✅ AuthService: Logout successful');
        return { success: true };
      } else {
        const error = await this.handleApiError(response);
        console.warn('⚠️ AuthService: Logout API failed but local logout completed:', error.message);
        return { success: true }; // Still count as success since we cleared local data
      }
    } catch (e) {
      console.error('💥 AuthService: Logout request failed:', e);
      
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
   * Called by App.tsx to validate stored tokens
   */
  async verifyAuth(): Promise<{ valid: true; user: User } | { valid: false; error?: AuthError }> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return { valid: false };
      }
      
      console.log('🔍 AuthService: Verifying authentication with backend...');
      
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const user: User = await response.json();
        
        // Validate that the user has a country preference
        if (!user.country_of_interest) {
          console.error('❌ AuthService: User missing country preference');
          this.removeToken();
          return {
            valid: false,
            error: {
              message: 'Account setup incomplete. Please contact support.',
              status: 400
            }
          };
        }
        
        // Update stored user information with latest data
        this.setUser(user);
        
        console.log('✅ AuthService: Authentication verified successfully');
        console.log('🌍 AuthService: User country:', user.country_of_interest);
        
        return {
          valid: true,
          user: user
        };
      } else {
        // Token is invalid or expired
        console.log('❌ AuthService: Token verification failed');
        this.removeToken();
        
        const error = await this.handleApiError(response);
        
        return {
          valid: false,
          error: error
        };
      }
    } catch (e) {
      console.error('💥 AuthService: Auth verification failed:', e);
      
      return {
        valid: false,
        error: {
          message: 'Network error during authentication verification',
          status: 0
        }
      };
    }
  }

  // === UTILITY METHODS ===

  /**
   * Get user's full name for display purposes
   */
  public getUserDisplayName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'User';
    
    const firstName = user.first_name?.trim() || '';
    const lastName = user.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else {
      return user.username || 'User';
    }
  }

  /**
   * Get user's initials for avatar display
   */
  public getUserInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return 'U';
    
    const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || '';
    
    return firstInitial + lastInitial || user.username?.charAt(0)?.toUpperCase() || 'U';
  }
}

// === COUNTRY UTILITY FUNCTIONS ===

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string): string {
  const countryMap: Record<string, string> = {
    'ZW': 'Zimbabwe',
    'KE': 'Kenya',
    'GH': 'Ghana',
    'RW': 'Rwanda',
    'CD': 'Democratic Republic of Congo',
    'ZA': 'South Africa',
    'BI': 'Burundi'
  };
  
  return countryMap[countryCode.toUpperCase()] || countryCode;
}

/**
 * Get country flag emoji from country code
 */
export function getCountryFlag(countryCode: string): string {
  const flagMap: Record<string, string> = {
    'ZW': '🇿🇼',
    'KE': '🇰🇪',
    'GH': '🇬🇭',
    'RW': '🇷🇼',
    'CD': '🇨🇩',
    'ZA': '🇿🇦',
    'BI': '🇧🇮'
  };
  
  return flagMap[countryCode.toUpperCase()] || '🌍';
}

// Create and export singleton instance
export const authService = new AuthService();