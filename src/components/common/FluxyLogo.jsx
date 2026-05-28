// Professional FLUXY logo component
// Modern "F" with gradient accent - works in dark and light mode

export default function FluxyLogo({ size = 'md' }) {
  const sizes = {
    sm: { icon: 24, text: 'text-base' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon: Stylized "F" with gradient */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="fluxy-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        {/* Rounded square background */}
        <rect width="32" height="32" rx="9" fill="url(#fluxy-grad)" />
        {/* Stylized "F" letter */}
        <path
          d="M9 8h12v3H12v4h8v3h-8v6H9V8z"
          fill="white"
          opacity="0.95"
        />
        {/* Small accent dot */}
        <circle cx="23" cy="21" r="2.5" fill="white" opacity="0.7" />
      </svg>

      {/* Wordmark */}
      <span className={`font-bold ${s.text} text-zinc-100 dark:text-zinc-100 tracking-tight`}>
        FLUXY
      </span>
    </div>
  )
}
