// =============================================
// SUPABASE CLIENT CONFIGURATION
//
// HOW TO SET UP:
// 1. Go to https://supabase.com and create a project
// 2. Go to Settings > API in your Supabase dashboard
// 3. Copy your Project URL and anon key
// 4. Create a .env file in the project root with:
//    VITE_SUPABASE_URL=your_project_url_here
//    VITE_SUPABASE_ANON_KEY=your_anon_key_here
// =============================================

import { createClient } from '@supabase/supabase-js'

// These come from your .env file (never hardcode these!)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that credentials are configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ FLUXY: Supabase credentials missing!\n' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
    'See src/lib/supabase.js for setup instructions.'
  )
}

// Create and export the Supabase client
// This client is used throughout the entire app
export const supabase = createClient(
  supabaseUrl || 'https://yzmmtbsmwymsbseurvuo.supabase.co',
  supabaseAnonKey || 'sb_publishable_6GpTzR0rhFO3pQCIlPcdFw_Oz96DWS4',
  {
    auth: {
      // Automatically refresh tokens before they expire
      autoRefreshToken: true,
      // Persist session in localStorage so users stay logged in
      persistSession: true,
      // Detect session from URL (needed for OAuth + magic links)
      detectSessionInUrl: true,
    },
    realtime: {
      // Realtime configuration for live updates
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

// Export helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://placeholder.supabase.co'
  )
}
