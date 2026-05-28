import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Camera, Save, User, Bell, Shield, CreditCard, Upload, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { uploadService } from '../../services/supabaseService'
import Avatar from '../../components/common/Avatar'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
]

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')

  // Profile state
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef()

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    taskAssigned: true, mentions: true, projectUpdates: true,
    invitations: true, deadlines: true, weeklyReport: false,
  })

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setBio(profile.bio || '')
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

  // Handle avatar file selection
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }

    setAvatarFile(file)
    // Show instant preview
    const reader = new FileReader()
    reader.onload = (e) => setAvatarPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  // Upload avatar to Supabase Storage
  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for UX (real progress requires XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 85))
      }, 200)

      const publicUrl = await uploadService.uploadAvatar(user.id, avatarFile)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Update profile with new avatar URL
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      await refreshProfile()
      setAvatarUrl(publicUrl)
      setAvatarPreview(null)
      setAvatarFile(null)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Upload avatar first if new one selected
      if (avatarFile) await handleAvatarUpload()

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, bio, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error
      await refreshProfile()
      toast.success('Profile saved!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Change password
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [changingPass, setChangingPass] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPass.length < 6) return toast.error('Password must be at least 6 characters')
    setChangingPass(true)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setChangingPass(false)
    if (error) toast.error(error.message)
    else { toast.success('Password updated!'); setCurrentPass(''); setNewPass('') }
  }

  const isPro = profile?.plan === 'pro'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="glass-card p-2 space-y-0.5">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}>
                <tab.icon size={16} />{tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-zinc-100">Profile Settings</h2>

              {/* Avatar section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar
                    src={avatarPreview || avatarUrl}
                    name={fullName}
                    size="2xl"
                  />
                  {/* Camera overlay button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-500 border-2 border-zinc-900 flex items-center justify-center transition-all"
                  >
                    <Camera size={15} className="text-white" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                </div>

                <div>
                  <p className="font-semibold text-zinc-200">{profile?.full_name || 'User'}</p>
                  <p className="text-sm text-zinc-500">{profile?.email}</p>
                  <p className="text-xs text-violet-400 capitalize mt-1">{profile?.plan || 'Basic'} Plan</p>

                  {/* Show upload progress/button when file selected */}
                  {avatarFile && (
                    <div className="mt-3">
                      {uploading ? (
                        <div className="w-48">
                          <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span>Uploading...</span><span>{uploadProgress}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <button onClick={handleAvatarUpload} className="text-xs btn-primary py-1.5 px-3 flex items-center gap-1.5">
                          <Upload size={12} /> Upload Photo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                  <input value={profile?.email || ''} readOnly className="input-field opacity-50 cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell your team about yourself..." className="input-field resize-none" />
                </div>
              </div>

              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-zinc-100">Notification Preferences</h2>
              {Object.entries(notifPrefs).map(([key, val]) => {
                const labels = {
                  taskAssigned: 'Task assignments', mentions: 'Mentions & comments',
                  projectUpdates: 'Project updates', invitations: 'Team invitations',
                  deadlines: 'Deadline reminders', weeklyReport: 'Weekly productivity report',
                }
                return (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{labels[key]}</p>
                    </div>
                    <button onClick={() => setNotifPrefs(p => ({ ...p, [key]: !val }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${val ? 'bg-violet-600' : 'bg-zinc-700'}`}>
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${val ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                )
              })}
              <button onClick={() => toast.success('Preferences saved!')} className="btn-primary mt-2">Save Preferences</button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-5">Security Settings</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="input-field" placeholder="Min. 6 characters" required />
                </div>
                <button type="submit" disabled={changingPass} className="btn-primary flex items-center gap-2">
                  <Shield size={15} />{changingPass ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              {/* Current plan */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">Current Plan</h2>
                <div className={`p-5 rounded-2xl border ${isPro ? 'border-violet-500/30 bg-violet-600/10' : 'border-white/10 bg-white/3'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-zinc-100 capitalize">{profile?.plan || 'Basic'} Plan</p>
                      <p className="text-sm text-zinc-400 mt-1">{isPro ? 'Full access to all features' : 'Limited to 5 projects and 3 team members'}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${isPro ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                      {isPro ? 'Active' : 'Free'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plans comparison */}
              {!isPro && (
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-zinc-200 mb-4">Upgrade to Pro</h3>
                  <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/40 border border-violet-500/30 rounded-2xl p-6">
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-3xl font-bold text-zinc-100">$12</span>
                      <span className="text-zinc-500 pb-1">/ user / month</span>
                    </div>
                    <ul className="space-y-2 mb-5 text-sm">
                      {['Unlimited projects', 'Unlimited team members', 'Advanced analytics', 'Priority support', 'AI Assistant', 'Custom integrations'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-zinc-300">
                          <CheckCircle size={14} className="text-violet-400" />{f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => toast.success('Redirecting to checkout... (Connect payment processor)')}
                      className="w-full btn-primary"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
