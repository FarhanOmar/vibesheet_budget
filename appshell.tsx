import React, { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import FocusTrap from 'focus-trap-react'
import { useAuth } from './authcontext'
import {
  FiHome,
  FiList,
  FiBarChart2,
  FiFlag,
  FiFileText,
  FiSettings,
  FiX,
  FiMenu,
  FiLogOut,
} from 'react-icons/fi'

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: FiHome },
  { name: 'Transactions', path: '/transactions', icon: FiList },
  { name: 'Net Worth', path: '/net-worth', icon: FiBarChart2 },
  { name: 'Goals', path: '/goals', icon: FiFlag },
  { name: 'Reports', path: '/reports', icon: FiFileText },
  { name: 'Settings', path: '/settings', icon: FiSettings },
]

export default function AppShell(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <button
          type="button"
          aria-label="Toggle menu"
          className="app-shell__menu-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="app-shell__brand">
          <Link to="/dashboard">BudgetTracker</Link>
        </div>
        <div className="app-shell__user-menu">
          <span className="app-shell__username">{user?.name}</span>
          <button
            type="button"
            aria-label="Logout"
            className="app-shell__logout-button"
            onClick={handleLogout}
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      <FocusTrap
        active={sidebarOpen}
        focusTrapOptions={{
          clickOutsideDeactivates: true,
          escapeDeactivates: false,
        }}
      >
        <aside className={`app-shell__sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="app-shell__nav">
            <ul>
              {menuItems.map(({ name, path, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      isActive
                        ? 'active app-shell__nav-link'
                        : 'app-shell__nav-link'
                    }
                  >
                    <Icon className="app-shell__nav-icon" />
                    <span>{name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </FocusTrap>

      {sidebarOpen && (
        <button
          type="button"
          className="app-shell__overlay"
          role="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  )
}