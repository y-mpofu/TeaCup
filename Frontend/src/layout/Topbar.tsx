// src/layout/Topbar.tsx
// Updated top header with better search and profile integration

import React, { useState } from 'react'
import { Search } from 'lucide-react'
import Profile from '../components/Profile'

export default function Topbar() {
  // State to manage the search input
  const [searchQuery, setSearchQuery] = useState('')

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
      // TODO: Implement actual search functionality
      // For now, we'll just log the search query
    }
  }

  return (
    <header className="topbar">
      {/* Search form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search news, topics, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>
      </form>

      {/* Profile component */}
      <Profile />
    </header>
  )
}