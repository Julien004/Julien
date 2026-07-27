import {
  Dumbbell,
  Footprints,
  Swords,
  CircleDot,
  Trophy,
  Briefcase,
  GraduationCap,
  BookOpen,
  Book,
  Gamepad2,
  Users,
  Dog,
  PersonStanding,
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
  Book,
  Gamepad2,
  Users,
  Dog,
  PersonStanding,
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
