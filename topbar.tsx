import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../themecontext'
import { useAuth } from '../authcontext'
import styles from './topbar.module.css'
import { MenuIcon, CloseIcon, MoonIcon, SunIcon, NotificationIcon } from '../icons'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/net-worth', label: 'Net Worth' },
  { to: '/goals', label: 'Goals' },
  { to: '/reports', label: 'Reports' },
]

const TopBar: React.FC = (): JSX.Element => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileNavRef = useRef<HTMLElement>(null)
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async (): Promise<void> => {
    await logout()
    navigate('/login')
  }

  const handleNotifications = (): void => {
    console.info('Notifications clicked')
    // TODO: implement notification panel toggle
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        mobileMenuOpen &&
        mobileNavRef.current &&
        mobileMenuButtonRef.current &&
        !mobileNavRef.current.contains(target) &&
        !mobileMenuButtonRef.current.contains(target)
      ) {
        setMobileMenuOpen(false)
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        userMenuButtonRef.current &&
        !userMenuRef.current.contains(target) &&
        !userMenuButtonRef.current.contains(target)
      ) {
        setUserMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) setMobileMenuOpen(false)
        if (userMenuOpen) setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen, userMenuOpen])

  return (
    <header className={styles.topbar}>
      <div className={styles.container}>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          className={styles.menuButton}
          onClick={() => setMobileMenuOpen((open) => !open)}
          ref={mobileMenuButtonRef}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <Link to="/" className={styles.logo}>
          BudgetApp
        </Link>

        <nav
          ref={mobileNavRef as React.RefObject<HTMLElement>}
          className={`${styles.nav} ${mobileMenuOpen ? styles.open : ''}`}
          aria-label="Main navigation"
        >
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            aria-label="Toggle theme"
            className={styles.themeToggle}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          <button
            type="button"
            aria-label="View notifications"
            className={styles.notificationButton}
            onClick={handleNotifications}
          >
            <NotificationIcon />
          </button>

          {user && (
            <div className={styles.userMenu} ref={userMenuRef}>
              <button
                type="button"
                className={styles.avatarButton}
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
                ref={userMenuButtonRef}
              >
                <img
                  src={user.photoURL || '/default-avatar.png'}
                  alt={`Avatar of ${user.displayName || user.email || 'user'}`}
                  className={styles.avatar}
                />
              </button>
              {userMenuOpen && (
                <ul className={styles.dropdown}>
                  <li>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={styles.logoutButton}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar