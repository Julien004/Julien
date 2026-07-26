import { Activity } from 'lucide-react'

export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
        <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          PULSE
          <span className="ml-1 text-xs font-medium text-muted align-top">COACHING</span>
        </span>
      )}
    </div>
  )
}
