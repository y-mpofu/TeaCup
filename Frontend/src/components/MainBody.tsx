// Frontend/src/components/MainBody.tsx
// Updated MainBody component with beautiful teapot loading animation

import React, { useState, useEffect } from 'react'
import NewsSection from './NewsSection'
import TeapotLoading3D from './TeapotLoading3D' // Import our new loading component
import { newsApiService } from '../services/newsApiService'
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
 * Now fetches data from the FastAPI backend with beautiful teapot loading animation
 */
export default function MainBody({ onPlayStory }: MainBodyProps) {
  // State for storing news data from the backend
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
   * Load news data from the backend when component mounts
   */
  useEffect(() => {
    loadNewsData();
  }, []);

  /**
   * Main function to load news data from backend
   */
  const loadNewsData = async (): Promise<void> => {
    try {
      console.log("🫖 TeaCup: Starting to load news data from backend...");
      setIsLoading(true);
      setError(null);
      setLoadingMessage("Let him cook....");
      // First, check if backend is available
      const isBackendHealthy = await newsApiService.checkBackendHealth();
      
      if (!isBackendHealthy) {
        throw new Error(
          "Cannot connect to TeaCup backend server. Please make sure the backend is running on http://localhost:8000"
        );
      }

      setBackendConnected(true);
      setLoadingMessage("Backend connected! Loading fresh news...");
      console.log(" Backend connection established!");

      // Load news data category by category for better user experience
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

      console.log(` Loading news for ${categories.length} categories...`);

      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        
        // Update loading message to show progress
        setLoadingMessage(`Loading ${category} news... (${i + 1}/${categories.length})`);
        
        try {
          // Fetch articles for this category
          const articles = await newsApiService.fetchNewsByCategory(category, max_articles_per_section);

          // Update state with new articles for this category
          setNewsData((prevData) => ({
            ...prevData,
            [category]: articles,
          }));

          console.log(` Loaded ${articles.length} articles for ${category}`);

          // Small delay between categories for smooth loading experience
          await new Promise((resolve) => setTimeout(resolve, 400));
        } catch (error) {
          console.error(` Failed to load ${category} news:`, error);
          // Continue with other categories even if one fails
        }
      }

      setLoadingMessage("Finalizing your news experience...");
      
      // Final delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 5000));
      
      setIsLoading(false);
      console.log(" Finished loading all news data from backend!");

    } catch (error) {
      console.error(" Error loading news data:", error);
      setError(error instanceof Error ? error.message : "Failed to load news data");
      setIsLoading(false);
    }
  };

  /**
   * Handle when user wants to read the full article
   */
  const handleReadStory = (articleId: string): void => {
    console.log("📖 Read button clicked for article:", articleId);

    // Find the article to get its source URL
    let article: NewsArticle | null = null;
    for (const categoryArticles of Object.values(newsData)) {
      const found = categoryArticles.find((a) => a.id === articleId);
      if (found) {
        article = found;
        break;
      }
    }

    if (article && article.sourceUrl) {
      // Open the original article in a new tab
      window.open(article.sourceUrl, "_blank");
      console.log(" Opened article source:", article.sourceUrl);
    } else {
      console.log("  No source URL available for this article");
      // TODO: Could implement a modal to show the full article content
    }
  };

  /**
   * Handle when user wants to save an article
   */
  const handleSaveStory = (articleId: string): void => {
    console.log(" Save button clicked for article:", articleId);

    try {
      // Get existing saved stories from localStorage
      const savedStories = JSON.parse(
        localStorage.getItem("teacup_saved_stories") || "[]"
      );

      // Add this article if not already saved
      if (!savedStories.includes(articleId)) {
        savedStories.push(articleId);
        localStorage.setItem("teacup_saved_stories", JSON.stringify(savedStories));
        console.log(" Article saved to reading list");
      } else {
        console.log("  Article already in reading list");
      }
    } catch (error) {
      console.error(" Error saving article:", error);
    }
  };

  /**
   * Handle when user clicks the play button on a news card
   */
  const handlePlayAudio = (articleId: string): void => {
    console.log(" Play button clicked for article:", articleId);

    // Find the article in our news data
    let article: NewsArticle | null = null;
    for (const categoryArticles of Object.values(newsData)) {
      const found = categoryArticles.find((a) => a.id === articleId);
      if (found) {
        article = found;
        break;
      }
    }

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
      console.log(" Started playing story:", article.title);
    } else {
      console.warn("  Article not found for playback:", articleId);
    }
  };

  /**
   * Retry loading data when there's an error
   */
  const handleRetry = (): void => {
    console.log(" Retrying data load...");
    loadNewsData();
  };

  // Show beautiful teapot loading animation while fetching data
// Replace this section in MainBody.tsx:
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
          <div className="error-icon"></div>
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
      {/* Breaking News Section - Show if we have breaking news */}
      {(() => {
        // Find all breaking news articles across categories
        const breakingNews = Object.values(newsData)
          .flat()
          .filter(article => article.isBreaking)
          .slice(0, max_articles_per_section); // Limit to 18 breaking news items

        if (breakingNews.length > 0) {
          return (
            <NewsSection
              title=" Breaking News"
              subtitle="Latest urgent updates and developing stories"
              articles={breakingNews}
              maxArticles={max_articles_per_section}
              onReadStory={handleReadStory}
              onSaveStory={handleSaveStory}
              onPlayAudio={handlePlayAudio}
              currentlyPlaying={currentlyPlaying ?? undefined}
              layout="hero"
              showEmoji={true}
            />
          );
        }
        return null;
      })()}

      {/* Politics Section */}
      <NewsSection
        title=" Politics"
        subtitle="Political developments, government news, and policy updates"
        articles={newsData.politics || []}
        maxArticles={max_articles_per_section}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Local Trends Section */}
      <NewsSection
        title=" Local Spills"
        subtitle="Community news, local trends, and regional developments"
        articles={newsData['local-trends'] || []}
        maxArticles={max_articles_per_section}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Sports Section */}
      <NewsSection
        title=" Sports"
        subtitle="Sports news, match results, and athletic achievements"
        articles={newsData.sports || []}
        maxArticles={max_articles_per_section}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Health Section */}
      <NewsSection
        title=" Health"
        subtitle="Health updates, medical news, and wellness information"
        articles={newsData.health || []}
        maxArticles={max_articles_per_section}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Business Section */}
      <NewsSection
        title=" Business"
        subtitle="Business news, economic updates, and market developments"
        articles={newsData.business || []}
        maxArticles={max_articles_per_section}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Technology Section */}
      <NewsSection
        title=" Technology"
        subtitle="Tech updates, digital innovations, and IT developments"
        articles={newsData.technology || []}
        maxArticles={max_articles_per_section}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Weather Section */}
      <NewsSection
        title=" Weather"
        subtitle="Weather forecasts, climate updates, and environmental news"
        articles={newsData.weather || []}
        maxArticles={max_articles_per_section}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Entertainment Section */}
      <NewsSection
        title=" Entertainment"
        subtitle="Arts, culture, music, and entertainment news"
        articles={newsData.entertainment || []}
        maxArticles={max_articles_per_section}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Education Section */}
      <NewsSection
        title=" Education"
        subtitle="Educational developments, school news, and academic updates"
        articles={newsData.education || []}
        maxArticles={18}
        onReadStory={handleReadStory}
        onSaveStory={handleSaveStory}
        onPlayAudio={handlePlayAudio}
        currentlyPlaying={currentlyPlaying ?? undefined}
        layout="spotify"
        showEmoji={true}
      />

      {/* Show teapot loading for progressive loading */}
      {isLoading && (
        <div className="progressive-loading">
          <TeapotLoading3D
            message="Adding more stories to your cup..."
            subtitle="Almost ready to serve!"
          />
        </div>
      )}
    </div>
  );
}