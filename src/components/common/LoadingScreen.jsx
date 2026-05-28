import FluxyLogo from './FluxyLogo'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6">
      <div className="animate-pulse">
        <FluxyLogo size="lg" />
      </div>
      {/* Animated loading dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-500"
            style={{
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>
    </div>
  )
}
