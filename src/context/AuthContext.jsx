// =============================================
// AUTH CONTEXT
//
// This file manages ALL authentication state for the app.
// It wraps the entire app so any component can access:
//   - user: the logged-in user object
//   - profile: the user's profile data from our database
//   - loading: whether auth is still initializing
//   - signOut: function to log out
//
// Think of Context as a "global store" that avoids
// prop-drilling (passing props through many components).
// =============================================

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// 1. Create the context object
const AuthContext = createContext({})

// 2. Create the Provider component that wraps the app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)         // Supabase auth user
  const [profile, setProfile] = useState(null)   // Our custom profile from DB
  const [loading, setLoading] = useState(true)   // True while checking session

  // Fetch the user's profile from our profiles table
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('Fetch profile error:', err)
      return null
    }
  }, [])

  // Create profile if it doesn't exist (new user signup)
  const createProfile = useCallback(async (userId, userData) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: userData.full_name || userData.user_metadata?.full_name || '',
          email: userData.email,
          avatar_url: userData.user_metadata?.avatar_url || null,
          plan: 'basic',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Create profile error:', err)
      return null
    }
  }, [])

  // Initialize: check if user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      // Get the current session from Supabase
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        // Try to get profile, create if doesn't exist
        let prof = await fetchProfile(session.user.id)
        if (!prof) {
          prof = await createProfile(session.user.id, session.user)
        }
        setProfile(prof)
      }
      setLoading(false)
    }

    initAuth()

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          let prof = await fetchProfile(session.user.id)
          if (!prof) {
            prof = await createProfile(session.user.id, session.user)
          }
          setProfile(prof)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user)
        }
        setLoading(false)
      }
    )

    // Cleanup: remove the listener when component unmounts
    return () => subscription.unsubscribe()
  }, [fetchProfile, createProfile])

  // Refresh profile data (call after profile update)
  const refreshProfile = useCallback(async () => {
    if (!user) return
    const prof = await fetchProfile(user.id)
    setProfile(prof)
  }, [user, fetchProfile])

  // Sign out function
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  // The value object is what gets shared with all child components
  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    setProfile, // Allow direct updates for optimistic UI
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom hook to use auth anywhere
// Usage: const { user, profile } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
