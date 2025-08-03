// Frontend/src/layout/BottomBar.tsx
// Fixed BottomBar component with proper interface definitions
// This component handles the audio player at the bottom of the screen

import React from 'react';
import { Play, Pause, SkipForward, X } from 'lucide-react';
import '../styles/bottombar.css';

// Define the story interface that matches what App.tsx uses
interface Story {
  id: string;
  title: string;
  category: string;
  thumbnail?: string;
}

// Define the props interface for the BottomBar component
interface BottomBarProps {
  story: Story;                          // The currently playing story
  onClose: () => void;                   // Function to close the bottom bar
  onPlayPause: () => void;              // Function to toggle play/pause
  onSkip: () => void;                   // Function to skip to next story
  isPlaying?: boolean;                  // Optional: current play state
}

/**
 * BottomBar component - Audio player that appears at bottom of screen
 * Shows currently playing story with audio controls
 */
export default function BottomBar({ 
  story, 
  onClose, 
  onPlayPause, 
  onSkip,
  isPlaying = false 
}: BottomBarProps) {
  
  /**
   * Get category initial for thumbnail placeholder
   */
  const getCategoryInitial = (category: string): string => {
    return category.charAt(0).toUpperCase();
  };

  /**
   * Format category name for display
   */
  const formatCategory = (category: string): string => {
    return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bottom-bar visible">
      {/* Story Information Section */}
      <div className="story-info-section">
        <div className="story-thumbnail">
          {story.thumbnail ? (
            <img 
              src={story.thumbnail} 
              alt={story.title}
              onError={(e) => {
                // If image fails to load, show placeholder
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextSibling && ((target.nextSibling as HTMLElement).style.display = 'flex');
              }}
            />
          ) : null}
          <div 
            className="thumbnail-placeholder" 
            style={{ display: story.thumbnail ? 'none' : 'flex' }}
          >
            <span className="category-initial">
              {getCategoryInitial(story.category)}
            </span>
          </div>
        </div>
        
        <div className="story-details">
          <h3 className="story-title">{story.title}</h3>
          <p className="story-category">{formatCategory(story.category)}</p>
        </div>
      </div>

      {/* Audio Controls Section */}
      <div className="audio-controls">
        <div className="control-buttons">
          {/* Play/Pause Button */}
          <button
            className="control-btn play-pause-btn"
            onClick={onPlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Skip Button */}
          <button
            className="control-btn skip-btn"
            onClick={onSkip}
            aria-label="Skip to next story"
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Progress Bar Placeholder */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '30%' }}></div>
          </div>
          <div className="time-display">
            <span className="current-time">1:23</span>
            <span className="total-time">4:56</span>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <button
        className="control-btn close-btn"
        onClick={onClose}
        aria-label="Close audio player"
      >
        <X size={20} />
      </button>
    </div>
  );
}