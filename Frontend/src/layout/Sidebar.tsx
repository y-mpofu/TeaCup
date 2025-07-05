// src/layout/Sidebar.tsx
// Fixed sidebar with direct icon structure for proper alignment

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  // Main navigation icons
  Coffee, // For TeaCup brand icon
  Circle, // For The Sip
  MessageSquare, // For Hot Takes
  List, // For My Mix

  // Category icons
  Flag, // For Politics
  Droplets, // For Local Spills
  Vote,
  Radio, // For Weather
  Cross, // For Health
  Home, // For Culture
  Globe,
  UserCheck, // For Global

  // Bottom section icons
  Bookmark, // For Saved Stories
  Settings, // For Settings

  // UI icons
  Menu,
  X,
  CupSoda,
  CoffeeIcon,
} from "lucide-react";
import "../styles/Sidebar.css"; // Import sidebar styles

export default function Sidebar() {
  // Track collapsed state - keeping this functionality from original
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get current location for active link styling
  const location = useLocation();

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar header with TeaCup brand - Fixed at top */}
      <div className="sidebar-header">
        <div className="brand-container">
          <img
            src="./TeaCup_Logo.png"
            className="section-icon"
            width={100}
            height={100}
          />
        </div>
      </div>

      {/* Scrollable content container */}
      <div className="sidebar-content">
        {/* Main navigation section */}
        <nav className="sidebar-nav">
          {/* Toggle button for collapse functionality */}
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>

          {/* Home - Main page */}
          <Link
            to="/"
            className={`nav-link ${isActive("/") ? "active" : ""}`}
            data-tooltip="Home"
          >
            <Home size={20} />
            {!isCollapsed && <span className="nav-text">Home</span>}
          </Link>

          {/* The Sip - Main feed */}
          <Link
            to="/sip"
            className={`nav-link ${isActive("/sip") ? "active" : ""}`}
            data-tooltip="General Sip"
          >
            <CupSoda size={20} />
            {!isCollapsed && <span className="nav-text">General Sip</span>}
          </Link>

          {/* Hot Takes - Trending content */}
          <Link
            to="/hot-takes"
            className={`nav-link ${isActive("/hot-takes") ? "active" : ""}`}
            data-tooltip="Trending Tea"
          >
            <MessageSquare size={20} />
            {!isCollapsed && <span className="nav-text">Trending Tea</span>}
          </Link>

          {/* My Mix - Personalized content */}
          <Link
            to="/my-mix"
            className={`nav-link ${isActive("/my-mix") ? "active" : ""}`}
            data-tooltip="For You"
          >
            <List size={20} />
            {!isCollapsed && <span className="nav-text">For You</span>}
          </Link>
        </nav>

        {/* PAPERBOY DELIVERY section */}
        <div className="sidebar-section">
          {!isCollapsed && (
            <h3 className="section-title">
              PAPERBOY DELIVERY
              <img
                src="./paperboy.png"
                className="section-icon"
                width={60}
                height={60}
              />
            </h3>
          )}

          <nav className="sidebar-nav">
            {/* Politics */}
            <Link
              to="/politics"
              className={`nav-link ${isActive("/politics") ? "active" : ""}`}
              data-tooltip="Politics"
            >
              <Flag size={20} />
              {!isCollapsed && <span className="nav-text">Politics</span>}
            </Link>

            {/* Local Spills */}
            <Link
              to="/local-spills"
              className={`nav-link ${
                isActive("/local-spills") ? "active" : ""
              }`}
              data-tooltip="Local Spills"
            >
              <Radio size={20} />
              {!isCollapsed && <span className="nav-text">Local Spills</span>}
            </Link>

            {/* Health */}
            <Link
              to="/health"
              className={`nav-link ${isActive("/health") ? "active" : ""}`}
              data-tooltip="Health"
            >
              <Cross size={20} />
              {!isCollapsed && <span className="nav-text">Health</span>}
            </Link>

            {/* Global */}
            <Link
              to="/global"
              className={`nav-link ${isActive("/global") ? "active" : ""}`}
              data-tooltip="Global"
            >
              <Globe size={20} />
              {!isCollapsed && <span className="nav-text">Global</span>}
            </Link>
          </nav>
        </div>

        {/* Community Section */}
        <div className="sidebar-section">
          {!isCollapsed && <h3 className="section-title">Community</h3>}

          <nav className="sidebar-nav">
            {/* Saved Stories */}
            <Link
              to="/saved-stories"
              className={`nav-link ${
                isActive("/saved-stories") ? "active" : ""
              }`}
              data-tooltip="Saved Stories"
            >
              <Bookmark size={20} />
              {!isCollapsed && <span className="nav-text">Saved Stories</span>}
            </Link>

            {/* Settings */}
            <Link
              to="/hudle"
              className={`nav-link ${isActive("/hudle") ? "active" : ""}`}
              data-tooltip="Start a Tea Party"
            >
              <UserCheck size={20} />
              {!isCollapsed && (
                <span className="nav-text">Start a Tea Party</span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
