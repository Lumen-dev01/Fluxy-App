// =============================================
// LANDING PAGE
//
// Marketing homepage shown to non-logged-in visitors.
// Shows: Hero, Features, Pricing CTAs, Social proof
// =============================================

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckSquare, FolderOpen, Users, Zap, ArrowRight,
  Play, Shield, Clock, Star, ChevronDown, Sun, Moon
} from 'lucide-react'
import FluxyLogo from '../components/common/FluxyLogo'
import { useTheme } from '../context/ThemeContext'

// Animation variants for staggered reveals
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
  })
}

// Feature cards data
const FEATURES = [
  {
    icon: CheckSquare,
    color: 'from-violet-500 to-indigo-500',
    title: 'Task Management',
    desc: 'Create, organize, and prioritize tasks easily. Never miss what matters.'
  },
  {
    icon: FolderOpen,
    color: 'from-blue-500 to-cyan-500',
    title: 'Project Tracking',
    desc: 'Break down projects into actionable steps and track progress in real-time.'
  },
  {
    icon: Users,
    color: 'from-emerald-500 to-teal-500',
    title: 'Team Collaboration',
    desc: 'Work together seamlessly with comments, mentions, and sharing.'
  },
  {
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    title: 'Smart Insights',
    desc: 'Get AI-powered insights and analytics to boost your productivity.'
  },
]

// Trusted companies
const COMPANIES = ['Acme Inc.', 'Cloudly', 'Pulse', 'Layer', 'Spherule', 'Visionix']

// Pricing plans
const PLANS = [
  {
    name: 'Basic',
    price: '$0',
    period: 'Forever free',
    features: ['Up to 5 projects', 'Up to 3 team members', 'Basic analytics', '5GB storage', 'Email support'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per user / month',
    features: ['Unlimited projects', 'Unlimited team members', 'Advanced analytics', '100GB storage', 'Priority support', 'AI Assistant', 'Custom integrations'],
    cta: 'Start Pro Trial',
    highlight: true,
  },
]

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-zinc-950 dark:bg-zinc-950 text-zinc-100 overflow-x-hidden">

      {/* ---- NAVBAR ---- */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <FluxyLogo />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#" className="hover:text-zinc-100 transition-colors flex items-center gap-1">
              Solutions <ChevronDown size={14} />
            </a>
            <a href="#pricing" className="hover:text-zinc-100 transition-colors">Pricing</a>
            <a href="#" className="hover:text-zinc-100 transition-colors flex items-center gap-1">
              Resources <ChevronDown size={14} />
            </a>
            <a href="#" className="hover:text-zinc-100 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-zinc-100 px-4 py-2">
              Log in
            </Link>
            <Link to="/signup" className="btn-primary text-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ---- HERO SECTION ---- */}
      <section className="relative pt-24 pb-20 bg-grid bg-spotlight">
        {/* Purple radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* Left: Copy */}
          <div>
            {/* Announcement badge */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-sm text-violet-300 mb-8"
            >
              <Zap size={13} />
              <span className="font-medium">New</span>
              <span className="text-zinc-400">Fluxy AI Assistant is here.</span>
              <span className="text-violet-400 hover:underline cursor-pointer">Learn more →</span>
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-5xl lg:text-6xl font-bold leading-tight mb-4"
            >
              Your work,<br />
              <span className="text-zinc-100">organized.</span>
            </motion.h1>
            <motion.h2
              variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-5xl lg:text-6xl font-bold leading-tight gradient-text mb-6"
            >
              Your productivity,<br />amplified.
            </motion.h2>

            <motion.p
              variants={fadeUp} initial="hidden" animate="visible" custom={3}
              className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-lg"
            >
              Fluxy is the all-in-one platform to manage tasks, projects, and teamwork—so you can focus on what truly matters.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="flex flex-wrap gap-4"
            >
              <Link to="/signup" className="btn-primary flex items-center gap-2">
                Get Started for Free <ArrowRight size={16} />
              </Link>
              <button className="btn-secondary flex items-center gap-2">
                <Play size={16} /> Watch Demo
              </button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={5}
              className="flex flex-wrap gap-6 mt-8 text-sm text-zinc-500"
            >
              <span className="flex items-center gap-2"><Shield size={14} /> Free 14-day trial</span>
              <span className="flex items-center gap-2"><Clock size={14} /> No credit card required</span>
              <span className="flex items-center gap-2"><Star size={14} /> Cancel anytime</span>
            </motion.div>
          </div>

          {/* Right: Dashboard preview mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10 glow-purple">
              {/* Mock dashboard */}
              <div className="bg-zinc-900 p-4">
                {/* Mock topbar */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <FluxyLogo size="sm" />
                  <div className="flex items-center gap-2">
                    <div className="w-48 h-7 bg-white/5 rounded-lg" />
                    <div className="w-8 h-7 bg-white/5 rounded-lg" />
                    <div className="w-8 h-7 bg-white/5 rounded-lg" />
                  </div>
                </div>

                <div className="flex gap-3">
                  {/* Mock sidebar */}
                  <div className="w-32 space-y-1.5">
                    <div className="h-8 bg-violet-600/30 rounded-lg border border-violet-500/30 flex items-center px-2">
                      <div className="w-full h-2 bg-violet-400/60 rounded" />
                    </div>
                    {['Projects', 'Tasks', 'Calendar', 'Analytics'].map(item => (
                      <div key={item} className="h-8 bg-white/3 rounded-lg flex items-center px-2">
                        <div className="w-3/4 h-2 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* Mock main content */}
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-semibold text-zinc-200">Good morning, Alex! 👋</p>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Due Today', val: '7', color: 'from-violet-600/20 to-indigo-600/20' },
                        { label: 'Completed', val: '24', color: 'from-blue-600/20 to-cyan-600/20' },
                        { label: 'Projects', val: '5', color: 'from-emerald-600/20 to-teal-600/20' },
                        { label: 'Score', val: '78%', color: 'from-amber-600/20 to-orange-600/20' },
                      ].map(s => (
                        <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-lg p-2 border border-white/5`}>
                          <div className="text-xs text-zinc-400">{s.label}</div>
                          <div className="text-sm font-bold text-zinc-200">{s.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Task list preview */}
                    <div className="bg-white/3 rounded-xl p-2.5 space-y-1.5">
                      <p className="text-xs font-semibold text-zinc-400 mb-2">Today's Tasks</p>
                      {[
                        { name: 'Design new landing page', priority: 'High', color: 'text-red-400' },
                        { name: 'Implement auth flow', priority: 'High', color: 'text-red-400' },
                        { name: 'Fix dashboard issues', priority: 'Medium', color: 'text-amber-400' },
                      ].map(task => (
                        <div key={task.name} className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" />
                          <span className="text-xs text-zinc-400 flex-1 truncate">{task.name}</span>
                          <span className={`text-xs ${task.color} font-medium`}>{task.priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating glow element */}
            <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* ---- SOCIAL PROOF: Trusted by ---- */}
      <section className="border-y border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-zinc-500 mb-8">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-10 text-zinc-500 font-semibold text-sm">
            {COMPANIES.map(c => (
              <span key={c} className="hover:text-zinc-300 transition-colors cursor-pointer">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURES SECTION ---- */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-zinc-100 mb-4">
              Everything you need to get more done
            </h2>
            <p className="text-zinc-400 text-lg">
              Powerful features designed to help you and your team stay organized and productive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={i}
                className="glass-card p-6 hover:border-violet-500/30 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feat.icon size={22} className="text-white" />
                </div>
                <h3 className="font-semibold text-zinc-100 mb-2">{feat.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- PRICING SECTION ---- */}
      <section id="pricing" className="py-24 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-zinc-100 mb-4">Simple, transparent pricing</h2>
            <p className="text-zinc-400">Start free, upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlight
                    ? 'border-violet-500/50 bg-gradient-to-br from-violet-900/30 to-indigo-900/30 glow-purple'
                    : 'border-white/10 bg-white/3'
                }`}
              >
                {plan.highlight && (
                  <div className="inline-block px-3 py-1 rounded-full bg-violet-600 text-xs font-semibold text-white mb-4">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-zinc-400 font-medium mb-1">{plan.name}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-zinc-100">{plan.price}</span>
                    <span className="text-zinc-500 pb-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                      <div className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                        <CheckSquare size={11} className="text-violet-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <FluxyLogo />
          <p className="text-sm text-zinc-600">
            © 2024 Fluxy. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300">Privacy</a>
            <a href="#" className="hover:text-zinc-300">Terms</a>
            <a href="#" className="hover:text-zinc-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
