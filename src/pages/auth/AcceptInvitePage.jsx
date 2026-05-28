// =============================================
// ACCEPT INVITE PAGE
//
// When a team member clicks an invitation link,
// they land on this page.
//
// Flow:
// 1. Read token from URL
// 2. Validate token against invitations table
// 3. If valid, show signup/login form
// 4. After auth, auto-join the workspace/project
// =============================================

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import AuthLayout from './AuthLayout'
import { Users, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react'

export default function AcceptInvitePage() {
  const { token } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [invitation, setInvitation] = useState(null)
  const [status, setStatus] = useState('loading') // loading | valid | invalid | accepting
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('signup') // signup | login

  // Step 1: Validate the invite token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus('invalid')
        return
      }
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*, projects(name), profiles!invitations_inviter_id_fkey(full_name)')
          .eq('token', token)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .single()

        if (error || !data) {
          setStatus('invalid')
          return
        }
        setInvitation(data)
        setStatus('valid')
      } catch {
        setStatus('invalid')
      }
    }
    validateToken()
  }, [token])

  // Step 2: If already logged in with the right email, auto-accept
  useEffect(() => {
    if (status === 'valid' && user && invitation) {
      if (user.email === invitation.email) {
        handleAcceptInvite()
      }
    }
  }, [status, user, invitation])

  // Step 3: Accept the invitation (join workspace/project)
  const handleAcceptInvite = async () => {
    if (!invitation) return
    setStatus('accepting')

    try {
      // Add user to project_members
      const { error: memberError } = await supabase
        .from('project_members')
        .upsert({
          project_id: invitation.project_id,
          user_id: user?.id,
          role: invitation.role || 'member',
          joined_at: new Date().toISOString(),
        })

      if (memberError) throw memberError

      // Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('token', token)

      // Create welcome notification
      await supabase.from('notifications').insert({
        user_id: user?.id,
        title: 'Workspace joined!',
        message: `You've joined ${invitation.projects?.name || 'the project'}. Welcome to the team!`,
        type: 'success',
        read: false,
      })

      toast.success('Welcome to the team!')
      navigate('/app/dashboard')
    } catch (err) {
      toast.error('Failed to accept invitation: ' + err.message)
      setStatus('valid')
    }
  }

  // Handle form submission (signup or login then accept)
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (authMode === 'signup') {
      if (!fullName || !password) return toast.error('Fill in all fields')
      const { data, error } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) { toast.error(error.message); return }
      // After signup, they'll be logged in and the useEffect above will trigger accept
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password,
      })
      if (error) { toast.error(error.message); return }
    }
  }

  // ---- RENDER STATES ----

  if (status === 'loading') {
    return (
      <AuthLayout title="Validating invitation...">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthLayout>
    )
  }

  if (status === 'invalid') {
    return (
      <AuthLayout title="Invalid invitation">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-zinc-400 text-sm mb-4">
            This invitation link is invalid or has expired.
          </p>
          <Link to="/signup" className="btn-primary inline-block">Create Account</Link>
        </div>
      </AuthLayout>
    )
  }

  if (status === 'accepting') {
    return (
      <AuthLayout title="Joining workspace...">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Setting up your workspace...</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="You're invited!" subtitle={`Join ${invitation?.projects?.name || 'a project'} on Fluxy`}>
      {/* Invite details card */}
      <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 mb-6 text-center">
        <div className="w-10 h-10 rounded-full bg-violet-600/30 flex items-center justify-center mx-auto mb-2">
          <Users size={20} className="text-violet-400" />
        </div>
        <p className="text-sm text-zinc-300">
          <strong className="text-violet-400">{invitation?.profiles?.full_name || 'Someone'}</strong>{' '}
          invited <strong className="text-zinc-200">{invitation?.email}</strong> to join
        </p>
        <p className="text-base font-semibold text-zinc-100 mt-1">
          {invitation?.projects?.name || 'a project'}
        </p>
      </div>

      {/* Auth mode toggle */}
      <div className="flex rounded-xl bg-white/5 p-1 mb-5">
        {['signup', 'login'].map(mode => (
          <button
            key={mode}
            onClick={() => setAuthMode(mode)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              authMode === mode
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {mode === 'signup' ? 'New User' : 'Existing User'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field pl-10" required />
            </div>
          </div>
        )}

        {/* Email pre-filled and locked */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email (from invitation)</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="email" value={invitation?.email} readOnly className="input-field pl-10 opacity-60 cursor-not-allowed" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10" required />
          </div>
        </div>

        <button type="submit" className="w-full btn-primary py-3">
          {authMode === 'signup' ? 'Join Workspace' : 'Sign In & Join'}
        </button>
      </form>
    </AuthLayout>
  )
}
