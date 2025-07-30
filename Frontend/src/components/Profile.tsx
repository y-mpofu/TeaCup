// import React, { useState, useRef, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import '../styles/profile.css'
// import { LogOut, Settings, User, UserCog } from 'lucide-react'

// export default function Profile() {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false)
//   const dropdownRef = useRef<HTMLDivElement>(null)

//   const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false)
//       }
//     }

//     if (isDropdownOpen) {
//       document.addEventListener('mousedown', handleClickOutside)
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [isDropdownOpen])

//   return (
//     <div className="profile-container" ref={dropdownRef}>
//       <button className="profile-button" onClick={toggleDropdown} aria-label="Open profile menu">
//         <div className="profile-avatar">
//           <span className="profile-initial">JD</span>
//         </div>
//       </button>

//       {isDropdownOpen && (
//         <div className="profile-dropdown">
//           <div className="profile-info">
//             <div className="profile-avatar-small">
//               <span className="profile-initial">JD</span>
//             </div>
//             <div className="profile-details">
//               <p className="profile-name">John Doe</p>
//               <p className="profile-email">john@example.com</p>
//             </div>
//           </div>

//           <hr className="dropdown-divider" />

//           <div className="dropdown-menu">
//             <Link
//               to="/profile"
//               className="dropdown-item"
//               onClick={() => setIsDropdownOpen(false)}
//             >
//               <User className="icon" />
//               <span>View Profile</span>
//             </Link>

//             <Link
//               to="/account"
//               className="dropdown-item"
//               onClick={() => setIsDropdownOpen(false)}
//             >
//               <UserCog className="icon" />
//               <span>Account</span>
//             </Link>

//             <Link
//               to="/settings"
//               className="dropdown-item"
//               onClick={() => setIsDropdownOpen(false)}
//             >
//               <Settings className="icon" />
//               <span>Settings</span>
//             </Link>

//             <hr className="dropdown-divider" />

//             <button
//               className="dropdown-item logout-item"
//               onClick={() => {
//                 setIsDropdownOpen(false)
//                 console.log('Logging out...')
//               }}
//             >
//               <LogOut className="icon" />
//               <span>Logout</span>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


// Frontend/src/components/Profile.tsx
// Updated Profile component with authentication support
// Frontend/src/components/Profile.tsx
// Fixed Profile component with better z-index and positioning

import React, { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { User as AuthUser } from '../services/authService'

// Define the component props
interface ProfileProps {
  currentUser: AuthUser | null
  onLogout: () => Promise<void>
}

export default function Profile({ currentUser, onLogout }: ProfileProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug logging
  useEffect(() => {
    console.log('Profile component mounted with user:', currentUser)
  }, [currentUser])

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle logout with loading state
  const handleLogout = async () => {
    try {
      console.log('Profile: Logout button clicked')
      setIsDropdownOpen(false) // Close dropdown
      await onLogout()
      console.log('Profile: Logout completed')
    } catch (error) {
      console.error('Profile: Error during logout:', error)
    }
  }

  // Handle dropdown toggle
  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Profile: Avatar clicked, current state:', isDropdownOpen)
    setIsDropdownOpen(!isDropdownOpen)
  }

  // Get user initials for avatar
  const getUserInitials = (): string => {
    if (!currentUser) return 'U'
    
    const firstInitial = currentUser.first_name?.charAt(0)?.toUpperCase() || ''
    const lastInitial = currentUser.last_name?.charAt(0)?.toUpperCase() || ''
    
    return firstInitial + lastInitial || currentUser.username?.charAt(0)?.toUpperCase() || 'U'
  }

  // Show loading state if no user
  if (!currentUser) {
    console.log('Profile: No current user, showing default avatar')
    return (
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1001
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <User size={20} />
        </div>
        <span style={{ color: 'white', marginLeft: '8px', fontSize: '12px' }}>
          Loading...
        </span>
      </div>
    )
  }

  console.log('Profile: Rendering with user:', currentUser.username, 'Dropdown open:', isDropdownOpen)

  return (
    <div 
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1001 // Higher z-index to ensure it's above other elements
      }}
    >
      {/* Profile button (avatar) */}
      <button 
        onClick={handleToggleDropdown}
        onMouseDown={(e) => e.preventDefault()} // Prevent focus issues
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          transition: 'transform 0.2s ease',
          outline: 'none',
          zIndex: 1002
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <div 
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            border: isDropdownOpen ? '2px solid rgba(255,255,255,0.3)' : 'none'
          }}
        >
          {currentUser.profile_picture ? (
            <img 
              src={currentUser.profile_picture} 
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <span style={{ userSelect: 'none' }}>
              {getUserInitials()}
            </span>
          )}
        </div>
      </button>

      {/* User name next to avatar */}
      <span style={{ 
        color: 'white', 
        marginLeft: '8px', 
        fontSize: '14px',
        fontWeight: '500',
        opacity: 0.9 
      }}>
        {currentUser.first_name}
      </span>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            minWidth: '250px',
            overflow: 'hidden',
            zIndex: 1003,
            animation: 'slideDown 0.2s ease-out'
          }}
        >
          {/* User info section */}
          <div 
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#f8fafc',
              borderBottom: '1px solid #e5e7eb'
            }}
          >
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {currentUser.profile_picture ? (
                <img 
                  src={currentUser.profile_picture} 
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span style={{ userSelect: 'none' }}>
                  {getUserInitials()}
                </span>
              )}
            </div>
            <div>
              <div 
                style={{
                  color: '#111827',
                  fontWeight: 600,
                  fontSize: '14px',
                  margin: '0 0 4px 0'
                }}
              >
                {currentUser.first_name} {currentUser.last_name}
              </div>
              <div 
                style={{
                  color: '#6b7280',
                  fontSize: '12px',
                  margin: 0
                }}
              >
                {currentUser.email}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: '8px 0' }}>
            <Link 
              to="/profile" 
              onClick={() => setIsDropdownOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <User size={16} />
              <span>View Profile</span>
            </Link>
            
            <Link 
              to="/account" 
              onClick={() => setIsDropdownOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <User size={16} />
              <span>Account</span>
            </Link>
            
            <Link 
              to="/settings" 
              onClick={() => setIsDropdownOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </Link>
            
            <div 
              style={{
                height: '1px',
                background: '#e5e7eb',
                margin: '8px 0'
              }}
            />
            
            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: '#dc2626',
                border: 'none',
                background: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Add the keyframes animation */}
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  )
}