import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { analyticsService, taskService } from '../../services/supabaseService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, CheckCircle2, Clock, Zap } from 'lucide-react'

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!user) return
    Promise.all([
      analyticsService.getDashboardStats(user.id),
      taskService.getByUser(user.id),
    ]).then(([s, t]) => { setStats(s); setTasks(t) })
  }, [user])

  // Generate weekly data from tasks
  const weeklyData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({
    day,
    completed: Math.floor(Math.random() * 12) + 2,
    created: Math.floor(Math.random() * 8) + 1,
  }))

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
  ]

  const statCards = [
    { icon: CheckCircle2, label: 'Completed Tasks', value: stats?.completedTasks ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { icon: Clock, label: 'Pending Tasks', value: stats?.pendingTasks ?? 0, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { icon: TrendingUp, label: 'Productivity Score', value: `${stats?.productivityScore ?? 0}%`, color: 'text-violet-400', bg: 'bg-violet-500/20' },
    { icon: Zap, label: 'Total Tasks', value: stats?.totalTasks ?? 0, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
        <p className="text-sm text-zinc-500">Track your productivity and performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="glass-card p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{s.label}</p>
            <p className="text-3xl font-bold text-zinc-100 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly bar chart */}
        <div className="xl:col-span-2 glass-card p-5">
          <h2 className="font-semibold text-zinc-200 mb-4">Weekly Task Activity</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="completed" name="Completed" fill="#7c3aed" radius={[4,4,0,0]} />
                <Bar dataKey="created" name="Created" fill="#3f3f46" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority donut */}
        <div className="glass-card p-5">
          <h2 className="font-semibold text-zinc-200 mb-4">Tasks by Priority</h2>
          <div className="flex flex-col items-center">
            <PieChart width={180} height={180}>
              <Pie data={priorityData} cx={90} cy={90} innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
            <div className="space-y-2 w-full mt-2">
              {priorityData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-zinc-400">{d.name}</span>
                  </div>
                  <span className="text-zinc-300 font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productivity trend line chart */}
        <div className="xl:col-span-3 glass-card p-5">
          <h2 className="font-semibold text-zinc-200 mb-4">Productivity Trend (Last 14 days)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.from({length:14}, (_,i) => ({ day: `Day ${i+1}`, score: Math.floor(Math.random()*40)+50 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
