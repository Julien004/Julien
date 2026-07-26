const QUOTES = {
  morning: [
    'The secret of getting ahead is getting started.',
    'Discipline is choosing between what you want now and what you want most.',
    'Win the morning, win the day.',
    'Small steps every morning add up to big changes.',
  ],
  afternoon: [
    'Progress, not perfection.',
    'Every step counts, literally.',
    'Consistency beats intensity.',
    "Stay hydrated, stay focused, keep moving.",
  ],
  evening: [
    'Finish what you started today.',
    "Tomorrow is won by how you prepare tonight.",
    'Strong finishes build strong habits.',
    'Recovery is where the gains happen.',
  ],
  night: [
    'Rest is productive too.',
    'Sleep is the foundation every goal is built on.',
    'A good night tonight fuels a strong tomorrow.',
    'Wind down now, show up stronger tomorrow.',
  ],
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date - start
  return Math.floor(diff / 86400000)
}

export function pickQuote(period, date = new Date()) {
  const list = QUOTES[period]
  return list[dayOfYear(date) % list.length]
}
