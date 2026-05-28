// =============================================
// INVITE MODAL - CORE FEATURE
//
// This is the team invitation system.
// It creates an invitation record in Supabase
// and triggers an email via Edge Function.
//
// The invite link looks like:
//   https://yourapp.com/invite/{token}
// =============================================

import { useState } from 'react'
import { Mail, Copy, Check, UserPlus, Send } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { invitationService } from '../../services/supabaseService'
import Modal from '../common/Modal'
import toast from 'react-hot-toast'

export default function InviteModal({ isOpen, onClose, projectId, projects = [], onInvited }) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [selectedProject, setSelectedProject] = useState(projectId || '')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Email is required')
    if (!selectedProject && !projectId) return toast.error('Please select a project')

    const targetProject = selectedProject || projectId

    setLoading(true)
    try {
      const invitation = await invitationService.create({
        projectId: targetProject,
        email: email.trim().toLowerCase(),
        inviterId: user.id,
        role,
      })

      // Build the invite link to share
      const link = `${window.location.origin}/invite/${invitation.token}`
      setInviteLink(link)

      toast.success(`Invitation sent to ${email}!`)
      onInvited?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copied to clipboard!')
  }

  const handleClose = () => {
    setEmail('')
    setRole('member')
    setInviteLink(null)
    setCopied(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Team Member">
      <div className="p-6">

        {/* Success state: show invite link */}
        {inviteLink ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                <Check size={28} className="text-emerald-400" />
              </div>
              <h3 className="font-semibold text-zinc-100 text-lg mb-1">Invitation Sent!</h3>
              <p className="text-sm text-zinc-400">
                An email was sent to <strong className="text-zinc-300">{email}</strong>.
                You can also share this link directly:
              </p>
            </div>

            {/* Invite link box */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500 mb-0.5">Invite Link</p>
                <p className="text-sm text-zinc-300 truncate font-mono">{inviteLink}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className={`flex-shrink-0 p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setInviteLink(null); setEmail('') }} className="flex-1 btn-secondary">
                Invite Another
              </button>
              <button onClick={handleClose} className="flex-1 btn-primary">Done</button>
            </div>
          </div>
        ) : (
          /* Invite form */
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-violet-600/10 border border-violet-500/20 rounded-xl mb-2">
              <UserPlus size={16} className="text-violet-400 flex-shrink-0" />
              <p className="text-sm text-zinc-400">
                The invitee will receive an email with a link to join your project.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="teammate@company.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Show project selector only if not already in a project context */}
            {!projectId && projects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project *</label>
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="input-field" required>
                  <option value="">Select a project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="input-field">
                <option value="member">Member — Can view and edit tasks</option>
                <option value="admin">Admin — Can manage members and settings</option>
                <option value="viewer">Viewer — Can view only</option>
              </select>
            </div>

            {/* Important notes */}
            <div className="text-xs text-zinc-600 space-y-1">
              <p>• Invitation link expires in 7 days</p>
              <p>• The invitee doesn't need to have a Fluxy account</p>
              <p>• Email delivery requires the Edge Function to be deployed</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleClose} className="flex-1 btn-secondary">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <Send size={15} />
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
