// =============================================
// DASHBOARD PAGE
//
// Main app screen shown after login.
// Shows: stats, today's tasks, project overview,
//        productivity chart, AI assistant panel.
//
// IMPORTANT: User's real name is shown dynamically
// from the profile - never hardcoded!
// =============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, Calendar, CheckCircle2, FolderOpen, Zap,
  ChevronDown, ArrowUpRight, ChevronRight, Clock,
  Sparkles, Send, Play, RotateCcw, TrendingUp
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { taskService, analyticsService } from '../../services/supabaseService'
import Avatar from '../../components/common/Avatar'
import CreateTaskModal from '../../components/tasks/CreateTaskModal'
import toast from 'react-hot-toast'

// Get time-based greeting
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Priority badge component
function PriorityBadge({ priority }) {
  const map = {
    high:   'badge-high',
    medium: 'badge-medium',
    low:    'badge-low',
  }
  return (
    <span className={map[priority] || map.low}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  )
}

// Sparkline component (mini trend chart)
function Sparkline({ color = '#8b5cf6' }) {
  const data = [4, 7, 5, 10, 8, 12, 9]
  return (
    <svg width="80" height="30" viewBox="0 0 80 30">
      <polyline
        points={data.map((v, i) => `${i * 13},${30 - v * 2.2}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Stat card component
function StatCard({ icon: Icon, iconBg, label, value, sub, subColor, trend, sparkColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
        <Sparkline color={sparkColor} />
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-zinc-100">{value}</p>
        <p className={`text-xs font-medium ${subColor}`}>{sub}</p>
      </div>
    </motion.div>
  )
}

// Weekly chart data (calculated from tasks)
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiMessage, setAiMessage] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)

  // Load dashboard data
  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          analyticsService.getDashboardStats(user.id),
          taskService.getByUser(user.id),
        ])
        setStats(statsData)
        setTasks(tasksData.slice(0, 5)) // Show max 5 today's tasks

        // Load user's projects
        const { data: projData } = await supabase
          .from('project_members')
          .select('projects(*)')
          .eq('user_id', user.id)
          .limit(6)

        setProjects((projData || []).map(p => p.projects).filter(Boolean))
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()

    // Real-time subscription for task updates
    const subscription = supabase
      .channel('dashboard-tasks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `assigned_to=eq.${user.id}`,
      }, () => {
        loadData() // Refresh on any task change
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [user])

  // Focus mode timer
  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 0) {
          setTimerRunning(false)
          toast.success('Focus session complete! 🎉')
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Chart data - mock weekly productivity
  const chartData = WEEK_DAYS.map((day, i) => ({
    day,
    completed: Math.floor(Math.random() * 15) + 3,
    pending: Math.floor(Math.random() * 10) + 1,
  }))

  const pieData = [
    { name: 'Completed', value: stats?.completedTasks || 0 },
    { name: 'Pending', value: stats?.pendingTasks || 0 },
  ]

  // Project color map
  const projectColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Get first name from profile (or email prefix)
  const firstName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : profile?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-full">
      {/* ---- HEADER ---- */}
      <div className="flex items-start justify-between mb-8">
        <div>
          {/* Dynamic greeting with REAL user name */}
          <h1 className="text-2xl font-bold text-zinc-100">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Here's what's happening with your work today.
          </p>
        </div>

        {/* New Task button */}
        <button
          onClick={() => setShowCreateTask(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Task
          <ChevronDown size={14} className="opacity-60" />
        </button>
      </div>

      {/* ---- STAT CARDS ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Calendar}
          iconBg="bg-gradient-to-br from-violet-500 to-indigo-600"
          label="Tasks Due Today"
          value={stats?.tasksDueToday ?? 0}
          sub={`● ${stats?.highPriorityTasks ?? 0} high priority`}
          subColor="text-red-400"
          sparkColor="#8b5cf6"
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
          label="Completed Tasks"
          value={stats?.completedTasks ?? 0}
          sub="↑ 16% from yesterday"
          subColor="text-emerald-400"
          sparkColor="#06b6d4"
        />
        <StatCard
          icon={FolderOpen}
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
          label="Ongoing Projects"
          value={stats?.ongoingProjects ?? 0}
          sub="● 3 on track"
          subColor="text-emerald-400"
          sparkColor="#10b981"
        />
        <StatCard
          icon={Zap}
          iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
          label="Productivity Score"
          value={`${stats?.productivityScore ?? 0}%`}
          sub="↑ 12% from last week"
          subColor="text-emerald-400"
          sparkColor="#f59e0b"
        />
      </div>

      {/* ---- MAIN CONTENT GRID ---- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">

        {/* TODAY'S TASKS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-2 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-100">Today's Tasks</h2>
            <div className="flex items-center gap-2">
              {['All', 'High', 'Medium', 'Low'].map(f => (
                <button key={f} className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  f === 'All'
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}>
                  {f}
                </button>
              ))}
              <button
                onClick={() => navigate('/app/tasks')}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 ml-2"
              >
                View All <ArrowUpRight size={12} />
              </button>
            </div>
          </div>

          {/* Task list */}
          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 size={32} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No tasks assigned yet.</p>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="mt-3 text-xs text-violet-400 hover:text-violet-300"
                >
                  + Create your first task
                </button>
              </div>
            ) : tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group cursor-pointer"
              >
                {/* Complete toggle */}
                <button
                  onClick={() => taskService.update(task.id, {
                    status: task.status === 'done' ? 'todo' : 'done'
                  })}
                  className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                    task.status === 'done'
                      ? 'bg-violet-600 border-violet-600'
                      : 'border-zinc-600 hover:border-violet-500'
                  }`}
                >
                  {task.status === 'done' && <CheckCircle2 size={12} className="text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
                    {task.title}
                  </p>
                </div>

                <PriorityBadge priority={task.priority} />

                <span className="text-xs text-zinc-600 hidden sm:block">
                  {task.projects?.name}
                </span>

                {task.due_date && (
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock size={11} />
                    {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}

                {/* Assignee avatar */}
                <Avatar
                  src={task.profiles?.avatar_url}
                  name={task.profiles?.full_name}
                  size="xs"
                />
              </div>
            ))}
          </div>

          {/* Add Task */}
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 mt-3 w-full py-2.5 rounded-xl border border-dashed border-white/10 text-sm text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 transition-all"
          >
            <Plus size={14} className="mx-auto" />
            <span>Add Task</span>
          </button>
        </motion.div>

        {/* PROJECTS OVERVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-100">Projects Overview</h2>
            <button
              onClick={() => navigate('/app/projects')}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View All <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="space-y-3.5">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen size={28} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No projects yet.</p>
                <button
                  onClick={() => navigate('/app/projects')}
                  className="mt-2 text-xs text-violet-400 hover:text-violet-300"
                >
                  + Create project
                </button>
              </div>
            ) : projects.map((proj, idx) => {
              const progress = proj.progress || Math.floor(Math.random() * 80) + 10
              return (
                <div
                  key={proj.id}
                  onClick={() => navigate(`/app/projects/${proj.id}`)}
                  className="cursor-pointer hover:bg-white/3 p-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${projectColors[idx % projectColors.length]}33` }}
                    >
                      <FolderOpen size={15} style={{ color: projectColors[idx % projectColors.length] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{proj.name}</p>
                      <p className="text-xs text-zinc-500">{proj.task_count || 0} tasks</p>
                    </div>
                    <span className="text-xs font-semibold text-zinc-300">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${projectColors[idx % projectColors.length]}, ${projectColors[(idx + 1) % projectColors.length]})`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* ---- BOTTOM ROW: Chart + AI Assistant + Focus Mode ---- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* PRODUCTIVITY CHART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-zinc-100">Productivity Overview</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" />Completed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />Pending</span>
              </div>
              <button className="text-xs text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1">
                This Week <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {/* Bar Chart */}
            <div className="col-span-3 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Bar dataKey="completed" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#3f3f46" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Chart + Stats */}
            <div className="col-span-2 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <PieChart width={120} height={120}>
                  <Pie
                    data={pieData}
                    cx={60} cy={60}
                    innerRadius={38} outerRadius={55}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    <Cell fill="#7c3aed" />
                    <Cell fill="#27272a" />
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-zinc-500">Total</p>
                  <p className="text-lg font-bold text-zinc-100">{stats?.totalTasks || 0}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs w-full px-2">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-400"><span className="w-2 h-2 rounded-full bg-violet-500" />Completed</span>
                  <span className="text-zinc-300 font-medium">{stats?.completedTasks || 0} ({stats?.productivityScore || 0}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-400"><span className="w-2 h-2 rounded-full bg-zinc-600" />Pending</span>
                  <span className="text-zinc-300 font-medium">{stats?.pendingTasks || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: AI Assistant + Focus Mode */}
        <div className="space-y-4">

          {/* AI ASSISTANT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-violet-400" />
              <h2 className="font-semibold text-zinc-100 text-sm">AI Assistant</h2>
            </div>

            {/* AI messages */}
            <div className="space-y-2 mb-3">
              <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-3 text-xs text-zinc-300">
                👋 Hi {firstName}! Here are some suggestions for you today.
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-xs text-zinc-300 flex items-start gap-2 cursor-pointer hover:bg-red-500/15 transition-colors">
                <div className="w-4 h-4 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-[8px]">!</span>
                </div>
                <div>
                  <p className="font-medium text-red-300 mb-0.5">Focus on high priority tasks</p>
                  <p className="text-zinc-500">You have {stats?.highPriorityTasks || 0} high priority tasks due today.</p>
                </div>
                <ChevronRight size={12} className="text-zinc-600 mt-0.5 flex-shrink-0" />
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-xs text-zinc-300 flex items-start gap-2 cursor-pointer hover:bg-emerald-500/15 transition-colors">
                <div className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp size={8} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-emerald-300 mb-0.5">Good time to work</p>
                  <p className="text-zinc-500">You're most productive at this time. Keep it up!</p>
                </div>
                <ChevronRight size={12} className="text-zinc-600 mt-0.5 flex-shrink-0" />
              </div>
            </div>

            {/* AI input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={aiMessage}
                onChange={e => setAiMessage(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
              />
              <button
                onClick={() => {
                  if (aiMessage.trim()) {
                    toast.success('AI Assistant coming soon!')
                    setAiMessage('')
                  }
                }}
                className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors"
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
          </motion.div>

          {/* FOCUS MODE (Pomodoro timer) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-zinc-100 text-sm">Focus Mode</h2>
              {/* Toggle switch */}
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`relative w-10 h-6 rounded-full transition-colors ${focusMode ? 'bg-violet-600' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${focusMode ? 'translate-x-4' : ''}`} />
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-1">Deep Work Time</p>
              <p className="text-4xl font-bold text-zinc-100 font-mono mb-4">
                {formatTime(timerSeconds)}
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-all hover:scale-105"
                >
                  {timerRunning
                    ? <div className="flex gap-0.5"><div className="w-1 h-4 bg-white rounded" /><div className="w-1 h-4 bg-white rounded" /></div>
                    : <Play size={18} className="text-white ml-0.5" />
                  }
                </button>
                <button
                  onClick={() => { setTimerRunning(false); setTimerSeconds(25 * 60) }}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <p className="text-xs text-zinc-600 mt-3">Eliminate distractions. Achieve more.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onCreated={() => {
          setShowCreateTask(false)
          // Reload tasks
          taskService.getByUser(user.id).then(data => setTasks(data.slice(0, 5)))
        }}
      />
    </div>
  )
}
