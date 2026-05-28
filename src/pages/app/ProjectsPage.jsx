import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Grid3X3, List, FolderOpen, Users, Calendar, ChevronRight, Trash2, Edit2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { projectService } from '../../services/supabaseService'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const PROJECT_COLORS = [
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Green', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
]

function CreateProjectModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [color, setColor] = useState('#8b5cf6')
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Project name is required')
    setLoading(true)
    try {
      await projectService.create({
        name: name.trim(),
        description,
        due_date: dueDate || null,
        priority,
        color,
        status: 'active',
        progress: 0,
      }, user.id)
      toast.success('Project created!')
      onCreated()
      setName(''); setDescription(''); setDueDate(''); setPriority('medium')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleCreate} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Website Redesign" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field resize-none" rows={3} placeholder="What's this project about?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Project Color</label>
          <div className="flex gap-2">
            {PROJECT_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full transition-all ${color === c.value ? 'ring-2 ring-offset-2 ring-offset-zinc-900 ring-white scale-110' : 'hover:scale-105'}`}
                style={{ background: c.value }}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? 'Creating...' : 'Create Project'}</button>
        </div>
      </form>
    </Modal>
  )
}

function ProjectCard({ project, view, onDelete }) {
  const navigate = useNavigate()
  const progress = project.progress || 0
  const color = project.color || '#8b5cf6'

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card flex items-center gap-4 p-4 hover:border-white/20 transition-all cursor-pointer group"
        onClick={() => navigate(`/app/projects/${project.id}`)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}33` }}>
          <FolderOpen size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-200 truncate">{project.name}</p>
          <p className="text-xs text-zinc-500 truncate">{project.description}</p>
        </div>
        <div className="hidden sm:block w-32">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Progress</span><span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full">
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: color }} />
          </div>
        </div>
        <span className={`hidden md:block text-xs font-semibold px-2 py-1 rounded-full ${
          project.priority === 'high' ? 'badge-high' : project.priority === 'medium' ? 'badge-medium' : 'badge-low'
        }`}>{project.priority}</span>
        <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 hover:border-white/20 transition-all cursor-pointer group relative"
      onClick={() => navigate(`/app/projects/${project.id}`)}
    >
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={e => { e.stopPropagation(); onDelete(project.id) }}
          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}33` }}>
          <FolderOpen size={20} style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-200">{project.name}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            project.priority === 'high' ? 'badge-high' : project.priority === 'medium' ? 'badge-medium' : 'badge-low'
          }`}>{project.priority}</span>
        </div>
      </div>
      {project.description && (
        <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{project.description}</p>
      )}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
          <span>Progress</span><span className="font-medium text-zinc-300">{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-1"><Users size={12} /> {project.member_count || 1} members</div>
        {project.due_date && (
          <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(project.due_date).toLocaleDateString()}</div>
        )}
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [view, setView] = useState('grid')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadProjects = async () => {
    if (!user) return
    try {
      const data = await projectService.getAll(user.id)
      setProjects(data)
    } catch (err) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [user])

  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    try {
      await projectService.delete(projectId)
      toast.success('Project deleted')
      loadProjects()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Projects</h1>
          <p className="text-sm text-zinc-500">{projects.length} total projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white/10 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white/10 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Projects */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen size={48} className="text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-400 mb-2">No projects yet</h3>
          <p className="text-sm text-zinc-600 mb-6">Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create Project</button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => <ProjectCard key={p.id} project={p} view="grid" onDelete={handleDelete} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => <ProjectCard key={p.id} project={p} view="list" onDelete={handleDelete} />)}
        </div>
      )}

      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadProjects() }} />
    </div>
  )
}
