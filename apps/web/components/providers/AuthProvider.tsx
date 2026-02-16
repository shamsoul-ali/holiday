'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => void
  signOut: () => void
  refreshProfile?: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // Start with loading true

  // Check for existing user session on mount
  useEffect(() => {
    const checkAuthState = () => {
      try {
        const savedUser = localStorage.getItem('auth_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Error loading user session:', error)
        localStorage.removeItem('auth_user')
      } finally {
        setLoading(false)
      }
    }

    checkAuthState()
  }, [])

  const signIn = () => {
    // Mock sign in for now
    const newUser = {
      id: '1',
      email: 'user@example.com',
      firstName: 'Demo',
      lastName: 'User',
      imageUrl: undefined
    }
    setUser(newUser)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  const refreshProfile = async () => {
    // Mock refresh profile - in production this would fetch updated user data
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Refresh user data if needed
    } catch (error) {
      console.error('Error refreshing profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const auth = useAuth()
  
  // For now, this is a simple wrapper around useAuth
  // In production, you might redirect to login if no user
  if (!auth.user && !auth.loading) {
    // Could redirect to login page here
    console.warn('User not authenticated')
  }
  
  return auth
}