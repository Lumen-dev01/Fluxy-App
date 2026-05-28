import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Info, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { notificationService } from '../../services/supabaseService'
import { supabase } from '../../lib/supabase'

const NOTIF_ICONS = {
  info: { icon: Info, bg: 'bg-blue-500/20', color: 'text-blue-400' },
  success: { icon: CheckCircle, bg: 'bg-emerald-500/20', color: 'text-emerald-400' },
  warning: { icon: AlertCircle, bg: 'bg-amber-500/20', color: 'text-amber-400' },
  error: { icon: AlertCircle, bg: 'bg-red-500/20', color: 'text-red-400' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotificationDropdown({ onClose }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user) return
    const data = await notificationService.getAll(user.id)
    setNotifications(data)
    setLoading(false)
  }

  useEffect(() => {
    load()

    // Real-time: listen for new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const handleMarkRead = async (id) => {
    await notificationService.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-zinc-400" />
          <h3 className="font-semibold text-zinc-200 text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <Bell size={28} className="text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-600">All caught up!</p>
          </div>
        ) : notifications.map(notif => {
          const type = NOTIF_ICONS[notif.type] || NOTIF_ICONS.info
          const Icon = type.icon
          return (
            <div
              key={notif.id}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-white/3 transition-colors border-b border-white/3 last:border-0 ${!notif.read ? 'bg-violet-600/5' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full ${type.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon size={14} className={type.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${notif.read ? 'text-zinc-400' : 'text-zinc-200'}`}>{notif.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{notif.message}</p>
                <p className="text-xs text-zinc-700 mt-1">{timeAgo(notif.created_at)}</p>
              </div>
              {!notif.read && (
                <button onClick={() => handleMarkRead(notif.id)} className="flex-shrink-0 p-1 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/5">
                  <Check size={13} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
