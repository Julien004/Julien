export function getDayPeriod(date = new Date()) {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

export const PERIOD_META = {
  morning: {
    greeting: 'Good morning',
    message: 'Start your day strong.',
    range: '5:00 AM – 11:59 AM',
  },
  afternoon: {
    greeting: 'Good afternoon',
    message: "Keep the momentum going — let's get those steps in.",
    range: '12:00 PM – 4:59 PM',
  },
  evening: {
    greeting: 'Go time',
    message: 'Finish strong and set tomorrow up for success.',
    range: '5:00 PM – 8:59 PM',
  },
  night: {
    greeting: 'Good night',
    message: 'Wind down — rest is part of the training.',
    range: '9:00 PM – 4:59 AM',
  },
}
