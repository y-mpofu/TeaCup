import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/profile.css'
import { LogOut, Settings, User, UserCog } from 'lucide-react'

export default function Profile() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  return (
    <div className="profile-container" ref={dropdownRef}>
      <button className="profile-button" onClick={toggleDropdown} aria-label="Open profile menu">
        <div className="profile-avatar">
          <span className="profile-initial">JD</span>
        </div>
      </button>

      {isDropdownOpen && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <div className="profile-avatar-small">
              <span className="profile-initial">JD</span>
            </div>
            <div className="profile-details">
              <p className="profile-name">John Doe</p>
              <p className="profile-email">john@example.com</p>
            </div>
          </div>

          <hr className="dropdown-divider" />

          <div className="dropdown-menu">
            <Link
              to="/profile"
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              <User className="icon" />
              <span>View Profile</span>
            </Link>

            <Link
              to="/account"
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              <UserCog className="icon" />
              <span>Account</span>
            </Link>

            <Link
              to="/settings"
              className="dropdown-item"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Settings className="icon" />
              <span>Settings</span>
            </Link>

            <hr className="dropdown-divider" />

            <button
              className="dropdown-item logout-item"
              onClick={() => {
                setIsDropdownOpen(false)
                console.log('Logging out...')
              }}
            >
              <LogOut className="icon" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
