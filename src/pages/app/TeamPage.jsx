import { useState, useEffect } from 'react'
import { Plus, Mail, Search, UserPlus, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { invitationService } from '../../services/supabaseService'
import InviteModal from '../../components/team/InviteModal'
import Avatar from '../../components/common/Avatar'
import toast from 'react-hot-toast'

export default function TeamPage() {
  const { user, profile } = useAuth()
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [projects, setProjects] = useState([])
  const [showInvite, setShowInvite] = useState(false)
  const [selectedProject, setSelectedProject] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      // Get all projects the user owns
      const { data: projData } = await supabase
        .from('projects')
        .select('id, name')
        .eq('owner_id', user.id)

      setProjects(projData || [])
      if (projData?.length > 0 && !selectedProject) {
        setSelectedProject(projData[0].id)
      }

      // Get all team members across user's projects
      const { data: memberData } = await supabase
        .from('project_members')
        .select(`
          user_id, role, joined_at,
          profiles(id, full_name, email, avatar_url),
          projects(name)
        `)
        .in('project_id', (projData || []).map(p => p.id))

      // Deduplicate members by user_id
      const uniqueMembers = Object.values(
        (memberData || []).reduce((acc, m) => {
          if (!acc[m.user_id]) acc[m.user_id] = { ...m, projectNames: [] }
          acc[m.user_id].projectNames.push(m.projects?.name)
          return acc
        }, {})
      )
      setMembers(uniqueMembers)

      // Get pending invitations
      if (projData?.length > 0) {
        const { data: invData } = await supabase
          .from('invitations')
          .select('*')
          .in('project_id', projData.map(p => p.id))
          .eq('status', 'pending')
        setInvitations(invData || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const cancelInvite = async (id) => {
    await invitationService.cancel(id)
    toast.success('Invitation cancelled')
    loadData()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Team</h1>
          <p className="text-sm text-zinc-500">{members.length} members · {invitations.length} pending invites</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Members list */}
          <div className="xl:col-span-2">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Active Members</h2>
            {members.length === 0 ? (
              <div className="glass-card text-center py-16">
                <UserPlus size={36} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 mb-4">No team members yet. Invite someone to get started!</p>
                <button onClick={() => setShowInvite(true)} className="btn-primary">Invite Member</button>
              </div>
            ) : (
              <div className="glass-card divide-y divide-white/5">
                {members.map(m => (
                  <div key={m.user_id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                    <Avatar src={m.profiles?.avatar_url} name={m.profiles?.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-200">{m.profiles?.full_name || 'Team Member'}</p>
                      <p className="text-sm text-zinc-500">{m.profiles?.email}</p>
                      <p className="text-xs text-violet-400 mt-0.5">{m.projectNames?.filter(Boolean).join(', ')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        m.role === 'owner' ? 'text-violet-400 bg-violet-500/20 border-violet-500/30' : 'text-zinc-400 bg-white/5 border-white/10'
                      }`}>{m.role}</span>
                      {m.joined_at && (
                        <span className="text-xs text-zinc-600">
                          Joined {new Date(m.joined_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending invitations */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Pending Invitations</h2>
            {invitations.length === 0 ? (
              <div className="glass-card text-center py-10">
                <Mail size={28} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-600">No pending invitations</p>
              </div>
            ) : (
              <div className="glass-card divide-y divide-white/5">
                {invitations.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                      <Mail size={15} className="text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 truncate">{inv.email}</p>
                      <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                        <Clock size={10} />
                        Expires {new Date(inv.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button onClick={() => cancelInvite(inv.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Cancel</button>
                  </div>
                ))}
              </div>
            )}

            {/* Invite link info */}
            <div className="glass-card p-4 mt-4 border-violet-500/20 bg-violet-500/5">
              <p className="text-xs font-semibold text-violet-300 mb-1">How invitations work</p>
              <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
                <li>Enter team member's email</li>
                <li>They receive an invite email</li>
                <li>They click the link to join</li>
                <li>They get access to the project</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        projectId={selectedProject}
        projects={projects}
        onInvited={loadData}
      />
    </div>
  )
}
