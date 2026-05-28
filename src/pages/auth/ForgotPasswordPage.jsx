import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import AuthLayout from './AuthLayout'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) toast.error(error.message)
    else setSent(true)
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-violet-400" />
          </div>
          <h3 className="font-semibold text-zinc-200 mb-2">Check your inbox</h3>
          <p className="text-sm text-zinc-400">We sent a reset link to <strong>{email}</strong></p>
          <Link to="/login" className="inline-flex items-center gap-2 mt-6 text-sm text-violet-400 hover:text-violet-300">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mt-2">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}

export default ForgotPasswordPage
