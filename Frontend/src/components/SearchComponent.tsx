// Frontend/src/components/SearchComponent.tsx
// Enhanced search component with cached article search and web search fallback

import React, { useState, useEffect, useRef } from 'react';
import { Search, ExternalLink, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import './SearchComponent.css';

// TypeScript interfaces for search results
interface SearchResult {
  success: boolean;
  query: string;
  results_found: number;
  source: string; // "cached" or "web_suggestion"
  articles: Article[];
  web_search_suggestion?: WebSearchSuggestion;
  timestamp: string;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  readTime: string;
  isBreaking: boolean;
  sourceUrl: string;
  source: string;
  search_score?: number; // For cached search results
}

interface WebSearchSuggestion {
  message: string;
  google_url: string;
  bing_url: string;
  duckduckgo_url: string;
  country_context: string;
  tip: string;
}

interface SearchComponentProps {
  onArticleSelect?: (article: Article) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Enhanced Search Component
 * 
 * Features:
 * - Real-time search through cached articles
 * - Debounced input to avoid excessive API calls
 * - Web search suggestions when no cached results found
 * - Search result highlighting and scoring
 * - Responsive design with loading states
 */
export default function SearchComponent({ 
  onArticleSelect, 
  placeholder = "Search news articles...",
  className = ""
}: SearchComponentProps) {
  // State management for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for managing search input and dropdown
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Perform search API call
   * Searches cached articles first, provides web search if no results
   */
  const performSearch = async (query: string): Promise<void> => {
    if (query.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      console.log(`🔍 Searching for: "${query}"`);

      // Get authentication token from localStorage
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Please log in to search articles');
      }

      // Call our enhanced search API
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&max_results=10`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const results: SearchResult = await response.json();
      console.log(`✅ Search completed:`, results);

      setSearchResults(results);

    } catch (searchError) {
      console.error('❌ Search error:', searchError);
      setError(searchError instanceof Error ? searchError.message : 'Search failed');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handle search input changes with debouncing
   * Waits 300ms after user stops typing before searching
   */
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value;
    setSearchQuery(query);

    // Clear previous debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new debounce timeout
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms delay for better UX
  };

  /**
   * Handle clicking on a search result article
   */
  const handleArticleClick = (article: Article): void => {
    console.log(`📖 Opening article: ${article.title}`);
    
    // Call parent callback if provided
    if (onArticleSelect) {
      onArticleSelect(article);
    }
    
    // Clear search and close dropdown
    setSearchQuery('');
    setSearchResults(null);
    setIsSearchFocused(false);
    
    // Blur the search input
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  /**
   * Handle clicking outside search component to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 48) return 'Yesterday';
      return date.toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  /**
   * Get category color for visual organization
   */
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Politics': '#ef4444',
      'Sports': '#22c55e', 
      'Health': '#3b82f6',
      'Business': '#f59e0b',
      'Technology': '#8b5cf6',
      'Entertainment': '#ec4899',
      'Education': '#14b8a6',
      'Weather': '#06b6d4',
      'Local-Trends': '#84cc16'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div 
      ref={searchContainerRef}
      className={`search-component ${className} ${isSearchFocused ? 'focused' : ''}`}
    >
      {/* Search Input Field */}
      <div className="search-input-container">
        <Search className="search-icon" size={20} />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          onFocus={() => setIsSearchFocused(true)}
          placeholder={placeholder}
          className="search-input"
          autoComplete="off"
        />
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="search-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isSearchFocused && (searchResults || error || isSearching) && (
        <div className="search-results-dropdown">
          
          {/* Error State */}
          {error && (
            <div className="search-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {isSearching && !error && (
            <div className="search-loading-state">
              <div className="loading-spinner"></div>
              <span>Searching articles...</span>
            </div>
          )}

          {/* Search Results */}
          {searchResults && !isSearching && !error && (
            <>
              {/* Cached Article Results */}
              {searchResults.source === 'cached' && searchResults.articles.length > 0 && (
                <div className="cached-results">
                  <div className="results-header">
                    <span className="results-count">
                      {searchResults.results_found} article{searchResults.results_found !== 1 ? 's' : ''} found
                    </span>
                    <span className="results-source">From your news feed</span>
                  </div>
                  
                  {searchResults.articles.map((article) => (
                    <div
                      key={article.id}
                      className="search-result-item"
                      onClick={() => handleArticleClick(article)}
                    >
                      {/* Article Header */}
                      <div className="article-header">
                        <span 
                          className="article-category"
                          style={{ backgroundColor: getCategoryColor(article.category) }}
                        >
                          {article.category}
                        </span>
                        {article.isBreaking && (
                          <span className="breaking-badge">
                            <TrendingUp size={12} />
                            Breaking
                          </span>
                        )}
                      </div>
                      
                      {/* Article Content */}
                      <h4 className="article-title">{article.title}</h4>
                      <p className="article-summary">
                        {article.summary.length > 120 
                          ? `${article.summary.substring(0, 120)}...` 
                          : article.summary
                        }
                      </p>
                      
                      {/* Article Footer */}
                      <div className="article-footer">
                        <span className="article-source">{article.source}</span>
                        <span className="article-time">
                          <Clock size={12} />
                          {formatTimestamp(article.timestamp)}
                        </span>
                        <span className="article-read-time">{article.readTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Web Search Suggestions */}
              {searchResults.source === 'web_suggestion' && searchResults.web_search_suggestion && (
                <div className="web-search-suggestions">
                  <div className="no-results-message">
                    <AlertCircle size={16} />
                    <span>{searchResults.web_search_suggestion.message}</span>
                  </div>
                  
                  <div className="web-search-links">
                    <a
                      href={searchResults.web_search_suggestion.google_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="web-search-link google"
                    >
                      <ExternalLink size={16} />
                      Search on Google News
                    </a>
                    
                    <a
                      href={searchResults.web_search_suggestion.bing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="web-search-link bing"
                    >
                      <ExternalLink size={16} />
                      Search on Bing News
                    </a>
                    
                    <a
                      href={searchResults.web_search_suggestion.duckduckgo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="web-search-link duckduckgo"
                    >
                      <ExternalLink size={16} />
                      Search on DuckDuckGo
                    </a>
                  </div>
                  
                  <div className="search-tip">
                    💡 {searchResults.web_search_suggestion.tip}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}