// =============================================
// TOPBAR COMPONENT
//
// Top navigation bar with:
// - Mobile hamburger menu
// - Global search bar
// - Theme toggle
// - Notification bell
// - User profile dropdown
// =============================================

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Sun, Moon, Bell, ChevronDown, LogOut, User, Settings, Command } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../common/Avatar'
import NotificationDropdown from '../notifications/NotificationDropdown'

export default function Topbar({ onMenuClick }) {
  const { profile, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="
      flex items-center gap-4 px-6 py-4
      border-b border-white/5
      bg-zinc-900/50 backdrop-blur-xl
      sticky top-0 z-10
    ">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
      >
        <Menu size={20} />
      </button>

      {/* ---- SEARCH BAR ---- */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tasks, projects, anything..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="
              w-full pl-9 pr-16 py-2.5 rounded-xl text-sm
              bg-white/5 border border-white/8
              text-zinc-300 placeholder-zinc-600
              focus:outline-none focus:border-violet-500/50 focus:bg-white/8
              transition-all duration-200
            "
          />
          {/* Keyboard shortcut hint */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Command size={11} className="text-zinc-600" />
            <span className="text-xs text-zinc-600 font-mono">K</span>
          </div>
        </div>
      </div>

      {/* ---- RIGHT ACTIONS ---- */}
      <div className="flex items-center gap-2 ml-auto">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* ---- NOTIFICATIONS ---- */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false)
            }}
            className="relative p-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
          >
            <Bell size={18} />
            {/* Unread badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* ---- USER MENU ---- */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
          >
            <Avatar
              src={profile?.avatar_url}
              name={profile?.full_name || profile?.email}
              size="sm"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-zinc-200 leading-tight">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-zinc-500 capitalize">
                {profile?.plan || 'Basic'} Plan
              </p>
            </div>
            <ChevronDown size={14} className="text-zinc-500" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="
              absolute right-0 top-full mt-2 w-52
              bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50
              py-1.5 z-50 animate-slide-up
            ">
              <div className="px-4 py-2.5 border-b border-white/5">
                <p className="text-sm font-semibold text-zinc-200">{profile?.full_name}</p>
                <p className="text-xs text-zinc-500">{profile?.email}</p>
              </div>

              <button
                onClick={() => { navigate('/app/settings'); setShowUserMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
              >
                <User size={15} /> Profile Settings
              </button>

              <button
                onClick={() => { navigate('/app/settings?tab=billing'); setShowUserMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
              >
                <Settings size={15} /> Billing & Plan
              </button>

              <div className="border-t border-white/5 mt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
