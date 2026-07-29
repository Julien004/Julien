import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarClock, UtensilsCrossed, ClipboardList, Dumbbell } from 'lucide-react'

const TABS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/schedule', label: 'Schedule', icon: CalendarClock },
  { to: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { to: '/meal-plans', label: 'Plans', icon: ClipboardList },
  { to: '/workouts', label: 'Activity', icon: Dumbbell },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-[560px] items-stretch justify-between px-1">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors duration-150 ${
                isActive ? 'text-primary' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
