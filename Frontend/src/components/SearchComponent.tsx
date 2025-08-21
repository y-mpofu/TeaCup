// Frontend/src/components/SearchComponent.tsx
// ENHANCED SearchComponent - Now supports article dialogue navigation
// When search results are clicked, they open the same dialogue as regular article cards

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import '../styles/SearchComponent.css';

// ===== INTERFACES =====

// NewsArticle interface matching the backend response format
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  readTime: string;
  isBreaking?: boolean;
  imageUrl?: string;
  sourceUrl?: string;
  source?: string;
  linked_sources?: string[];
}

// Backend search response format (from search_routes.py)
interface SearchResponse {
  success: boolean;
  query: string;
  results_found: number;
  source: string; // "cached" or "web"
  articles: NewsArticle[];
  web_search_suggestion?: {
    message: string;
    google_url: string;
    bing_url: string;
    duckduckgo_url: string;
    country_context: string;
    tip: string;
  };
  timestamp: string;
}

// Component props interface
interface SearchComponentProps {
  onArticleSelect?: (article: NewsArticle) => void;
  placeholder?: string;
  className?: string;
}

// ===== SEARCH API FUNCTION =====

/**
 * Search function that calls the backend search endpoint
 * Works without authentication - uses /api/search endpoint
 * 
 * @param query - Search term (minimum 2 characters)
 * @param maxResults - Maximum number of results to return
 * @returns Promise<SearchResponse> - Search results from backend
 */
const searchArticles = async (query: string, maxResults: number = 20): Promise<SearchResponse> => {
  try {
    console.log(`🔍 Searching for: "${query}"`);

    // Validate query length (minimum 2 characters as per backend validation)
    if (query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    // Encode the query for URL safety
    const encodedQuery = encodeURIComponent(query.trim());
    
    // Set up request timeout (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Make request to the search endpoint (NO AUTHENTICATION REQUIRED)
    const response = await fetch(
      `http://localhost:8000/api/search?q=${encodedQuery}&max_results=${maxResults}`,
      {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
          // NO Authorization header - this endpoint works without auth!
        }
      }
    );

    // Clear timeout since request completed
    clearTimeout(timeoutId);

    // Check if request was successful
    if (!response.ok) {
      if (response.status === 400) {
        // Bad request - probably query too short
        throw new Error('Invalid search query. Please try a different search term.');
      } else {
        // Other server errors
        throw new Error(`Search failed with status ${response.status}. Please try again.`);
      }
    }

    // Parse the response
    const data: SearchResponse = await response.json();
    
    // Log search results for debugging
    console.log(`✅ Search completed: ${data.results_found} results for "${query}"`);
    
    return data;

  } catch (error) {
    // Handle different types of errors
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`⏰ Search timeout for "${query}"`);
      throw new Error('Search request timed out. Please try again.');
    } else if (error instanceof Error) {
      console.error(`❌ Search error for "${query}":`, error.message);
      throw error; // Re-throw to maintain error message
    } else {
      console.error(`❌ Unexpected search error for "${query}":`, error);
      throw new Error('An unexpected error occurred during search.');
    }
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get category color for display
 * Same color mapping as used in NewsCard component for consistency
 */
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    politics: '#064e3b',        // Dark emerald
    sports: '#7f1d1d',          // Dark red
    health: '#78350f',          // Dark amber
    business: '#1e3a8a',        // Dark blue
    technology: '#581c87',      // Dark purple
    entertainment: '#be185d',   // Dark pink
    education: '#0891b2',       // Cyan
    'local-trends': '#334155',  // Dark slate
    weather: '#0284c7'          // Sky blue
  };
  
  return colors[category.toLowerCase()] || '#6b7280'; // Default gray
};

/**
 * Format timestamp for display
 * Converts ISO timestamps to human-readable format (e.g., "2h ago")
 */
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  } catch (error) {
    return 'Recently';
  }
};

// ===== MAIN COMPONENT =====

/**
 * SearchComponent - Enhanced search that navigates to article dialogue
 * 
 * Key Features:
 * - Real-time search with debouncing
 * - NO authentication required
 * - Cached and web search results
 * - Error handling and loading states
 * - CLICK TO NAVIGATE - Same behavior as NewsCard clicks
 * 
 * When a search result is clicked, it navigates to the article dialogue page
 * using the same mechanism as regular article cards
 */
const SearchComponent: React.FC<SearchComponentProps> = ({
  onArticleSelect,
  placeholder = "Search news articles...",
  className = ""
}) => {
  // ===== HOOKS AND STATE =====
  
  const navigate = useNavigate(); // Router navigation hook
  
  // Search input and UI state
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Search results and loading state
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for DOM elements and debouncing
  const componentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ===== EFFECTS =====

  /**
   * Handle clicks outside component to close dropdown
   * Closes the search results when user clicks elsewhere
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Debounced search effect - performs search when query changes
   * Waits 500ms after user stops typing before executing search
   */
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Don't search for very short queries
    if (query.trim().length < 2) {
      setSearchResults(null);
      setError(null);
      return;
    }

    // Set up new debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query.trim());
    }, 500); // 500ms debounce delay

    // Cleanup timeout on unmount or query change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // ===== SEARCH EXECUTION =====

  /**
   * Execute the search operation
   * Calls the backend search API and updates component state
   */
  const performSearch = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`🔄 Performing search for: "${searchQuery}"`);
      
      // Call the search API
      const results = await searchArticles(searchQuery);
      
      // Update state with results
      setSearchResults(results);
      
      // Log results summary
      if (results.success) {
        console.log(`✅ Search successful: ${results.results_found} results from ${results.source}`);
      } else {
        console.warn('⚠️ Search completed but returned no results');
      }
      
    } catch (err) {
      // Handle search errors
      console.error('❌ Search failed:', err);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Search failed. Please try again.');
      }
      
      // Clear results on error
      setSearchResults(null);
      setShowResults(true); // Still show dropdown to display error
      
    } finally {
      setIsLoading(false);
    }
  };

  // ===== EVENT HANDLERS =====

  /**
   * Handle input changes
   * Updates query state and shows dropdown when user types
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Show dropdown when user starts typing
    if (newQuery.trim().length > 0) {
      setShowResults(true);
    }
  };

  /**
   * Handle input focus
   * Shows results dropdown if we have cached results
   */
  const handleInputFocus = () => {
    setIsFocused(true);
    
    // Show results if we have them
    if (searchResults || error) {
      setShowResults(true);
    }
  };

  /**
   * Handle input blur (with small delay to allow clicks)
   * Hides focus state but allows dropdown clicks to register
   */
  const handleInputBlur = () => {
    // Small delay to allow dropdown clicks to register
    setTimeout(() => {
      setIsFocused(false);
    }, 150);
  };

  /**
   * Get category color for the article (same mapping as NewsCard)
   * This ensures consistent colors between cards and dialogue backgrounds
   */
  const getArticleCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'politics': '#064e3b',        // Dark emerald
      'sports': '#7f1d1d',          // Dark red
      'health': '#78350f',          // Dark amber
      'business': '#1e3a8a',        // Dark blue
      'technology': '#581c87',      // Dark purple
      'entertainment': '#be185d',   // Dark pink
      'education': '#0891b2',       // Cyan
      'local-trends': '#334155',    // Dark slate
      'weather': '#0284c7'          // Sky blue
    };
    
    return colorMap[category.toLowerCase()] || '#6b7280'; // Default gray
  };

  /**
   * 🎯 MAIN FEATURE: Handle article selection from search results
   * 
   * This function implements the SAME behavior as clicking a NewsCard:
   * - Navigates to /news/{articleId} 
   * - Passes article data AND category color via router state
   * - Opens the article dialogue page with matching background color
   * 
   * This ensures search results and regular articles have identical behavior
   */
  const handleArticleClick = (article: NewsArticle) => {
    console.log('📰 Search result clicked:', article.title);
    console.log('🚀 Navigating to article dialogue...');
    
    // Close dropdown
    setShowResults(false);
    setIsFocused(false);
    
    // Clear search input for better UX
    setQuery('');
    
    // Get the category color for the dialogue background
    const categoryColor = getArticleCategoryColor(article.category);
    console.log('🎨 Article category color:', categoryColor);
    
    // 🎯 NAVIGATE TO ARTICLE DIALOGUE - Same as NewsCard behavior
    // This uses React Router to navigate to the article page and pass the article data + color
    navigate(`/news/${article.id}`, { 
      state: { 
        article,              // Pass full article data
        categoryColor         // 🎨 NEW: Pass category color for dialogue background
      }
    });
    
    // Also call the optional callback if provided
    if (onArticleSelect) {
      onArticleSelect(article);
    }
  };

  /**
   * Handle Enter key press - Show dropdown with results
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Don't auto-select first result
      // Just ensure the dropdown is shown so user can click on results
      if (query.trim().length >= 2) {
        setShowResults(true);
        
        // If we don't have results yet, trigger search immediately
        if (!searchResults && !isLoading) {
          performSearch(query.trim());
        }
      }
    }
  };

  // ===== RENDER HELPER FUNCTIONS =====

  /**
   * Render individual search result item
   * Each item is clickable and navigates to article dialogue when clicked
   */
  const renderSearchResult = (article: NewsArticle) => (
    <div
      key={article.id}
      className="search-result-item"
      onClick={() => handleArticleClick(article)} // 🎯 Click handler for navigation
    >
      {/* Article Header with Category and Breaking Badge */}
      <div className="article-header">
        <span 
          className="article-category"
          style={{ backgroundColor: getCategoryColor(article.category) }}
        >
          {article.category}
        </span>
        {article.isBreaking && (
          <span className="breaking-badge">
            <AlertCircle size={12} />
            Breaking
          </span>
        )}
      </div>

      {/* Article Title */}
      <h3 className="article-title">
        {article.title}
      </h3>

      {/* Article Summary */}
      <p className="article-summary">
        {article.summary}
      </p>

      {/* Article Metadata */}
      <div className="article-metadata">
        <div className="metadata-left">
          <Clock size={12} />
          <span>{formatTimestamp(article.timestamp)}</span>
          <span className="separator">•</span>
          <span>{article.readTime}</span>
        </div>
        
        {article.source && (
          <div className="source-info">
            <span className="source-name">{article.source}</span>
          </div>
        )}
      </div>

      {/* Click hint */}
      <div className="click-hint">
        <span>Click to read full article</span>
      </div>
    </div>
  );

  /**
   * Render web search suggestions when no cached results found
   */
  const renderWebSearchSuggestions = () => {
    if (!searchResults?.web_search_suggestion) return null;

    const suggestion = searchResults.web_search_suggestion;

    return (
      <div className="web-search-suggestions">
        <div className="suggestion-header">
          <AlertCircle size={16} />
          <span>No cached results found</span>
        </div>
        
        <p className="suggestion-message">{suggestion.message}</p>
        
        <div className="suggestion-links">
          <a 
            href={suggestion.google_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="suggestion-link"
          >
            <ExternalLink size={14} />
            Search Google
          </a>
          <a 
            href={suggestion.bing_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="suggestion-link"
          >
            <ExternalLink size={14} />
            Search Bing
          </a>
        </div>
        
        <div className="suggestion-tip">
          <strong>💡 Tip:</strong> {suggestion.tip}
        </div>
      </div>
    );
  };

  /**
   * Render the main dropdown content
   * Shows loading, error, results, or suggestions based on current state
   */
  const renderDropdownContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="search-loading-state">
          <Loader2 size={20} className="loading-spinner" />
          <span>Searching articles...</span>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="search-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      );
    }

    // Results or suggestions
    if (searchResults) {
      return (
        <>
          {/* Results Header */}
          <div className="results-header">
            <span className="results-count">
              {searchResults.results_found} results found
            </span>
            <span className="results-source">
              {searchResults.source === 'cached' ? '📚 Cached' : '🌐 Live'}
            </span>
          </div>

          {/* Results or Suggestions */}
          {searchResults.articles.length > 0 ? (
            <div className="cached-results">
              {searchResults.articles.map(renderSearchResult)}
            </div>
          ) : (
            renderWebSearchSuggestions()
          )}
        </>
      );
    }

    return null;
  };

  // ===== MAIN RENDER =====

  return (
    <div 
      ref={componentRef}
      className={`search-component ${isFocused ? 'focused' : ''} ${className}`}
    >
      {/* Search Input Container */}
      <div className="search-input-container">
        {/* Search Icon */}
        <Search size={20} className="search-icon" />
        
        {/* Search Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="search-input"
          autoComplete="off"
          spellCheck="false"
        />
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="search-loading">
            <Loader2 size={20} className="loading-spinner" />
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (query.trim().length >= 2 || error) && (
        <div className="search-results-dropdown">
          {renderDropdownContent()}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;