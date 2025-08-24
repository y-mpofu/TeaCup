// Frontend/src/components/MainBody.tsx
// ENHANCED: MainBody component with dynamic article limits per category
// Added section IDs for sidebar scroll targeting - no other changes

import React, { useState, useEffect } from 'react'
import NewsSection from './NewsSection'
import TeapotLoading3D from './TeapotLoading3D'
import { newsApiService } from '../services/newsApiService'
import { newsCacheService } from '../services/newsCacheService'
import type { NewsArticle } from '../services/newsApiService'

/**
 * 🎯 DYNAMIC ARTICLE LIMITS CONFIGURATION
 * 
 * High-priority categories get more articles for deeper coverage:
 * - Politics: 40 articles (government, policy, elections)
 * - Education: 40 articles (schools, universities, academic news)
 * - Health: 40 articles (medical, healthcare, wellness)
 * 
 * Standard categories get fewer articles for balanced coverage:
 * - All others: 10 articles each
 */
const CATEGORY_ARTICLE_LIMITS: Record<string, number> = {
  'politics': 30,        // 🏛️ High priority - government & policy
  'education': 40,       // 🎓 High priority - schools & universities
  'health': 40,          // 🏥 High priority - medical & healthcare
  'sports': 10,          // ⚽ Standard priority
  'business': 10,        // 💼 Standard priority
  'technology': 10,      // 💻 Standard priority
  'local-trends': 10,    // 📱 Standard priority
  'weather': 0,         // 🌤️ Standard priority
  'entertainment': 10    // 🎬 Standard priority
};

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
 * Enhanced MainBody component with dynamic article limits and scroll targeting
 * 
 * Features:
 * - Dynamic article limits per category (40 for priority, 10 for others)
 * - 🎯 Section IDs for sidebar scroll navigation
 * - Caching system to prevent unnecessary reloads
 * - Progressive loading with category-specific feedback
 * - Responsive section rendering based on available content
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
  const [loadingProgress, setLoadingProgress] = useState(0);

  /**
   * Load news data - either from cache or fresh from backend
   */
  useEffect(() => {
    initializeNewsData();
  }, []);

  /**
   * Get the article limit for a specific category
   */
  const getArticleLimitForCategory = (category: string): number => {
    return CATEGORY_ARTICLE_LIMITS[category]; // Default to 10 if category not specified
  };

  /**
   * Initialize news data by checking cache first, then loading if needed
   */
  const initializeNewsData = async (): Promise<void> => {
    console.log(' MainBody: Initializing news data with dynamic limits...');
    
    // Log the article limits being used
    Object.entries(CATEGORY_ARTICLE_LIMITS).forEach(([category, limit]) => {
      console.log(` ${category}: ${limit} articles`);
    });
    
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

    // No valid cache, need to load fresh data
    console.log(' Loading fresh news data with dynamic limits...');
    await loadFreshNewsDataWithDynamicLimits();
  };

  /**
   * 🎯 ENHANCED: Load fresh news data with category-specific article limits
   */
  const loadFreshNewsDataWithDynamicLimits = async (): Promise<void> => {
    try {
      setLoadingMessage("Checking backend connection...");
      
      // Check if backend is available
      const isHealthy = await newsApiService.checkBackendHealth();
      if (!isHealthy) {
        setError('Backend server is not available. Please try again later.');
        setIsLoading(false);
        return;
      }

      setBackendConnected(true);
      setLoadingMessage("Backend connected! Loading news with enhanced coverage...");
      
      // Define categories in order of priority (high-volume categories first)
      const categories = [
        'politics',      // 40 articles - Priority category
        'education',     // 40 articles - Priority category  
        'health',        // 40 articles - Priority category
        'sports',        // 10 articles - Standard category
        'business',      // 10 articles - Standard category
        'technology',    // 10 articles - Standard category
        'local-trends',  // 10 articles - Standard category
        'weather',       // 10 articles - Standard category
        'entertainment'  // 10 articles - Standard category
      ];

      console.log(` Loading news for ${categories.length} categories with dynamic limits...`);

      // Create a fresh data object to build up
      const freshNewsData: Record<string, NewsArticle[]> = {};
      let totalArticlesLoaded = 0;
      const totalExpectedArticles = Object.values(CATEGORY_ARTICLE_LIMITS).reduce((sum, limit) => sum + limit, 0);

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const articleLimit = getArticleLimitForCategory(category);
        
        // Update loading message with category-specific info
        setLoadingMessage(`Loading ${category} articles... (${i + 1}/${categories.length})`);
        setLoadingProgress(Math.round((i / categories.length) * 100));
        
        try {
          console.log(` Fetching articles for ${category}...`);
          
          // Fetch articles for this category with its specific limit
          const articles = await newsApiService.safelyFetchNewsByCategory(category, articleLimit);

          // Add to our fresh data object
          freshNewsData[category] = articles;
          totalArticlesLoaded += articles.length;

          // Update state with new articles for this category (for live updates)
          setNewsData((prevData) => ({
            ...prevData,
            [category]: articles,
          }));

          console.log(` Loaded ${articles.length}/${articleLimit} articles for ${category}`);

          // Update progress based on articles loaded
          const progressPercent = Math.round((totalArticlesLoaded / totalExpectedArticles) * 100);
          setLoadingProgress(progressPercent);

          // Small delay between categories for smooth loading experience
          await new Promise((resolve) => setTimeout(resolve, 300));
          
        } catch (error) {
          console.error(` Failed to load ${category} news:`, error);
          // Initialize with empty array if category fails
          freshNewsData[category] = [];
        }
      }

      setLoadingMessage("Finalizing your enhanced news experience...");
      setLoadingProgress(95);
      
      // Cache the complete dataset with dynamic limits
      newsCacheService.setCachedData(freshNewsData);
      
      // Final delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setLoadingProgress(100);
      setIsLoading(false);
      
      console.log(` Finished loading all news data with dynamic limits!`);
      console.log(` Total articles loaded: ${totalArticlesLoaded}/${totalExpectedArticles}`);

    } catch (error) {
      console.error(" Error loading news data with dynamic limits:", error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsLoading(false);
    }
  };

  /**
   * Handle manual refresh button click
   */
  const handleRefresh = async () => {
    console.log(' Manual refresh triggered with dynamic limits');
    setIsLoading(true);
    setLoadingProgress(0);
    
    // Clear cache to force fresh data load
    newsCacheService.clearCache();
    
    await loadFreshNewsDataWithDynamicLimits();
  };

  /**
   * Handle when user wants to read a full story
   */
  const handleReadStory = (articleId: string) => {
    console.log(' Reading story:', articleId);
    // Story reading logic would go here
  };

  /**
   * Handle when user wants to save a story
   */
  const handleSaveStory = (articleId: string) => {
    console.log(' Saving story:', articleId);
    // Story saving logic would go here
  };

  /**
   * Handle when user wants to play audio for a story
   */
  const handlePlayAudio = (articleId: string) => {
    console.log(' Playing audio for story:', articleId);
    
    // Update currently playing state
    setCurrentlyPlaying(currentlyPlaying === articleId ? null : articleId);
    
    // Call parent handler if provided
    if (onPlayStory) {
      // Find the article to get full story data
      const article = Object.values(newsData)
        .flat()
        .find(a => a.id === articleId);
      
      if (article) {
        onPlayStory({
          id: article.id,
          title: article.title,
          category: article.category,
          thumbnail: article.imageUrl
        });
      }
    }
  };

  // Enhanced loading state with progress
  if (isLoading) {
    return (
      <div className="main-body-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <TeapotLoading3D message={loadingMessage} />
          
          {/* Progress bar for dynamic loading */}
          <div style={{
            marginTop: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            height: '8px',
            maxWidth: '300px',
            margin: '1rem auto'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              height: '100%',
              width: `${loadingProgress}%`,
              transition: 'width 0.3s ease',
              borderRadius: '10px'
            }} />
          </div>
          
          <p style={{ 
            color: '#888', 
            fontSize: '0.9rem', 
            marginTop: '0.5rem' 
          }}>
            {loadingProgress}% • Enhanced coverage for priority categories
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="main-body-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button 
              className="retry-button"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? 'Retrying...' : ' Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render with 🎯 section IDs for sidebar scroll targeting
  return (
    <div className="main-body-container">
      {/* Breaking News Section */}
      {(() => {
        const breakingNews = Object.values(newsData)
          .flat()
          .filter(article => article.isBreaking)
          .slice(0, 8);

        if (breakingNews.length > 0) {
          return (
            <div id="breaking-news-section" className="news-section-container">
              <NewsSection
                title="Breaking News"
                subtitle="Latest urgent updates and developing stories"
                articles={breakingNews}
                onReadStory={handleReadStory}
                onSaveStory={handleSaveStory}
                onPlayAudio={handlePlayAudio}
                currentlyPlaying={currentlyPlaying ?? ''}
              />
            </div>
          );
        }
        return null;
      })()}

      {/* 🎯 Politics Section - Scroll target */}
      {newsData.politics && newsData.politics.length > 0 && (
        <div id="politics-section" className="news-section-container">
          <NewsSection
            title="Politics"
            subtitle="Comprehensive political coverage • Government, elections, and policy updates"
            articles={newsData.politics}
            onReadStory={handleReadStory}
            onSaveStory={handleSaveStory}
            onPlayAudio={handlePlayAudio}
            currentlyPlaying={currentlyPlaying ?? ''}
          />
        </div>
      )}

      {/* Education Section */}
      {newsData.education && newsData.education.length > 0 && (
        <div id="education-section" className="news-section-container">
          <NewsSection
            title="Education"
            subtitle="Comprehensive education coverage • Schools, universities, and academic updates"
            articles={newsData.education}
            onReadStory={handleReadStory}
            onSaveStory={handleSaveStory}
            onPlayAudio={handlePlayAudio}
            currentlyPlaying={currentlyPlaying ?? ''}
          />
        </div>
      )}

      {/* 🎯 Health Section - Scroll target */}
      {newsData.health && newsData.health.length > 0 && (
        <div id="health-section" className="news-section-container">
          <NewsSection
            title="Health"
            subtitle="Comprehensive health coverage • Medical breakthroughs, healthcare, and wellness"
            articles={newsData.health}
            onReadStory={handleReadStory}
            onSaveStory={handleSaveStory}
            onPlayAudio={handlePlayAudio}
            currentlyPlaying={currentlyPlaying ?? ''}
          />
        </div>
      )}

      {/* Sports Section */}
      {newsData.sports && newsData.sports.length > 0 && (
        <div id="sports-section" className="news-section-container">
          <NewsSection
            title="Sports"
            subtitle="Sports highlights • Scores, matches, and athletic achievements"
            articles={newsData.sports}
            onReadStory={handleReadStory}
            onSaveStory={handleSaveStory}
            onPlayAudio={handlePlayAudio}
            currentlyPlaying={currentlyPlaying ?? ''}
          />
        </div>
      )}

      {/* 🎯 Business Section - Scroll target (for Global) */}
      {newsData.business && newsData.business.length > 0 && (
        <div id="business-section" className="news-section-container">
          <NewsSection
            title="Business"
            subtitle="Market updates • Financial news and business insights"
            articles={newsData.business}
            onReadStory={handleReadStory}
            onSaveStory={handleSaveStory}
            onPlayAudio={handlePlayAudio}
            currentlyPlaying={currentlyPlaying ?? ''}
          />
        </div>
      )}

      {/* Technology Section */}
      {newsData.technology && newsData.technology.length > 0 && (
        <div id="technology-section" className="news-section-container">
          <NewsSection
            title="Technology"
            subtitle="Tech highlights • Innovation and digital transformation"
            articles={newsData.technology}
            onReadStory={handleReadStory}
            onSaveStory={handleSaveStory}
            onPlayAudio={handlePlayAudio}
            currentlyPlaying={currentlyPlaying ?? ''}
          />
        </div>
      )}

      {/* 🎯 Local Trends Section - Scroll target (for Local Spills) */}
      {newsData['local-trends'] && newsData['local-trends'].length > 0 && (
        <div id="local-trends-section" className="news-section-container">
          <NewsSection
            title="Local Trends"
            subtitle="Community highlights • What's happening locally"
            articles={newsData['local-trends']}
            onReadStory={handleReadStory}
            onSaveStory={handleSaveStory}
            onPlayAudio={handlePlayAudio}
            currentlyPlaying={currentlyPlaying ?? ''}
          />
        </div>
      )}

      {/* Weather Section */}
      {newsData.weather && newsData.weather.length > 0 && (
        <div id="weather-section" className="news-section-container">
          <NewsSection
            title="Weather"
            subtitle="Weather updates • Climate and seasonal news"
            articles={newsData.weather}
            onReadStory={handleReadStory}
            onSaveStory={handleSaveStory}
            onPlayAudio={handlePlayAudio}
            currentlyPlaying={currentlyPlaying ?? ''}
          />
        </div>
      )}

      {/* Entertainment Section */}
      {newsData.entertainment && newsData.entertainment.length > 0 && (
        <div id="entertainment-section" className="news-section-container">
          <NewsSection
            title="Entertainment"
            subtitle="Entertainment highlights • Movies, music, and pop culture"
            articles={newsData.entertainment}
            onReadStory={handleReadStory}
            onSaveStory={handleSaveStory}
            onPlayAudio={handlePlayAudio}
            currentlyPlaying={currentlyPlaying ?? ''}
          />
        </div>
      )}

      {/* Enhanced Footer */}
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#888',
        fontSize: '0.9rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '2rem'
      }}>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
           Refresh for the latest updates • ⚡ Powered by TeaCup News
        </p>
      </div>
    </div>
  );
}