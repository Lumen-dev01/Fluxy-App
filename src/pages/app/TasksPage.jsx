import { useState, useEffect } from 'react'
import { Plus, Search, Filter, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { taskService } from '../../services/supabaseService'
import CreateTaskModal from '../../components/tasks/CreateTaskModal'
import Avatar from '../../components/common/Avatar'
import toast from 'react-hot-toast'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const load = async () => {
    try {
      const data = await taskService.getByUser(user.id)
      setTasks(data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) load() }, [user])

  const handleToggle = async (task) => {
    await taskService.update(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
    load()
  }

  const handleDelete = async (id) => {
    await taskService.delete(id)
    toast.success('Task deleted')
    load()
  }

  const filtered = tasks
    .filter(t => t.title?.toLowerCase().includes(search.toLowerCase()))
    .filter(t => filterPriority === 'all' || t.priority === filterPriority)
    .filter(t => filterStatus === 'all' || t.status === filterStatus)
    .sort((a, b) => (PRIORITY_ORDER[a.priority] || 2) - (PRIORITY_ORDER[b.priority] || 2))

  const grouped = {
    todo: filtered.filter(t => t.status === 'todo' || !t.status),
    in_progress: filtered.filter(t => t.status === 'in_progress'),
    done: filtered.filter(t => t.status === 'done'),
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Tasks</h1>
          <p className="text-sm text-zinc-500">{tasks.length} total · {grouped.done.length} completed</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="input-field pl-9 py-2 text-sm w-64" />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field py-2 text-sm w-auto">
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle2 size={48} className="text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400 mb-2">No tasks found</h3>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-2">Create Task</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Object.entries({ 'To Do': grouped.todo, 'In Progress': grouped.in_progress, 'Done': grouped.done }).map(([label, items]) => (
            <div key={label} className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-200 text-sm">{label}</h3>
                <span className="text-xs bg-white/10 text-zinc-400 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(task => (
                  <div key={task.id} className="bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl p-3 cursor-pointer group transition-all">
                    <div className="flex items-start gap-2.5">
                      <button onClick={() => handleToggle(task)} className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 ${task.status === 'done' ? 'bg-violet-600 border-violet-600' : 'border-zinc-600 hover:border-violet-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>{task.title}</p>
                        {task.description && <p className="text-xs text-zinc-600 mt-0.5 line-clamp-1">{task.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={task.priority === 'high' ? 'badge-high' : task.priority === 'medium' ? 'badge-medium' : 'badge-low'}>
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="flex items-center gap-1 text-xs text-zinc-600">
                              <Clock size={10} />{new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {task.projects && (
                          <p className="text-xs text-violet-400 mt-1.5 truncate">{task.projects.name}</p>
                        )}
                      </div>
                      <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {task.profiles && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                        <Avatar src={task.profiles.avatar_url} name={task.profiles.full_name} size="xs" />
                        <span className="text-xs text-zinc-500">{task.profiles.full_name}</span>
                      </div>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-center text-xs text-zinc-700 py-6">No {label.toLowerCase()} tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTaskModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load() }} />
    </div>
  )
}
