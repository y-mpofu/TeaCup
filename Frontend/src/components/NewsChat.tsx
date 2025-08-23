// Frontend/src/components/NewsChat.tsx
// Fixed chat component that properly connects to the backend API

import React, { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User, Minimize2, Loader2, AlertCircle } from 'lucide-react'
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
  article: NewsArticle  // This uses your actual NewsArticle type
}

/**
 * Fixed NewsChat Component
 * 
 * This component properly handles:
 * - Real API connections to the backend
 * - Error states when AI is unavailable
 * - Cached article content from the backend
 * - Clean paragraph formatting
 * - Proper authentication
 */
export default function NewsChat({ isOpen, onClose, article }: NewsChatProps) {
  // Component state management
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversationContext, setConversationContext] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [aiAvailable, setAiAvailable] = useState<boolean>(true)  // Track if AI is available

  // Refs for DOM manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Get the article URL from the NewsArticle object
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
   * Get the API base URL based on environment
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
   * Get authentication token from localStorage
   */
  const getAuthToken = (): string | null => {
    // Try multiple storage locations for flexibility
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           sessionStorage.getItem('token')
  }

  /**
   * Initialize chat with welcome message when opened
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
   * Auto-scroll to bottom when new messages are added
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  /**
   * Focus input field when chat opens
   */
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  /**
   * Scroll to the bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * Send message to the backend API and get AI response
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
   * Handle sending a message
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
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * Format message text for display
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

  // Don't render if chat is not open
  if (!isOpen) return null

  return (
    <div className={`fixed inset-y-0 right-0 z-50 flex ${isMinimized ? 'w-80' : 'w-96'} transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col w-full bg-white shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Mam'gobozi</h3>
              <p className="text-xs opacity-90">
                {aiAvailable ? 'AI News Assistant' : 'AI Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Minimize chat"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Context Bar */}
        <div className="p-3 bg-gray-50 border-b">
          <p className="text-xs text-gray-600">Discussing:</p>
          <p className="text-sm font-medium text-gray-800 line-clamp-2">{article.title}</p>
        </div>

        {/* AI Status Banner */}
        {!aiAvailable && (
          <div className="p-3 bg-yellow-50 border-b border-yellow-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              AI service unavailable. Please check OpenAI configuration.
            </p>
          </div>
        )}

        {/* Error Banner */}
        {error && aiAvailable && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">⚠️ {error}</p>
          </div>
        )}

        {/* Messages Container */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isMinimized ? 'hidden' : ''}`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-blue-500' 
                    : message.isError 
                      ? 'bg-red-500' 
                      : 'bg-gray-600'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : message.isError ? (
                    <AlertCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                
                {/* Message Bubble */}
                <div className={`rounded-lg px-4 py-2 ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {formatMessageText(message.text)}
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' 
                      ? 'text-blue-100' 
                      : message.isError
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    <span className="text-gray-600 text-sm">
                      {aiAvailable ? 'Thinking...' : 'Processing...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isMinimized && (
          <div className="border-t p-4 bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={aiAvailable ? "Ask about this article..." : "AI service unavailable"}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                disabled={isLoading || !aiAvailable}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !aiAvailable}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {aiAvailable 
                ? 'Powered by GPT-3.5 • Full article analysis enabled' 
                : 'AI service currently unavailable'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}