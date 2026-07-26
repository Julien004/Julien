import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home as HomeIcon, LayoutDashboard, UtensilsCrossed, ClipboardList, Dumbbell, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { to: '/meal-plans', label: 'Meal Plans', icon: ClipboardList },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
]

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'bg-primary/15 text-foreground'
                : 'text-muted hover:bg-white/5 hover:text-foreground'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-primary' : ''}`} strokeWidth={2} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <div className="glow-orb -left-40 top-[-10rem] h-96 w-96 bg-primary/25" />
      <div className="glow-orb -right-40 top-1/3 h-[28rem] w-[28rem] bg-secondary/20" />
      <div className="glow-orb bottom-[-12rem] left-1/4 h-96 w-96 bg-primary/10" />

      <div className="relative mx-auto flex min-h-dvh max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 flex-col gap-8 border-r border-border px-5 py-8 lg:flex">
          <Logo />
          <NavItems />
          <div className="mt-auto rounded-2xl border border-border bg-white/5 p-4 text-xs text-muted">
            Your data stays on this device only — stored securely in this browser.
          </div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col gap-8 bg-surface px-5 py-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavItems onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-5 py-4 lg:hidden">
            <Logo compact />
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-lg text-foreground hover:bg-white/5"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </header>

          <main className={isHome ? 'flex flex-1 flex-col' : 'flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10'}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
