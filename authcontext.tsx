import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react'

interface User {
  id: string
  email: string
  // add other user fields as needed
}

interface AuthContextType {
  user: User | null
  loading: boolean
  loginLoading: boolean
  registerLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [loginLoading, setLoginLoading] = useState<boolean>(false)
  const [registerLoading, setRegisterLoading] = useState<boolean>(false)

  useEffect(() => {
    const controller = new AbortController()
    const initAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }
    initAuth()
    return () => {
      controller.abort()
    }
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    if (loginLoading) return
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Login failed')
      }
      const data = await res.json()
      setUser(data.user)
    } finally {
      setLoginLoading(false)
    }
  }

  const register = async (email: string, password: string): Promise<void> => {
    if (registerLoading) return
    setRegisterLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Registration failed')
      }
      const data = await res.json()
      setUser(data.user)
    } finally {
      setRegisterLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // optional error handling
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, loginLoading, registerLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}