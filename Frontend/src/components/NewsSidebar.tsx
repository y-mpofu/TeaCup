// Frontend/src/components/NewsSidebar.tsx
// Sidebar component with sources, fact-checking, and chat functionality

import React from 'react'
import { 
  ExternalLink, 
  Shield, 
  MessageCircle, 
  Check, 
  AlertTriangle, 
  Info,
  TrendingUp,
  Clock
} from 'lucide-react'
import type { NewsArticle } from '../services/newsApiService'
import '../styles/news-sidebar.css'

// Define component props interface
interface NewsSidebarProps {
  article: NewsArticle
  onChatOpen: () => void
}

// Mock fact-check data structure
interface FactCheckData {
  status: 'verified' | 'questionable' | 'unverified'
  confidence: number // 0-100
  sources: string[]
  warnings: string[]
  lastChecked: string
}

/**
 * NewsSidebar Component
 * 
 * Provides supplementary information including:
 * - Source links and publication details
 * - Fact-checking and verification status
 * - Related articles and trending topics
 * - Chat discussion trigger
 */
export default function NewsSidebar({ article, onChatOpen }: NewsSidebarProps) {
  
  // Generate mock fact-check data (in real app, this would come from API)
  const generateFactCheckData = (article: NewsArticle): FactCheckData => {
    // Simulate fact-checking based on article characteristics
    const isReliableSource = ['BBC News', 'Reuters Africa', 'Daily Nation', 'News24'].includes(article.source || '')
    const hasBreakingNews = article.isBreaking
    
    let status: FactCheckData['status'] = 'verified'
    let confidence = 85
    
    if (hasBreakingNews) {
      status = 'questionable'
      confidence = 65
    }
    
    if (isReliableSource) {
      confidence = Math.min(confidence + 15, 95)
    }
    
    return {
      status,
      confidence,
      sources: [
        article.source || 'Original Publisher',
        'Cross-reference Database',
        'Fact-Check Network'
      ],
      warnings: hasBreakingNews ? ['Breaking news - information still developing'] : [],
      lastChecked: new Date().toISOString()
    }
  }

  const factCheckData = generateFactCheckData(article)

  // Generate mock related articles
  const generateRelatedArticles = (article: NewsArticle) => {
    return [
      {
        title: `More ${article.category} news from the region`,
        source: 'Regional News Network',
        time: '2 hours ago'
      },
      {
        title: 'Analysis: Regional impact and implications',
        source: 'Expert Analysis',
        time: '4 hours ago'
      },
      {
        title: 'Historical context and background',
        source: 'Background Report',
        time: '1 day ago'
      }
    ]
  }

  const relatedArticles = generateRelatedArticles(article)

  // Get status styling based on fact-check status
  const getStatusStyling = (status: FactCheckData['status']) => {
    switch (status) {
      case 'verified':
        return { icon: Check, color: 'verified', label: 'Verified' }
      case 'questionable':
        return { icon: AlertTriangle, color: 'questionable', label: 'Developing' }
      case 'unverified':
        return { icon: Info, color: 'unverified', label: 'Unverified' }
      default:
        return { icon: Info, color: 'unverified', label: 'Unknown' }
    }
  }

  const statusInfo = getStatusStyling(factCheckData.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="news-sidebar">
      
      {/* Source Information Section */}
      <section className="sidebar-section sources-section">
        <h3 className="section-title">
          <ExternalLink size={20} />
          Sources
        </h3>
        
        <div className="source-card">
          <div className="source-main">
            <a 
              href={article.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="source-link"
            >
              <strong>{article.source}</strong>
            </a>
            <span className="source-type">Original Publisher</span>
          </div>
          
          <div className="source-meta">
            <div className="meta-row">
              <Clock size={14} />
              <span>Published: {new Date(article.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="meta-row">
              <TrendingUp size={14} />
              <span>Category: {article.category}</span>
            </div>
          </div>

          <a 
            href={article.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="read-original-button"
          >
            <ExternalLink size={16} />
            Read Original Article
          </a>
        </div>
      </section>

      {/* Fact Check Section */}
      <section className="sidebar-section fact-check-section">
        <h3 className="section-title">
          <Shield size={20} />
          Fact Check
        </h3>
        
        <div className="fact-check-card">
          <div className={`fact-check-status status-${statusInfo.color}`}>
            <StatusIcon size={24} />
            <div className="status-info">
              <span className="status-label">{statusInfo.label}</span>
              <span className="confidence-score">{factCheckData.confidence}% confidence</span>
            </div>
          </div>

          <div className="confidence-bar">
            <div 
              className="confidence-fill"
              style={{ 
                width: `${factCheckData.confidence}%`,
                backgroundColor: factCheckData.confidence > 80 ? '#10b981' : 
                               factCheckData.confidence > 60 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>

          {factCheckData.warnings.length > 0 && (
            <div className="fact-warnings">
              {factCheckData.warnings.map((warning, index) => (
                <div key={index} className="warning-item">
                  <AlertTriangle size={16} />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          <div className="verification-sources">
            <h4>Verified by:</h4>
            <ul>
              {factCheckData.sources.map((source, index) => (
                <li key={index}>
                  <Check size={14} />
                  {source}
                </li>
              ))}
            </ul>
          </div>

          <div className="last-checked">
            Last verified: {new Date(factCheckData.lastChecked).toLocaleTimeString()}
          </div>
        </div>
      </section>

      {/* Chat Discussion Section */}
      <section className="sidebar-section chat-section">
        <h3 className="section-title">
          <MessageCircle size={20} />
          Discussion
        </h3>
        
        <div className="chat-prompt">
          <p>Have questions about this article? Want to explore different perspectives?</p>
          
          <button 
            onClick={onChatOpen}
            className="chat-trigger-button"
          >
            <MessageCircle size={24} />
            <div className="button-content">
              <span className="button-title">Ask Mam'gobozi</span>
              <span className="button-subtitle">Discuss this article with our top NewsQueen Mamgobozi</span>
            </div>
          </button>
          
          <div className="chat-features">
            <div className="feature-item">
              <Check size={16} />
              <span>Ask questions about the content</span>
            </div>
            <div className="feature-item">
              <Check size={16} />
              <span>Get additional context</span>
            </div>
            <div className="feature-item">
              <Check size={16} />
              <span>Explore different viewpoints</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}