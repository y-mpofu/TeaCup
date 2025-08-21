// Frontend/src/components/SearchComponent.tsx
// SIMPLIFIED SearchComponent - Works WITHOUT authentication required
// Uses /api/search endpoint that accepts optional authentication

import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
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

// ===== SIMPLE SEARCH FUNCTION =====

/**
 * Simple search function that calls the backend without requiring authentication
 * Uses the /api/search endpoint which works for everyone
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
 */
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    politics: '#dc2626',      // Red
    sports: '#059669',        // Green  
    health: '#7c3aed',        // Purple
    business: '#2563eb',      // Blue
    technology: '#ea580c',    // Orange
    entertainment: '#db2777', // Pink
    education: '#0891b2',     // Cyan
    'local-trends': '#65a30d', // Lime
    weather: '#0284c7'        // Sky blue
  };
  
  return colors[category.toLowerCase()] || '#6b7280'; // Default gray
};

/**
 * Format timestamp for display
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
 * SearchComponent - Simple search that works WITHOUT authentication
 * 
 * Features:
 * - Real-time search with debouncing
 * - NO authentication required
 * - Cached and web search results
 * - Error handling and loading states
 * - Responsive design with animations
 */
const SearchComponent: React.FC<SearchComponentProps> = ({
  onArticleSelect,
  placeholder = "Search news articles...",
  className = ""
}) => {
  // ===== STATE MANAGEMENT =====
  
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
   */
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Only search if query is not empty and meets minimum length
    if (query.trim().length >= 2) {
      // Set up debounced search (500ms delay)
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(query.trim());
      }, 500);
    } else {
      // Clear results if query is too short
      setSearchResults(null);
      setShowResults(false);
      setError(null);
    }

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // ===== SEARCH FUNCTIONALITY =====

  /**
   * Perform the actual search - NO AUTHENTICATION REQUIRED
   */
  const performSearch = async (searchQuery: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`🔍 Performing search for: "${searchQuery}"`);
      
      // Call the simple search function (no auth needed)
      const results = await searchArticles(searchQuery, 20);
      
      // Update state with results
      setSearchResults(results);
      setShowResults(true);
      
      console.log(`✅ Search completed: ${results.results_found} results`);
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      
      // Handle different types of errors
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred during search.');
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
   */
  const handleInputBlur = () => {
    // Small delay to allow dropdown clicks to register
    setTimeout(() => {
      setIsFocused(false);
    }, 150);
  };

  /**
   * Handle article selection - Same behavior as clicking a news card
   * This should navigate to the dialogue page with the selected article
   */
  const handleArticleClick = (article: NewsArticle) => {
    console.log('📰 Article selected:', article.title);
    
    // Close dropdown
    setShowResults(false);
    setIsFocused(false);
    
    // Clear search input
    setQuery('');
    
    // Navigate to dialogue page with the selected article
    // This mimics the same behavior as clicking a news card
    if (onArticleSelect) {
      onArticleSelect(article);
    } else {
      // Fallback: Emit custom event that the app can listen to
      // This allows the app to handle navigation to dialogue page
      const articleClickEvent = new CustomEvent('article-selected', {
        detail: { article }
      });
      window.dispatchEvent(articleClickEvent);
    }
  };

  /**
   * Handle Enter key press - Just ensure dropdown stays open to show results
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
   */
  const renderSearchResult = (article: NewsArticle) => (
    <div
      key={article.id}
      className="search-result-item"
      onClick={() => handleArticleClick(article)}
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
      <h3 className="article-title">{article.title}</h3>

      {/* Article Summary */}
      <p className="article-summary">{article.summary}</p>

      {/* Article Footer with Metadata */}
      <div className="article-footer">
        {article.source && (
          <span className="article-source">{article.source}</span>
        )}
        <span className="article-time">
          <Clock size={12} />
          {formatTimestamp(article.timestamp)}
        </span>
        <span className="article-read-time">{article.readTime}</span>
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
        <div className="no-results-message">
          <Search size={16} />
          {suggestion.message}
        </div>

        <div className="web-search-links">
          <a
            href={suggestion.google_url}
            target="_blank"
            rel="noopener noreferrer"
            className="web-search-link google"
          >
            <ExternalLink size={16} />
            Search on Google
          </a>
          <a
            href={suggestion.bing_url}
            target="_blank"
            rel="noopener noreferrer"
            className="web-search-link bing"
          >
            <ExternalLink size={16} />
            Search on Bing
          </a>
          <a
            href={suggestion.duckduckgo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="web-search-link duckduckgo"
          >
            <ExternalLink size={16} />
            Search on DuckDuckGo
          </a>
        </div>

        <div className="search-tip">
          <strong>Tip:</strong> {suggestion.tip}
        </div>
      </div>
    );
  };

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <div className="search-loading-state">
      <Loader2 size={20} className="loading-spinner" />
      Searching articles...
    </div>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <div className="search-error">
      <AlertCircle size={16} />
      {error}
    </div>
  );

  /**
   * Render search results dropdown content
   */
  const renderDropdownContent = () => {
    // Show loading state
    if (isLoading) {
      return renderLoadingState();
    }

    // Show error state
    if (error) {
      return renderErrorState();
    }

    // Show search results or web suggestions
    if (searchResults) {
      return (
        <>
          {/* Results Header */}
          <div className="results-header">
            <div className="results-count">
              {searchResults.results_found} results found
            </div>
            <div className="results-source">
              Source: {searchResults.source}
            </div>
          </div>

          {/* Results Content */}
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