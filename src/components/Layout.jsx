import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarClock, UtensilsCrossed, ClipboardList, Dumbbell, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Logo from './Logo'
import BottomNav from './BottomNav'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/schedule', label: 'My Schedule', icon: CalendarClock },
  { to: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { to: '/meal-plans', label: 'Meal Plans', icon: ClipboardList },
  { to: '/workouts', label: 'Activity Hub', icon: Dumbbell },
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
            `flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 ${
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
  const isFullBleed = pathname === '/'

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

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

        <div
          className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
          aria-hidden={!mobileOpen}
        >
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              mobileOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col gap-8 bg-surface px-5 pb-8 shadow-2xl transition-transform duration-300 ease-out ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 2rem)' }}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:bg-white/5"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavItems onNavigate={() => setMobileOpen(false)} />
            <div className="mt-auto rounded-2xl border border-border bg-white/5 p-4 text-xs text-muted">
              Your data stays on this device only — stored securely in this browser.
            </div>
          </aside>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className="flex items-center justify-between border-b border-border px-5 py-4 lg:hidden"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
          >
            <Logo compact />
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-lg text-foreground hover:bg-white/5"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </header>

          <main
            className={
              isFullBleed
                ? 'flex flex-1 flex-col'
                : 'flex-1 px-4 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:py-10 lg:pb-10'
            }
          >
            <Outlet />
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
