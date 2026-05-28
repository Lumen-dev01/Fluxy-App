import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { taskService } from '../../services/supabaseService'
import { supabase } from '../../lib/supabase'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'

export default function CreateTaskModal({ isOpen, onClose, onCreated, projectId = null }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('todo')
  const [dueDate, setDueDate] = useState('')
  const [selectedProject, setSelectedProject] = useState(projectId || '')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || !isOpen) return
    supabase
      .from('project_members')
      .select('projects(id, name)')
      .eq('user_id', user.id)
      .then(({ data }) => setProjects((data || []).map(d => d.projects).filter(Boolean)))
  }, [user, isOpen])

  const reset = () => {
    setTitle(''); setDescription(''); setPriority('medium')
    setStatus('todo'); setDueDate(''); setSelectedProject(projectId || '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return toast.error('Task title required')
    setLoading(true)
    try {
      await taskService.create({
        title: title.trim(),
        description,
        priority,
        status,
        due_date: dueDate || null,
        project_id: selectedProject || null,
        assigned_to: user.id,
      })
      toast.success('Task created!')
      reset()
      onCreated?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose() }} title="Create New Task">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Task Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="What needs to be done?" required autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field resize-none" rows={3} placeholder="Add more context..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field">
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Due Date</label>
            <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project</label>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="input-field">
              <option value="">No project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => { reset(); onClose() }} className="flex-1 btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? 'Creating...' : 'Create Task'}</button>
        </div>
      </form>
    </Modal>
  )
}
