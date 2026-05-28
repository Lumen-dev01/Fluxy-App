// =============================================
// APP LAYOUT
//
// This is the "shell" that wraps all authenticated pages.
// It renders:
//   - Sidebar (left navigation)
//   - Topbar (search, notifications, user menu)
//   - Main content area (where page content goes)
//
// <Outlet /> is where React Router renders the current page.
// =============================================

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

export default function AppLayout() {
  // Controls whether sidebar is collapsed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 dark:bg-zinc-950 transition-colors duration-300">
      {/* ---- SIDEBAR ---- */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay: click outside sidebar to close */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---- MAIN AREA (Topbar + Page Content) ---- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content with scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 animate-fade-in">
            {/* React Router renders the current page here */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
