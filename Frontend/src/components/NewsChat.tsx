// Frontend/src/components/NewsChat.tsx
// Retractable chat component for discussing articles with AI

import React, { useState, useRef, useEffect } from 'react'
import { Send, X, Bot, User, Minimize2 } from 'lucide-react'
import type { NewsArticle } from '../services/newsApiService'
import '../styles/chat.css'

// Define message interface
interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

// Define component props interface
interface NewsChatProps {
  isOpen: boolean
  onClose: () => void
  article: NewsArticle
}

/**
 * NewsChat Component
 * 
 * Provides an overlay chat interface for discussing articles:
 * - ChatGPT-style conversation interface
 * - Message history and scrolling
 * - Mock AI responses for demonstration
 * - Slide-in overlay positioning
 */
export default function NewsChat({ isOpen, onClose, article }: NewsChatProps) {
  // Component state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Refs for scrolling and focus management
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize chat with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: `Hi! Mamgobhozi here, you know I got you on all the tea on : "${article.title}". You can ask me questions about the content, request additional context, or explore different perspectives. What would you like to know?`,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, article.title, messages.length])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Generate mock AI responses (in real app, this would call GPT API)
  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    // Simple keyword-based responses for demonstration
    if (message.includes('summary') || message.includes('summarize')) {
      return `Based on the article "${article.title}", the key points are: ${article.summary.substring(0, 200)}... The main impact appears to be significant for the ${article.category.toLowerCase()} sector. Would you like me to elaborate on any specific aspect?`
    }
    
    if (message.includes('source') || message.includes('reliable')) {
      return `This article comes from ${article.source}, which is ${['BBC News', 'Reuters', 'Daily Nation'].includes(article.source || '') ? 'generally considered a reliable source' : 'a regional news outlet'}. The information was published recently and appears to be ${article.isBreaking ? 'breaking news, so some details may still be developing' : 'well-established reporting'}.`
    }
    
    if (message.includes('context') || message.includes('background')) {
      return `This ${article.category} story is part of ongoing developments in the region. Similar stories have been reported recently, and this appears to be ${article.isBreaking ? 'a developing situation' : 'a continuation of established trends'}. The broader context involves regional policy and economic factors that have been evolving over recent months.`
    }
    
    if (message.includes('opinion') || message.includes('perspective') || message.includes('view')) {
      return `There are multiple perspectives on this issue. Supporters might argue that this development could bring positive changes and opportunities. Critics might be concerned about potential risks or unintended consequences. The local community's response appears to be mixed, with various stakeholder groups expressing different views. What specific angle interests you most?`
    }
    
    if (message.includes('question') || message.includes('?')) {
      return `That's a great question about the article. Based on the information provided, I can see several important aspects to consider. The article mentions key details about ${article.category.toLowerCase()}, and the implications seem to be significant. Could you be more specific about what aspect you'd like me to focus on?`
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". Based on the article "${article.title}", I can provide some insights. This ${article.category} story from ${article.source} discusses important developments. What specific aspect would you like me to elaborate on? I can help explain the context, discuss different perspectives, or answer questions about the content.`
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: generateAIResponse(userMessage.text),
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000 + Math.random() * 2000) // 1-3 second delay
  }

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle minimize/maximize
  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Clear chat history
  const handleClearChat = () => {
    setMessages([])
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome-new',
      text: `Chat cleared! I'm still here to help you discuss "${article.title}". What would you like to know?`,
      sender: 'ai',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }

  // Format timestamp for display
  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div className={`news-chat-overlay ${isOpen ? 'open' : ''}`}>
      <div className={`chat-container ${isMinimized ? 'minimized' : ''}`}>
        
        {/* Chat Header */}
        <header className="chat-header">
          <div className="header-left">
            <Bot size={24} className="chat-bot-icon" />
            <div className="header-info">
              <h3 className="chat-title">Article Discussion</h3>
              <span className="chat-subtitle">AI Assistant</span>
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={handleMinimize}
              className="header-button minimize-button"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              <Minimize2 size={18} />
            </button>
            
            <button 
              onClick={handleClearChat}
              className="header-button clear-button"
              title="Clear chat"
            >
              Clear
            </button>
            
            <button 
              onClick={onClose}
              className="header-button close-button"
              title="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Chat Messages Area */}
        <main className="chat-messages">
          <div className="messages-container">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? (
                    <User size={20} />
                  ) : (
                    <Bot size={20} />
                  )}
                </div>
                
                <div className="message-content">
                  <div className="message-text">
                    {message.text}
                  </div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="message ai-message loading-message">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Chat Input Area */}
        <footer className="chat-input">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about this article..."
              className="chat-input-field"
              disabled={isLoading}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="send-button"
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>
          
          <div className="input-hints">
            <span>Try asking: "Summarize this" • "Is this reliable?" • "What's the context?"</span>
          </div>
        </footer>
      </div>
    </div>
  )
}