import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-surface shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-white/15" />
        <div className="flex items-center justify-between px-5 pt-3">
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-muted hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 pt-2">{children}</div>
      </div>
    </div>
  )
}
