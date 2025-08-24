// Frontend/src/components/NewsChat.tsx
// Enhanced chat component with retractable sidebar overlay functionality
// Uses ONLY existing variables - no new state variables introduced

import React, { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User, Minimize2, Loader2, AlertCircle, MessageCircle, ChevronLeft } from 'lucide-react'
// Import the correct NewsArticle type from your service
// Adjust this import based on your actual file structure
import type { NewsArticle } from '../services/newsApiService'
import '../styles/chat.css'

// Define message interface for chat
interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  isError?: boolean
}

// Define component props interface
interface NewsChatProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void  // NEW: Handler for opening chat from floating toggle
  article: NewsArticle  // This uses your actual NewsArticle type
}

/**
 * Enhanced NewsChat Component with Retractable Sidebar
 * 
 * NEW RETRACTABLE FEATURES:
 * - Uses existing isMinimized state for retraction behavior
 * - Floating chat toggle when fully closed
 * - Smooth slide-in/out animations
 * - Retracted tab mode shows minimal chat presence
 * - All existing functionality preserved
 * 
 * This component properly handles:
 * - Real API connections to the backend
 * - Error states when AI is unavailable
 * - Cached article content from the backend
 * - Clean paragraph formatting
 * - Proper authentication
 * - ENHANCED: Retractable sidebar overlay design
 */
export default function NewsChat({ isOpen, onClose, onOpen, article }: NewsChatProps) {
  // === EXISTING STATE MANAGEMENT (unchanged) ===
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false) // NOW USED FOR RETRACTION
  const [conversationContext, setConversationContext] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [aiAvailable, setAiAvailable] = useState<boolean>(true)

  // Refs for DOM manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * EXISTING FUNCTION: Get the article URL from the NewsArticle object
   * Handles different possible structures
   */
  const getArticleUrl = (): string => {
    // Try different possible URL locations based on your NewsArticle structure
    // Check if article has a source object with url
    if (
      article.source &&
      typeof article.source === 'object' &&
      !Array.isArray(article.source) &&
      'url' in article.source &&
      typeof (article.source as { url?: unknown }).url === 'string'
    ) {
      return (article.source as { url: string }).url
    }
    
    // Check if article has sources array (plural)
    if (article.source && Array.isArray(article.source) && article.source.length > 0) {
      // Get the first source URL
      const firstSource = article.source[0]
      if (firstSource && typeof firstSource === 'object' && 'url' in firstSource) {
        return firstSource.url
      }
    }
    
    // Check if article has a direct articleUrl property
    if ('articleUrl' in article && article.articleUrl) {
      return article.articleUrl as string
    }
    
    // Check for any other URL-like properties
    const articleAny = article as any
    if (articleAny.url) return articleAny.url
    if (articleAny.link) return articleAny.link
    if (articleAny.sourceUrl) return articleAny.sourceUrl
    
    // Return empty string if no URL found
    console.warn('No URL found in article object:', article)
    return ''
  }

  /**
   * EXISTING FUNCTION: Get the API base URL based on environment
   * Simple and robust approach that works everywhere
   */
  const getApiUrl = (): string => {
    // For production, you can set this via environment variable during build
    // or configure it in your deployment
    
    // Check if we have a global config object
    if (typeof window !== 'undefined' && (window as any).CONFIG && (window as any).CONFIG.API_URL) {
      return (window as any).CONFIG.API_URL
    }
    
    // Default to localhost for development
    // Change this to your production API URL when deploying
    return 'http://localhost:8000'
  }

  /**
   * EXISTING FUNCTION: Get authentication token from localStorage
   */
  const getAuthToken = (): string | null => {
    // Try multiple storage locations for flexibility
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           sessionStorage.getItem('token')
  }

  /**
   * EXISTING FUNCTION: Initialize chat with welcome message when opened
   */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: aiAvailable 
          ? `Hi! I'm Mam'gobozi, your news companion. I've analyzed "${article.title}" and I'm ready to discuss it with you. You can ask me questions about the content, request additional context, or explore different perspectives. What would you like to know?`
          : `Hi! I'm Mam'gobozi. Unfortunately, the AI service is currently unavailable, so I cannot analyze articles or answer questions at this time. Please try again later or contact support if the issue persists.`,
        sender: 'ai',
        timestamp: new Date(),
        isError: !aiAvailable
      }
      setMessages([welcomeMessage])
      setError(null)
    }
  }, [isOpen, article.title, messages.length, aiAvailable])

  /**
   * EXISTING FUNCTION: Auto-scroll to bottom when new messages are added
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * EXISTING FUNCTION: Focus input field when chat opens
   */
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      // Add delay to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isMinimized])

  /**
   * EXISTING FUNCTION: Scroll to the bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * EXISTING FUNCTION: Send message to the backend API and get AI response
   */
  const sendMessageToAPI = async (userMessage: string): Promise<{ success: boolean; response: string; contextUsed: boolean }> => {
    const apiUrl = getApiUrl()
    
    try {
      // Make API call to the chat endpoint WITHOUT authentication
      const response = await fetch(`${apiUrl}/api/article/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // No Authorization header needed
        },
        body: JSON.stringify({
          article_id: article.id,
          article_url: getArticleUrl(),  // Use the helper function to get URL
          message: userMessage,
          context: conversationContext
        })
      })

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Check if the response indicates AI is unavailable
      if (!data.success) {
        setAiAvailable(false)
        if (data.error && data.error.includes('not available')) {
          return {
            success: false,
            response: data.response || "AI service is currently unavailable. Please try again later.",
            contextUsed: false
          }
        }
      }
      
      // Update conversation context for successful responses
      if (data.success && data.response) {
        const newContext = conversationContext ? 
          `${conversationContext}\nUser: ${userMessage}\nAI: ${data.response}` : 
          `User: ${userMessage}\nAI: ${data.response}`
        
        // Limit context to prevent token overflow (last 1000 chars)
        setConversationContext(newContext.length > 1000 ? newContext.slice(-1000) : newContext)
      }
      
      return {
        success: data.success,
        response: data.response,
        contextUsed: data.context_used || false
      }
      
    } catch (error) {
      console.error('Chat API error:', error)
      throw error
    }
  }

  /**
   * EXISTING FUNCTION: Handle sending a message
   */
  const handleSendMessage = async () => {
    // Validate input
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    
    // Create and add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMsg])
    setInputValue('')  // Clear input immediately
    setIsLoading(true)
    setError(null)

    try {
      // Get AI response from the backend
      const result = await sendMessageToAPI(userMessage)
      
      // Create AI response message
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: result.response,
        sender: 'ai',
        timestamp: new Date(),
        isError: !result.success
      }
      
      setMessages(prev => [...prev, aiMsg])
      
      // If context was used, add a small indicator
      if (result.contextUsed && result.success) {
        console.log('✅ Response generated using full article context')
      }
      
    } catch (error) {
      // Handle errors gracefully
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      setError(errorMessage)
      
      // Add error message to chat
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        text: errorMessage.includes('AI') || errorMessage.includes('not available')
          ? `The AI service is currently unavailable. I cannot process your request at this time. Please ensure the OpenAI API is configured and try again later.`
          : `I apologize, but I encountered an error: ${errorMessage}. Please try again or check your connection.`,
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      }
      
      setMessages(prev => [...prev, errorMsg])
      
      // Check if it's an AI availability issue
      if (errorMessage.includes('AI') || errorMessage.includes('not available')) {
        setAiAvailable(false)
      }
      
    } finally {
      setIsLoading(false)
      // Refocus input for continued conversation
      if (inputRef.current && !isMinimized) {
        inputRef.current.focus()
      }
    }
  }

  /**
   * EXISTING FUNCTION: Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * EXISTING FUNCTION: Format message text for display
   * Ensures clean, single-spaced paragraph formatting
   */
  const formatMessageText = (text: string) => {
    // Split text into paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim())
    
    if (paragraphs.length === 0) {
      // If no double-newline paragraphs, try single newlines
      const lines = text.split('\n').filter(l => l.trim())
      return (
        <div className="space-y-1">
          {lines.map((line, index) => (
            <p key={index} className="leading-relaxed">
              {line.trim()}
            </p>
          ))}
        </div>
      )
    }
    
    return (
      <div className="space-y-2">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="leading-relaxed">
            {paragraph.trim()}
          </p>
        ))}
      </div>
    )
  }

  // === NEW ENHANCED RENDERING ===

  // NEW FEATURE: Floating Chat Toggle Button (when chat is fully closed)
  if (!isOpen) {
    return (
      <div className="news-chat-floating-toggle">
        <button 
          onClick={onOpen}  // Use the provided onOpen handler
          className="floating-chat-button"
          title="Chat with Mam'gobozi about this article"
          aria-label="Open chat with AI assistant"
        >
          <MessageCircle size={24} />
          <div className="chat-notification-pulse"></div>
        </button>
      </div>
    )
  }

  // MAIN RENDER: Enhanced retractable sidebar overlay
  return (
    <div className={`news-chat-overlay ${isOpen ? 'open' : ''} ${isMinimized ? 'retracted' : ''}`}>
      {/* NEW: Semi-transparent backdrop when retracted */}
      {isMinimized && (
        <div 
          className="chat-backdrop" 
          onClick={() => setIsMinimized(false)}
        />
      )}
      
      <div className="chat-container">
        {/* ENHANCED: Chat Header with retraction controls */}
        <div className="chat-header">
          <div className="header-left">
            {/* Bot icon - always visible */}
            <div className="chat-bot-icon">
              <Bot size={20} />
            </div>
            
            {/* Header info - hidden when retracted (minimized) */}
            {!isMinimized && (
              <div className="header-info">
                <h3 className="chat-title">Mam'gobozi</h3>
                <p className="chat-subtitle">
                  {aiAvailable ? 'AI News Assistant' : 'AI Offline'}
                </p>
              </div>
            )}
          </div>

          <div className="header-actions">
            {/* NEW: Retraction toggle button (using existing isMinimized state) */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="header-button retract-button"
              title={isMinimized ? 'Expand chat' : 'Retract to tab'}
              aria-label={isMinimized ? 'Expand chat' : 'Retract to tab'}
            >
              <ChevronLeft 
                size={16} 
                style={{ 
                  transform: isMinimized ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} 
              />
            </button>

            {/* EXISTING: Close button */}
            <button
              onClick={onClose}
              className="header-button close-button"
              title="Close chat"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* CONDITIONAL: Show main chat content only when not retracted */}
        {!isMinimized && (
          <>
            {/* EXISTING: Article Context Bar */}
            <div className="article-context-bar">
              <p className="context-label">Discussing:</p>
              <p className="article-title-preview">{article.title}</p>
            </div>

            {/* EXISTING: AI Status Banner */}
            {!aiAvailable && (
              <div className="ai-status-banner offline">
                <AlertCircle size={16} />
                <p>AI service unavailable. Please check OpenAI configuration.</p>
              </div>
            )}

            {/* EXISTING: Error Banner */}
            {error && aiAvailable && (
              <div className="error-banner">
                <p>⚠️ {error}</p>
              </div>
            )}

            {/* EXISTING: Messages Container */}
            <div className="chat-messages">
              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'} ${
                      message.isError ? 'error-message' : ''
                    }`}
                  >
                    {/* Message Avatar */}
                    <div className="message-avatar">
                      {message.sender === 'user' ? (
                        <User size={16} />
                      ) : message.isError ? (
                        <AlertCircle size={16} />
                      ) : (
                        <Bot size={16} />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className="message-content">
                      <div className="message-text">
                        {formatMessageText(message.text)}
                      </div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* EXISTING: Loading Indicator */}
                {isLoading && (
                  <div className="message ai-message loading-message">
                    <div className="message-avatar">
                      <Bot size={16} />
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* EXISTING: Input Area */}
            <div className="chat-input">
              <div className="input-container">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={aiAvailable ? "Ask about this article..." : "AI service unavailable"}
                  className="chat-input-field"
                  disabled={isLoading || !aiAvailable}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || !aiAvailable}
                  className="send-button"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              
              {/* EXISTING: Status text */}
              <div className="input-status">
                <p>
                  {aiAvailable 
                    ? 'Powered by GPT-3.5 • Full article analysis enabled' 
                    : 'AI service currently unavailable'}
                </p>
              </div>
            </div>
          </>
        )}

        {/* NEW: Retracted state content (when minimized) */}
        {isMinimized && (
          <div className="retracted-content">
            <div className="retracted-info">
              <div className="retracted-text">
                <span>Chat</span>
                {messages.length > 1 && (
                  <span className="message-count">({messages.length - 1})</span>
                )}
              </div>
            </div>
            <div className="retracted-expand-hint">
              <span>Click to expand</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}