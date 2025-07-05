// // src/components/MainBody.tsx
// // Main content area with Spotify-inspired layout and Pan-African aesthetic

// import React, { useState } from 'react'
// import NewsSection from './NewsSection'
// import {
//   politicalNews,
//   localTrends,
//   sportsNews,
//   healthNews,
//   getBreakingNews
// } from '../data/mockNews'
// import {
//   businessNews,
//   techNews,
//   weatherNews,
//   entertainmentNews,
//   educationNews
// } from '../data/additionalNews'
// import {
//   // ... your existing icons
//   Coffee,  // Add this to your existing import
// } from 'lucide-react'

// // Define the Story interface to match what's expected by App.tsx
// interface Story {
//   id: string
//   title: string
//   category: string
//   thumbnail?: string
// }

// // Define the props this component expects
// interface MainBodyProps {
//   onPlayStory?: (story: Story) => void
// }

// export default function MainBody({ onPlayStory }: MainBodyProps) {
//   // Track which story is currently playing for visual feedback
//   const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)

//   // Handle when user wants to read a story
//   const handleReadStory = (articleId: string) => {
//     console.log('Reading story:', articleId)
//     // TODO: Navigate to full story page or open story modal
//     // For now, we'll just log it
//   }

//   // Handle when user wants to save a story
//   const handleSaveStory = (articleId: string) => {
//     console.log('Saving story:', articleId)
//     // TODO: Add to saved stories list
//     // For now, we'll just log it
//   }

//   // Handle when user wants to play audio for a story
//   const handlePlayAudio = (articleId: string) => {
//     // Find the article in all our news arrays
//     const allNews = [
//       ...getBreakingNews(),
//       ...politicalNews,
//       ...localTrends,
//       ...weatherNews,
//       ...businessNews,
//       ...sportsNews,
//       ...techNews,
//       ...healthNews,
//       ...educationNews,
//       ...entertainmentNews
//     ]

//     const article = allNews.find(item => item.id === articleId)

//     if (article && onPlayStory) {
//       // Set currently playing state
//       setCurrentlyPlaying(articleId)

//       // Convert our NewsArticle to the Story format expected by BottomBar
//       const story = {
//         id: article.id,
//         title: article.title,
//         category: article.category,
//         thumbnail: article.imageUrl
//       }

//       // Call the function passed down from App.tsx to show the bottom bar
//       onPlayStory(story)
//     }
//   }

//   // Get breaking news to show at the top
//   const breakingNews = getBreakingNews()

//   return (
//     <div className="main-body-container">
//       <section className="breaking-news-header">
//         <h1 className="breaking-news-title">
//           <Coffee size={32} className="breaking-news-icon" />
//           Hot Spills
//         </h1>
//         <p className="breaking-news-subtitle">Stay updated with the latest developments</p>
//       </section>
//       {/* Hero section with breaking news */}
//       {breakingNews.length > 0 && (
//         <NewsSection
//           title=" Breaking News"
//           subtitle="Latest urgent updates and developing stories"
//           articles={breakingNews}
//           maxArticles={10}
//           onReadStory={handleReadStory}
//           onSaveStory={handleSaveStory}
//           onPlayAudio={handlePlayAudio}
//           currentlyPlaying={currentlyPlaying ?? undefined}
//           layout="hero"
//           showEmoji={true}
//         />
//       )}

//       {/* Politics Section */}
//       <NewsSection
//         title=" Politics"
//         subtitle="Government updates, policy changes, and political developments"
//         articles={politicalNews}
//         maxArticles={6}
//         onReadStory={handleReadStory}
//         onSaveStory={handleSaveStory}
//         onPlayAudio={handlePlayAudio}
//         currentlyPlaying={currentlyPlaying ?? undefined}
//         layout="spotify"
//         showEmoji={true}
//       />

//       {/* Weather Section */}
//       <NewsSection
//         title=" Weather"
//         subtitle="Weather updates, forecasts, and climate information"
//         articles={weatherNews}
//         maxArticles={4}
//         onReadStory={handleReadStory}
//         onSaveStory={handleSaveStory}
//         onPlayAudio={handlePlayAudio}
//         currentlyPlaying={currentlyPlaying ?? undefined}
//         layout="spotify"
//         showEmoji={true}
//       />

//       {/* Local Trends Section */}
//       <NewsSection
//         title=" Local Trends"
//         subtitle="Community stories and local developments"
//         articles={localTrends}
//         maxArticles={4}
//         onReadStory={handleReadStory}
//         onSaveStory={handleSaveStory}
//         onPlayAudio={handlePlayAudio}
//         currentlyPlaying={currentlyPlaying ?? undefined}
//         layout="spotify"
//         showEmoji={true}
//       />

//       {/* Business Section */}
//       <NewsSection
//         title=" Business & Economy"
//         subtitle="Economic news, business developments, and market updates"
//         articles={businessNews}
//         maxArticles={4}
//         onReadStory={handleReadStory}
//         onSaveStory={handleSaveStory}
//         onPlayAudio={handlePlayAudio}
//         currentlyPlaying={currentlyPlaying ?? undefined}
//         layout="spotify"
//         showEmoji={true}
//       />

//       {/* Sports Section */}
//       <NewsSection
//         title=" Sports"
//         subtitle="Latest scores, matches, and sports news"
//         articles={sportsNews}
//         maxArticles={4}
//         onReadStory={handleReadStory}
//         onSaveStory={handleSaveStory}
//         onPlayAudio={handlePlayAudio}
//         currentlyPlaying={currentlyPlaying ?? undefined}
//         layout="spotify"
//         showEmoji={true}
//       />

//       {/* Technology Section */}
//       <NewsSection
//         title=" Technology"
//         subtitle="Tech updates, digital innovations, and IT developments"
//         articles={techNews}
//         maxArticles={3}
//         onReadStory={handleReadStory}
//         onSaveStory={handleSaveStory}
//         onPlayAudio={handlePlayAudio}
//         currentlyPlaying={currentlyPlaying ?? undefined}
//         layout="spotify"
//         showEmoji={true}
//       />

//       {/* Health Section */}
//       <NewsSection
//         title="Health"
//         subtitle="Health updates, medical news, and wellness information"
//         articles={healthNews}
//         maxArticles={4}
//         onReadStory={handleReadStory}
//         onSaveStory={handleSaveStory}
//         onPlayAudio={handlePlayAudio}
//         currentlyPlaying={currentlyPlaying ?? undefined}
//         layout="spotify"
//         showEmoji={true}
//       />

//       {/* Education Section */}
//       <NewsSection
//         title="Education"
//         subtitle="Educational developments, school news, and academic updates"
//         articles={educationNews}
//         maxArticles={3}
//         onReadStory={handleReadStory}
//         onSaveStory={handleSaveStory}
//         onPlayAudio={handlePlayAudio}
//         currentlyPlaying={currentlyPlaying ?? undefined}
//         layout="spotify"
//         showEmoji={true}
//       />

//       {/* Entertainment Section */}
//       <NewsSection
//         title=" Entertainment"
//         subtitle="Arts, culture, music, and entertainment news"
//         articles={entertainmentNews}
//         maxArticles={3}
//         onReadStory={handleReadStory}
//         onSaveStory={handleSaveStory}
//         onPlayAudio={handlePlayAudio}
//         currentlyPlaying={currentlyPlaying ?? undefined}
//         layout="spotify"
//         showEmoji={true}
//       />
//     </div>
//   )
// }

// src/components/MainBody.tsx
// Updated to fetch real news from our backend API

import React, { useState, useEffect } from "react";
import NewsSection from "./NewsSection";
import { Coffee } from "lucide-react";

// Define the Story interface to match what's expected by App.tsx
interface Story {
  id: string;
  title: string;
  category: string;
  thumbnail?: string;
}

// Define the NewsArticle interface to match our backend response
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  timestamp: string;
  imageUrl?: string;
  readTime: string;
  isBreaking?: boolean;
  sourceUrl?: string;
  source?: string;
}

// Define the props this component expects
interface MainBodyProps {
  onPlayStory?: (story: Story) => void;
}

// API service to interact with our backend
class NewsApiService {
  private baseUrl: string;

  constructor() {
    // This is the URL where your backend server will be running
    this.baseUrl = "http://localhost:8000/api";
  }

  /**
   * Fetch news articles for a specific category
   */
  async fetchNewsByCategory(
    category: string,
    maxArticles: number = 5
  ): Promise<NewsArticle[]> {
    try {
      console.log(`Fetching ${category} news from backend...`);

      const response = await fetch(
        `${this.baseUrl}/news/${category}?max_articles=${maxArticles}` 
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log(
          `Successfully fetched ${data.articles.length} articles for ${category}`
        );
        return data.articles;
      } else {
        console.error(`Backend returned error for ${category}:`, data.error);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error);
      return [];
    }
  }

  /**
   * Fetch news for all categories at once
   */
  async fetchAllNews(): Promise<Record<string, NewsArticle[]>> {
    try {
      console.log("Fetching all news categories from backend...");

      const response = await fetch(`${this.baseUrl}/news/all`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log("Successfully fetched all news categories");
        return data.news;
      } else {
        console.error("Backend returned error for all news:", data.error);
        return {};
      }
    } catch (error) {
      console.error("Error fetching all news:", error);
      return {};
    }
  }

  /**
   * Check if the backend server is running
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error("Backend health check failed:", error);
      return false;
    }
  }
}

export default function MainBody({ onPlayStory }: MainBodyProps) {
  // State for tracking currently playing story
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  // State for storing news articles by category
  const [newsData, setNewsData] = useState<Record<string, NewsArticle[]>>({
    politics: [],
    sports: [],
    health: [],
    business: [],
    technology: [],
    "local-trends": [],
    entertainment: [],
    weather: [],
  });

  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create instance of our API service
  const newsApi = new NewsApiService();

  // Load news data when component mounts
  useEffect(() => {
    loadNewsData();
  }, []);

  /**
   * Main function to load all news data from backend
   */
  const loadNewsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First check if backend is running
      console.log("Checking backend connection...");
      const isHealthy = await newsApi.checkHealth();
      setBackendConnected(isHealthy);

      if (!isHealthy) {
        setError(
          "Backend server is not running. Please start the backend server."
        );
        setIsLoading(false);
        return;
      }

      console.log("Backend connected! Loading news data...");

      // Fetch news for each category individually for better user experience
      const categories = [
        "politics",
        "sports",
        "health",
        "business",
        "technology",
        "local-trends",
      ];

      for (const category of categories) {
        try {
          const articles = await newsApi.fetchNewsByCategory(category, 6);

          // Update state with new articles for this category
          setNewsData((prevData) => ({
            ...prevData,
            [category]: articles,
          }));

          console.log(`Loaded ${articles.length} articles for ${category}`);

          // Small delay to avoid overwhelming the backend
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to load ${category} news:`, error);
          // Continue with other categories even if one fails
        }
      }

      setIsLoading(false);
      console.log("Finished loading all news data");
    } catch (error) {
      console.error("Error loading news data:", error);
      setError("Failed to load news data. Please try again.");
      setIsLoading(false);
    }
  };

  /**
   * Handle when user wants to read a story
   */
  const handleReadStory = (articleId: string) => {
    console.log("Reading story:", articleId);

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
    } else {
      console.log("Article source URL not found");
      // TODO: You could implement a modal to show the full article content here
    }
  };

  /**
   * Handle when user wants to save a story
   */
  const handleSaveStory = (articleId: string) => {
    console.log("Saving story:", articleId);
    // TODO: Implement saved stories functionality
    // You could store saved article IDs in localStorage or send to backend
    const savedStories = JSON.parse(
      localStorage.getItem("savedStories") || "[]"
    );
    if (!savedStories.includes(articleId)) {
      savedStories.push(articleId);
      localStorage.setItem("savedStories", JSON.stringify(savedStories));
      console.log("Story saved to localStorage");
    }
  };

  /**
   * Handle when user wants to play audio for a story
   */
  const handlePlayAudio = (articleId: string) => {
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
      // Set currently playing state
      setCurrentlyPlaying(articleId);

      // Convert our NewsArticle to the Story format expected by BottomBar
      const story = {
        id: article.id,
        title: article.title,
        category: article.category,
        thumbnail: article.imageUrl,
      };

      // Call the function passed down from App.tsx to show the bottom bar
      onPlayStory(story);
    }
  };

  /**
   * Get breaking news (articles marked as breaking from any category)
   */
  const getBreakingNews = (): NewsArticle[] => {
    const allArticles = Object.values(newsData).flat();
    return allArticles.filter((article) => article.isBreaking);
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="main-body-container">
        <div
          className="loading-container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            color: "#888",
          }}
        >
          <Coffee
            size={48}
            className="loading-icon"
            style={{ marginBottom: "1rem" }}
          />
          <h2>Brewing Fresh News...</h2>
          <p>Please wait while we fetch the latest stories</p>
          {!backendConnected && (
            <p style={{ color: "#ff6b6b", marginTop: "1rem" }}>
              Connecting to backend server...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="main-body-container">
        <div
          className="error-container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            color: "#ff6b6b",
            textAlign: "center",
          }}
        >
          <h2>Unable to Load News</h2>
          <p>{error}</p>
          <button
            onClick={loadNewsData}
            style={{
              background: "#667eea",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const breakingNews = getBreakingNews();

  return (
    <div className="main-body-container">
      {/* Header section */}
      <section className="breaking-news-header">
        <h1 className="breaking-news-title">
          <Coffee size={32} className="breaking-news-icon" />
          Hot Spills
        </h1>
        <p className="breaking-news-subtitle">
          Stay updated with the latest developments
        </p>

        {/* Show connection status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.8rem",
            color: backendConnected ? "#4ade80" : "#ff6b6b",
            marginTop: "0.5rem",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: backendConnected ? "#4ade80" : "#ff6b6b",
            }}
          />
          {backendConnected ? "Live News Feed" : "Offline Mode"}
        </div>
      </section>

      {/* Breaking News Section */}
      {breakingNews.length > 0 && (
        <NewsSection
          title="Breaking News"
          subtitle="Latest urgent updates and developing stories"
          articles={breakingNews}
          maxArticles={5}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="hero"
          showEmoji={false}
        />
      )}

      {/* Politics Section */}
      {newsData.politics.length > 0 && (
        <NewsSection
          title="Politics"
          subtitle="Government updates, policy changes, and political developments"
          articles={newsData.politics}
          maxArticles={6}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="spotify"
        />
      )}

      {/* Sports Section */}
      {newsData.sports.length > 0 && (
        <NewsSection
          title="Sports"
          subtitle="Latest scores, matches, and sports news"
          articles={newsData.sports}
          maxArticles={6}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="spotify"
        />
      )}

      {/* Health Section */}
      {newsData.health.length > 0 && (
        <NewsSection
          title="Health"
          subtitle="Health updates, medical news, and wellness information"
          articles={newsData.health}
          maxArticles={6}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="spotify"
        />
      )}

      {/* Business Section */}
      {newsData.business.length > 0 && (
        <NewsSection
          title="Business & Economy"
          subtitle="Economic news, business developments, and market updates"
          articles={newsData.business}
          maxArticles={6}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="spotify"
        />
      )}

      {/* Technology Section */}
      {newsData.technology.length > 0 && (
        <NewsSection
          title="Technology"
          subtitle="Tech updates, digital innovations, and IT developments"
          articles={newsData.technology}
          maxArticles={6}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="spotify"
        />
      )}

      {/* Local Trends Section */}
      {newsData["local-trends"].length > 0 && (
        <NewsSection
          title="Local Trends"
          subtitle="Community stories and local developments"
          articles={newsData["local-trends"]}
          maxArticles={6}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="spotify"
        />
      )}

      {/* Entertainment Section */}
      {newsData.entertainment && newsData.entertainment.length > 0 && (
        <NewsSection
          title="Entertainment"
          subtitle="Arts, culture, music, and entertainment news"
          articles={newsData.entertainment}
          maxArticles={6}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="spotify"
        />
      )}

      {/* Weather Section */}
      {newsData.weather && newsData.weather.length > 0 && (
        <NewsSection
          title="Weather"
          subtitle="Weather updates, forecasts, and climate information"
          articles={newsData.weather}
          maxArticles={6}
          onReadStory={handleReadStory}
          onSaveStory={handleSaveStory}
          onPlayAudio={handlePlayAudio}
          currentlyPlaying={currentlyPlaying ?? undefined}
          layout="spotify"
        />
      )}
    </div>
  );
}
