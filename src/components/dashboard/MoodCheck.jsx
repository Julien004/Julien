import { SmilePlus, Smile, Meh, Frown } from 'lucide-react'

const MOODS = [
  { id: 'amazing', label: 'Amazing', icon: SmilePlus },
  { id: 'good', label: 'Good', icon: Smile },
  { id: 'okay', label: 'Okay', icon: Meh },
  { id: 'difficult', label: 'Difficult', icon: Frown },
]

export default function MoodCheck({ mood, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {MOODS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium transition-colors ${
            mood === id
              ? 'border-primary bg-primary/15 text-foreground'
              : 'border-border bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}
    </div>
  )
}
