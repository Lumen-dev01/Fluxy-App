// =============================================
// AVATAR COMPONENT
//
// Reusable avatar that shows:
// - Profile picture if available
// - Initials fallback if no picture
// - Color-coded based on name (consistent colors)
// =============================================

// Generate a consistent color from a name string
function getAvatarColor(name) {
  const colors = [
    'from-violet-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-fuchsia-500 to-purple-500',
  ]
  if (!name) return colors[0]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// Get initials from full name or email
function getInitials(name) {
  if (!name) return '?'
  if (name.includes('@')) return name[0].toUpperCase()
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const sizeClasses = {
  xs:  'w-6 h-6 text-xs',
  sm:  'w-8 h-8 text-sm',
  md:  'w-10 h-10 text-base',
  lg:  'w-12 h-12 text-lg',
  xl:  'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
}

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md
  const color = getAvatarColor(name)
  const initials = getInitials(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white/10 flex-shrink-0 ${className}`}
        onError={(e) => {
          // If image fails to load, hide it (parent will show initials fallback)
          e.target.style.display = 'none'
        }}
      />
    )
  }

  return (
    <div className={`
      ${sizeClass} rounded-full flex-shrink-0
      bg-gradient-to-br ${color}
      flex items-center justify-center
      font-semibold text-white
      ring-2 ring-white/10
      ${className}
    `}>
      {initials}
    </div>
  )
}
