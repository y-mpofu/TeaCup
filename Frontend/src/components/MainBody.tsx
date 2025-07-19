// Frontend/src/components/MainBody.tsx
// Updated MainBody component with caching to prevent unnecessary reloads
// Now only loads data once unless cache expires or is manually refreshed

import React, { useState, useEffect } from 'react'
import NewsSection from './NewsSection'
import TeapotLoading3D from './TeapotLoading3D'
import { newsApiService } from '../services/newsApiService'
import { newsCacheService } from '../services/newsCacheService' // Import our new cache service
import type { NewsArticle } from '../services/newsApiService'

const max_articles_per_section = 18;

// Define the Story interface to match what App.tsx expects
interface Story {
  id: string;
  title: string;
  category: string;
  thumbnail?: string;
}

// Define the props this component expects
interface MainBodyProps {
  onPlayStory?: (story: Story) => void;
}

/**
 * MainBody component that displays news sections
 * Now uses caching to prevent reloading when navigating back to home
 */
export default function MainBody({ onPlayStory }: MainBodyProps) {
  // State for storing news data
  const [newsData, setNewsData] = useState<Record<string, NewsArticle[]>>({
    'politics': [],
    'sports': [],
    'health': [],
    'business': [],
    'technology': [],
    'local-trends': [],
    'weather': [],
    'entertainment': [],
    'education': []
  });

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Brewing Your Perfect Cup...");

  /**
   * Load news data - either from cache or fresh from backend
   */
  useEffect(() => {
    initializeNewsData();
  }, []);

  /**
   * Initialize news data by checking cache first, then loading if needed
   */
  const initializeNewsData = async (): Promise<void> => {
    console.log('🏠 MainBody: Initializing news data...');
    
    // First, check if we have valid cached data
    if (newsCacheService.hasValidCache()) {
      const cachedData = newsCacheService.getCachedData();
      if (cachedData) {
        console.log('⚡ Using cached data - no reload needed!');
        setNewsData(cachedData);
        setIsLoading(false);
        setBackendConnected(true);
        return;
      }
    }

    // If no valid cache, check if data is already being loaded by another instance
    if (newsCacheService.isCurrentlyLoading()) {
      console.log('⏳ Data already loading, waiting...');
      
      // Wait for loading to complete by polling the cache
      const pollForData = async () => {
        while (newsCacheService.isCurrentlyLoading()) {
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
        }
        
        // Loading finished, get the data
        const freshData = newsCacheService.getCachedData();
        if (freshData) {
          console.log('✅ Loading completed, using fresh data');
          setNewsData(freshData);
          setIsLoading(false);
          setBackendConnected(true);
        } else {
          console.log('❌ Loading failed, will retry');
          loadNewsData();
        }
      };
      
      pollForData();
      return;
    }

    // No cache and not loading, so load fresh data
    console.log('🔄 No cache found, loading fresh data...');
    loadNewsData();
  };

  /**
   * Load fresh news data from backend
   */
  const loadNewsData = async (): Promise<void> => {
    try {
      console.log("🫖 TeaCup: Loading fresh news data from backend...");
      setIsLoading(true);
      setError(null);
      setLoadingMessage("Let him cook....");
      
      // Mark in cache that we're loading
      newsCacheService.setLoadingState(true);

      // First, check if backend is available
      const isBackendHealthy = await newsApiService.checkBackendHealth();
      
      if (!isBackendHealthy) {
        throw new Error(
          "Cannot connect to TeaCup backend server. Please make sure the backend is running on http://localhost:8000"
        );
      }

      setBackendConnected(true);
      setLoadingMessage("Backend connected! Loading fresh news...");
      console.log("✅ Backend connection established!");

      // Load news data category by category
      const categories = [
        'politics',
        'sports', 
        'health',
        'business',
        'technology',
        'local-trends',
        'weather',
        'entertainment',
        'education'
      ];

      console.log(`📰 Loading news for ${categories.length} categories...`);

      // Create a fresh data object to build up
      const freshNewsData: Record<string, NewsArticle[]> = {};

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        
        // Update loading message to show progress
        setLoadingMessage(`Loading ${category} news... (${i + 1}/${categories.length})`);
        
        try {
          // Fetch articles for this category
          const articles = await newsApiService.fetchNewsByCategory(category, max_articles_per_section);

          // Add to our fresh data object
          freshNewsData[category] = articles;

          // Update state with new articles for this category (for live updates)
          setNewsData((prevData) => ({
            ...prevData,
            [category]: articles,
          }));

          console.log(`✅ Loaded ${articles.length} articles for ${category}`);

          // Small delay between categories for smooth loading experience
          await new Promise((resolve) => setTimeout(resolve, 400));
        } catch (error) {
          console.error(`❌ Failed to load ${category} news:`, error);
          // Initialize with empty array if category fails
          freshNewsData[category] = [];
        }
      }

      setLoadingMessage("Finalizing your news experience...");
      
      // Cache the complete dataset
      newsCacheService.setCachedData(freshNewsData);
      newsCacheService.setLoadingState(false);
      
      // Final delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsLoading(false);
      console.log("🎉 Finished loading all news data from backend!");

    } catch (error) {
      console.error("❌ Error loading news data:", error);
      setError(error instanceof Error ? error.message : "Failed to load news data");
      setIsLoading(false);
      setBackendConnected(false);
      
      // Mark loading as finished even if failed
      newsCacheService.setLoadingState(false);
    }
  };

  /**
   * Function to handle reading a full story
   */
  const handleReadStory = (articleId: string): void => {
    console.log(`📖 Reading full story: ${articleId}`);
    // TODO: Implement full story reading functionality
  };

  /**
   * Function to handle saving a story
   */
  const handleSaveStory = (articleId: string): void => {
    console.log(`💾 Saving story: ${articleId}`);
    // TODO: Implement story saving functionality
  };

  /**
   * Function to handle playing audio for a story
   */
  const handlePlayAudio = (articleId: string): void => {
    // Find the article across all categories
    const article = Object.values(newsData)
      .flat()
      .find(article => article.id === articleId);

    if (article && onPlayStory) {
      // Set currently playing state for visual feedback
      setCurrentlyPlaying(articleId);

      // Convert NewsArticle to Story format expected by App.tsx
      const story: Story = {
        id: article.id,
        title: article.title,
        category: article.category,
        thumbnail: article.imageUrl
      };

      // Call the parent function to show the bottom bar and play audio
      onPlayStory(story);
      console.log("🎵 Started playing story:", article.title);
    } else {
      console.warn("⚠️ Article not found for playback:", articleId);
    }
  };

  /**
   * Retry loading data when there's an error
   */
  const handleRetry = (): void => {
    console.log("🔄 Retrying data load...");
    newsCacheService.clearCache(); // Clear cache to force fresh load
    loadNewsData();
  };

  /**
   * Refresh news data by telling backend to fetch fresh data
   */
  const handleBackendRefresh = async (): Promise<void> => {
    try {
      console.log("🔄 Starting backend refresh process...");
      setLoadingMessage("Telling backend to fetch fresh news...");
      setIsLoading(true);
      setError(null);

      // First, tell the backend to refresh its data
      const refreshResult = await newsApiService.refreshBackendNews();
      
      if (!refreshResult.success) {
        throw new Error(refreshResult.message);
      }

      console.log("✅ Backend refresh completed, now fetching updated data");
      setLoadingMessage("Backend refreshed! Loading updated news...");

      // Clear cache to force fresh load
      newsCacheService.forceRefresh();

      // Small delay to let backend process the refresh
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Now load the fresh data
      await loadNewsData();

    } catch (error) {
      console.error("❌ Backend refresh failed:", error);
      setError(error instanceof Error ? error.message : "Failed to refresh backend");
      setIsLoading(false);
    }
  };

  /**
   * Force refresh data (clear cache and reload from current backend data)
   */
  const handleCacheRefresh = (): void => {
    console.log("🔄 Cache refresh - reloading from current backend data...");
    newsCacheService.forceRefresh();
    loadNewsData();
  };

  // Show loading animation while fetching data (only if no cached data)
  if (isLoading && Object.values(newsData).every(articles => articles.length === 0)) {
    return (
      <div className="main-body">
        <TeapotLoading3D 
          message={loadingMessage}
          subtitle={backendConnected 
            ? "Steeping the perfect blend of stories for you" 
            : "Making the tea for you..."
          }
        />
      </div>
    );
  }

  // Show error state if backend connection failed
  if (error) {
    return (
      <div className="main-body">
        <div className="error-container">
          <div className="error-icon">🫖</div>
          <h2 className="error-title">Oops! The tea kettle is cold</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button className="retry-button" onClick={handleRetry}>
              Turn back on and try again
            </button>
            <p className="error-help">
              Make sure your backend server is running: <code>python main.py</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main render: Display all news sections
  return (
    <div className="main-body-container">
      {/* Debug info - only show in development */}
      {(() => {
        // Check if we're in development mode
        const isDevelopment = typeof process !== 'undefined' && 
                             process.env && 
                             (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV);
        
        if (!isDevelopment) return null;
        
        return (
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            padding: '8px', 
            backgroundColor: '#f5f5f5',
            marginBottom: '10px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span>Cache: {newsCacheService.getCacheStatus()}</span>
            <button 
              onClick={handleCacheRefresh}
              style={{ 
                fontSize: '11px', 
                padding: '4px 8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Reload Cache
            </button>
            <button 
              onClick={handleBackendRefresh}
              disabled={isLoading}
              style={{ 
                fontSize: '11px', 
                padding: '4px 8px',
                backgroundColor: isLoading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Refreshing...' : 'Fresh News'}
            </button>
          </div>
        );
      })()}

      {/* Breaking News Section - Show if we have breaking news */}
      {(() => {
        // Find all breaking news articles across categories
        const breakingNews = Object.values(newsData)
          .flat()
          .filter(article => article.isBreaking)
          .slice(0, 6); // Limit to 6 breaking news items

        if (breakingNews.length > 0) {
          return (
            <NewsSection
              title="Breaking News"
              subtitle="Latest urgent updates and developing stories"
              articles={breakingNews}
              onReadStory={handleReadStory}
              onSaveStory={handleSaveStory}
              onPlayAudio={handlePlayAudio}
              currentlyPlaying={currentlyPlaying ?? ''}
            />
          );
        }
        return null;
      })()}

      {/* Politics Section */}
      {newsData.politics && newsData.politics.length > 0 && (
        <NewsSection
          title="Politics"
          subtitle="Latest political developments and policy updates"
          articles={newsData.politics}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? ''}
        />
      )}

      {/* Sports Section */}
      {newsData.sports && newsData.sports.length > 0 && (
        <NewsSection
          title="Sports"
          subtitle="Sports news, scores, and highlights"
          articles={newsData.sports}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? ''}
        />
      )}

      {/* Business Section */}
      {newsData.business && newsData.business.length > 0 && (
        <NewsSection
          title="Business"
          subtitle="Market updates, financial news, and business insights"
          articles={newsData.business}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? ''}
        />
      )}

      {/* Technology Section */}
      {newsData.technology && newsData.technology.length > 0 && (
        <NewsSection
          title="Technology"
          subtitle="Latest tech news, innovations, and digital trends"
          articles={newsData.technology}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? ''}
        />
      )}

      {/* Health Section */}
      {newsData.health && newsData.health.length > 0 && (
        <NewsSection
          title="Health"
          subtitle="Health news, medical breakthroughs, and wellness tips"
          articles={newsData.health}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? ''}
        />
      )}

      {/* Local Trends Section */}
      {newsData['local-trends'] && newsData['local-trends'].length > 0 && (
        <NewsSection
          title="Local Trends"
          subtitle="What's happening in your community"
          articles={newsData['local-trends']}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? ''}
        />
      )}

      {/* Weather Section */}
      {newsData.weather && newsData.weather.length > 0 && (
        <NewsSection
          title="Weather"
          subtitle="Weather updates and climate news"
          articles={newsData.weather}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? ''}
        />
      )}

      {/* Entertainment Section */}
      {newsData.entertainment && newsData.entertainment.length > 0 && (
        <NewsSection
          title="Entertainment"
          subtitle="Celebrity news, movies, music, and pop culture"
          articles={newsData.entertainment}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? ''}
        />
      )}

      {/* Education Section */}
      {newsData.education && newsData.education.length > 0 && (
        <NewsSection
          title="Education"
          subtitle="Educational news, research, and academic updates"
          articles={newsData.education}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? ''}
        />
      )}

      {/* Show message if no news data loaded */}
      {Object.values(newsData).every(articles => articles.length === 0) && !isLoading && (
        <div className="main-body">
          <div className="error-container">
            <div className="error-icon">📰</div>
            <h2 className="error-title">No News Available</h2>
            <p className="error-message">
              No news articles could be loaded at this time.
            </p>
            <div className="error-actions">
              <button className="retry-button" onClick={handleRetry}>
                Try Loading Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}