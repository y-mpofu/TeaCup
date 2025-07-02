import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Maximize2 } from 'lucide-react'
import '../styles/bottombar.css'

interface Story {
  id: string
  title: string
  category: string
  thumbnail?: string
}

interface BottomBarProps {
  story: Story | null
  isVisible: boolean
  onClose: () => void
}

export default function BottomBar({ story, isVisible, onClose }: BottomBarProps) {
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null)

  // Handle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        setIsLoading(true)
        audioRef.current.play().catch(() => {
          setIsLoading(false)
          console.error('Failed to play audio')
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('waiting', handleWaiting)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('waiting', handleWaiting)
    }
  }, [story])

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Format time display
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!isVisible || !story) {
    return null
  }

  return (
    <>
      {/* Audio element - hidden */}
      <audio 
        ref={audioRef} 
        src={`/api/stories/${story.id}/audio`} // Replace with your audio endpoint
        preload="metadata"
      />

      {/* Bottom bar container */}
      <div className={`bottom-bar ${isVisible ? 'visible' : ''}`}>
        {/* Story information */}
        <div className="story-info-section">
          {/* Story thumbnail */}
          <div className="story-thumbnail">
            {story.thumbnail ? (
              <img src={story.thumbnail} alt={story.title} />
            ) : (
              <div className="thumbnail-placeholder">
                <div className="category-initial">
                  {story.category.charAt(0)}
                </div>
              </div>
            )}
          </div>

          {/* Story details */}
          <div className="story-details">
            <h4 className="story-title">{story.title}</h4>
            <p className="story-category">{story.category}</p>
          </div>
        </div>

        {/* Audio controls */}
        <div className="audio-controls">
          {/* Main control buttons */}
          <div className="control-buttons">
            <button className="control-btn" disabled>
              <SkipBack size={20} />
            </button>
            
            <button 
              className="play-pause-btn" 
              onClick={togglePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : isPlaying ? (
                <Pause size={24} />
              ) : (
                <Play size={24} />
              )}
            </button>
            
            <button className="control-btn" disabled>
              <SkipForward size={20} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="progress-section">
            <span className="time-display">{formatTime(currentTime)}</span>
            <div className="progress-bar" onClick={handleProgressClick}>
              <div className="progress-track">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
                <div 
                  className="progress-thumb"
                  style={{ left: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <span className="time-display">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume and actions */}
        <div className="volume-actions">
          {/* Volume control */}
          <div className="volume-control">
            <button className="volume-btn" onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>

          {/* Action buttons */}
          <div className="action-buttons">
            <button className="action-btn" title="Expand player">
              <Maximize2 size={20} />
            </button>
            
            <button className="action-btn close-btn" onClick={onClose} title="Close player">
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}