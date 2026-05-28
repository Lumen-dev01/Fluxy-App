import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Users, Calendar, Edit2, Trash2, CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { projectService, taskService } from '../../services/supabaseService'
import CreateTaskModal from '../../components/tasks/CreateTaskModal'
import InviteModal from '../../components/team/InviteModal'
import Avatar from '../../components/common/Avatar'
import toast from 'react-hot-toast'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  const load = async () => {
    try {
      const [proj, taskData] = await Promise.all([
        projectService.getById(id),
        taskService.getByProject(id),
      ])
      setProject(proj)
      setTasks(taskData)
    } catch (err) {
      toast.error('Failed to load project')
      navigate('/app/projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleDeleteTask = async (taskId) => {
    await taskService.delete(taskId)
    toast.success('Task deleted')
    load()
  }

  const handleToggleTask = async (task) => {
    await taskService.update(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
    load()
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!project) return null

  const color = project.color || '#8b5cf6'
  const members = project.project_members || []
  const done = tasks.filter(t => t.status === 'done').length
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  const statusColors = {
    todo: 'text-zinc-400 bg-zinc-800',
    in_progress: 'text-blue-400 bg-blue-500/20',
    done: 'text-emerald-400 bg-emerald-500/20',
  }

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/app/projects')} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Project header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${color}33` }}>
              <span className="text-2xl">📁</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">{project.name}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowInvite(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Users size={15} /> Invite Members
            </button>
            <button onClick={() => setShowCreateTask(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> Add Task
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between text-sm text-zinc-400 mb-2">
            <span>Overall Progress</span>
            <span className="font-semibold text-zinc-200">{progress}% ({done}/{tasks.length} tasks)</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-6 mt-4 text-sm text-zinc-500">
          {project.due_date && (
            <div className="flex items-center gap-1.5"><Calendar size={14} /> Due {new Date(project.due_date).toLocaleDateString()}</div>
          )}
          <div className="flex items-center gap-1.5"><Users size={14} /> {members.length} members</div>
          <div className="flex -space-x-2">
            {members.slice(0, 5).map(m => (
              <Avatar key={m.user_id} src={m.profiles?.avatar_url} name={m.profiles?.full_name} size="xs" className="ring-2 ring-zinc-900" />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1 w-fit">
        {['tasks', 'members'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks tab */}
      {activeTab === 'tasks' && (
        <div className="glass-card">
          {tasks.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 size={36} className="text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 mb-4">No tasks yet. Add the first one!</p>
              <button onClick={() => setShowCreateTask(true)} className="btn-primary">Add Task</button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Task', 'Status', 'Priority', 'Assignee', 'Due Date', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-zinc-500 px-4 py-3 first:pl-6 last:pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-white/3 group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggleTask(task)}
                          className={`w-5 h-5 rounded-full border flex-shrink-0 transition-all ${task.status === 'done' ? 'bg-violet-600 border-violet-600' : 'border-zinc-600 hover:border-violet-500'}`}>
                          {task.status === 'done' && <CheckCircle2 size={12} className="text-white mx-auto" />}
                        </button>
                        <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>{task.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status] || statusColors.todo}`}>
                        {(task.status || 'todo').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={task.priority === 'high' ? 'badge-high' : task.priority === 'medium' ? 'badge-medium' : 'badge-low'}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {task.profiles ? (
                        <div className="flex items-center gap-2">
                          <Avatar src={task.profiles.avatar_url} name={task.profiles.full_name} size="xs" />
                          <span className="text-xs text-zinc-400 hidden sm:block">{task.profiles.full_name}</span>
                        </div>
                      ) : <span className="text-xs text-zinc-600">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      {task.due_date ? (
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock size={11} />{new Date(task.due_date).toLocaleDateString()}
                        </div>
                      ) : <span className="text-xs text-zinc-700">—</span>}
                    </td>
                    <td className="pr-6 py-3">
                      <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="glass-card divide-y divide-white/5">
          {members.map(m => (
            <div key={m.user_id} className="flex items-center gap-4 px-6 py-4">
              <Avatar src={m.profiles?.avatar_url} name={m.profiles?.full_name} size="md" />
              <div className="flex-1">
                <p className="font-medium text-zinc-200">{m.profiles?.full_name || 'Team Member'}</p>
                <p className="text-sm text-zinc-500">{m.profiles?.email}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                m.role === 'owner' ? 'text-violet-400 bg-violet-500/20 border-violet-500/30' : 'text-zinc-400 bg-white/5 border-white/10'
              }`}>{m.role}</span>
            </div>
          ))}
          <div className="p-4">
            <button onClick={() => setShowInvite(true)} className="w-full border border-dashed border-white/10 rounded-xl py-3 text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all flex items-center justify-center gap-2">
              <Plus size={15} /> Invite Team Member
            </button>
          </div>
        </div>
      )}

      <CreateTaskModal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} projectId={id} onCreated={() => { setShowCreateTask(false); load() }} />
      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} projectId={id} />
    </div>
  )
}
