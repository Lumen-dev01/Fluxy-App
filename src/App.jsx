// =============================================
// APP.JSX - ROOT ROUTING
//
// This file defines ALL routes in FLUXY.
// It also contains the ProtectedRoute component
// which redirects to login if user is not authenticated.
// =============================================

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout
import AppLayout from './layout/AppLayout'

// Pages - Public
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import AcceptInvitePage from './pages/auth/AcceptInvitePage'

// Pages - Protected (require login)
import DashboardPage from './pages/app/DashboardPage'
import ProjectsPage from './pages/app/ProjectsPage'
import ProjectDetailPage from './pages/app/ProjectDetailPage'
import TasksPage from './pages/app/TasksPage'
import CalendarPage from './pages/app/CalendarPage'
import AnalyticsPage from './pages/app/AnalyticsPage'
import TeamPage from './pages/app/TeamPage'
import SettingsPage from './pages/app/SettingsPage'

// Loading spinner shown while checking auth state
import LoadingScreen from './components/common/LoadingScreen'

// ProtectedRoute: If not logged in, redirect to /login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Still checking if user is logged in
  if (loading) return <LoadingScreen />

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />

  // Logged in → render the page
  return children
}

// PublicRoute: If already logged in, redirect to dashboard
// (so logged-in users don't see login/signup pages)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (user) return <Navigate to="/app/dashboard" replace />

  return children
}

export default function App() {
  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes - redirect to dashboard if already logged in */}
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute><SignupPage /></PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute><ForgotPasswordPage /></PublicRoute>
      } />
      {/* Reset password works even when logged in */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Invitation acceptance page - accessible without auth */}
      <Route path="/invite/:token" element={<AcceptInvitePage />} />

      {/* ========== PROTECTED APP ROUTES ========== */}
      {/* All /app/* routes require authentication */}
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        {/* Default: redirect /app to /app/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
