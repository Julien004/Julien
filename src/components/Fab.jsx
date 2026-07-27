import { Plus } from 'lucide-react'

export default function Fab({ onClick, icon: Icon = Plus, label = 'Add' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed right-5 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-primary text-white shadow-xl shadow-primary/40 transition-transform duration-150 hover:scale-105 active:scale-95 lg:right-10 lg:bottom-10"
    >
      <Icon className="h-6 w-6" strokeWidth={2.4} />
    </button>
  )
}
