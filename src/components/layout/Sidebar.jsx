// =============================================
// SIDEBAR COMPONENT
//
// Left navigation panel with:
// - FLUXY logo
// - Navigation links
// - Upgrade to Pro CTA
// - User profile at bottom
// =============================================

import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderOpen, CheckSquare, Calendar,
  BarChart3, Users, Settings, Zap, X, MoreHorizontal,
  Plug
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import FluxyLogo from '../common/FluxyLogo'
import Avatar from '../common/Avatar'

// Navigation items configuration
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app/dashboard' },
  { icon: FolderOpen,      label: 'Projects',  to: '/app/projects' },
  { icon: CheckSquare,     label: 'Tasks',     to: '/app/tasks' },
  { icon: Calendar,        label: 'Calendar',  to: '/app/calendar' },
  { icon: BarChart3,       label: 'Analytics', to: '/app/analytics' },
  { icon: Users,           label: 'Team',      to: '/app/team' },
  { icon: Plug,            label: 'Integrations', to: '/app/settings' },
  { icon: Settings,        label: 'Settings',  to: '/app/settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const isPro = profile?.plan === 'pro'

  return (
    <>
      {/* ---- SIDEBAR PANEL ---- */}
      {/* On desktop: always visible (lg:flex). On mobile: slide in when isOpen */}
      <aside className={`
        fixed lg:relative z-30 lg:z-auto
        w-64 h-full flex flex-col
        bg-zinc-900/95 dark:bg-zinc-900/95 backdrop-blur-xl
        border-r border-white/5
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* ---- TOP: Logo + Close button (mobile) ---- */}
        <div className="flex items-center justify-between p-5 pb-6">
          <FluxyLogo />
          {/* Close button only visible on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* ---- NAVIGATION LINKS ---- */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose} // Close sidebar on mobile when nav item clicked
              className={({ isActive }) => `
                nav-item ${isActive ? 'active' : ''}
              `}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ---- UPGRADE TO PRO CARD (only for Basic users) ---- */}
        {!isPro && (
          <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              Unlock advanced features and boost your productivity.
            </p>
            <button
              onClick={() => navigate('/app/settings?tab=billing')}
              className="w-full btn-primary text-xs py-2 text-center"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* ---- USER PROFILE SECTION ---- */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <Avatar
              src={profile?.avatar_url}
              name={profile?.full_name || profile?.email}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {profile?.email}
              </p>
            </div>
            <button className="p-1 rounded-md text-zinc-500 hover:text-zinc-300">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
