import { Link } from 'react-router-dom'
import FluxyLogo from '../../components/common/FluxyLogo'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-zinc-950 bg-grid flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/"><FluxyLogo size="md" /></Link>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {title && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
              {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
