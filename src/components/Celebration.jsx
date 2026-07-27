import { PartyPopper } from 'lucide-react'

export default function Celebration({ message }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-0 z-[60] flex justify-center transition-all duration-300 ${
        message ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
      style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
    >
      {message && (
        <div className="animate-celebrate flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-accent/40">
          <PartyPopper className="h-4 w-4" />
          {message}
        </div>
      )}
    </div>
  )
}
