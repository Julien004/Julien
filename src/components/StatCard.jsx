import GlassCard from './GlassCard'

export default function StatCard({ icon: Icon, label, value, sub, accent = 'primary' }) {
  const accentClasses = {
    primary: 'bg-primary/15 text-primary',
    secondary: 'bg-secondary/15 text-secondary',
    accent: 'bg-accent/15 text-accent',
    warning: 'bg-warning/15 text-warning',
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-foreground">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-2">{sub}</p>}
        </div>
        {Icon && (
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accentClasses[accent]}`}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
        )}
      </div>
    </GlassCard>
  )
}
