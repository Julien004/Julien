import {
  Dumbbell,
  Footprints,
  Swords,
  CircleDot,
  Trophy,
  Briefcase,
  GraduationCap,
  BookOpen,
  Gamepad2,
  Users,
  Dog,
  Flower2,
  NotebookPen,
  CalendarClock,
  ShoppingCart,
  UtensilsCrossed,
  Sparkles,
  Moon,
  Droplet,
  HeartPulse,
  Brain,
  Star,
} from 'lucide-react'

export const ICONS = {
  Dumbbell,
  Footprints,
  Swords,
  CircleDot,
  Trophy,
  Briefcase,
  GraduationCap,
  BookOpen,
  Gamepad2,
  Users,
  Dog,
  Flower2,
  NotebookPen,
  CalendarClock,
  ShoppingCart,
  UtensilsCrossed,
  Sparkles,
  Moon,
  Droplet,
  HeartPulse,
  Brain,
  Star,
}

export const ICON_OPTIONS = Object.keys(ICONS)

export function getIcon(name) {
  return ICONS[name] || Star
}
