export function computePaceMinPerKm(distanceKm, durationMinutes) {
  if (!distanceKm || !durationMinutes) return null
  const paceMin = durationMinutes / distanceKm
  const min = Math.floor(paceMin)
  const sec = Math.round((paceMin - min) * 60)
  return `${min}:${String(sec).padStart(2, '0')} /km`
}

export function computeSpeedKmh(distanceKm, durationMinutes) {
  if (!distanceKm || !durationMinutes) return null
  return `${(distanceKm / (durationMinutes / 60)).toFixed(1)} km/h`
}

export function summarizeSession(session) {
  const d = session.details || {}
  const duration = session.durationMinutes ? `${session.durationMinutes} min` : null

  switch (session.activityType) {
    case 'gym': {
      const count = d.exercises?.length || 0
      if (count === 0) return duration || 'Session logged'
      const names = d.exercises.slice(0, 2).map((e) => e.name).join(', ')
      return count > 2 ? `${names} +${count - 2} more` : names
    }
    case 'running': {
      const parts = []
      if (d.distanceKm) parts.push(`${d.distanceKm} km`)
      const pace = computePaceMinPerKm(d.distanceKm, session.durationMinutes)
      if (pace) parts.push(pace)
      return parts.length ? parts.join(' · ') : duration
    }
    case 'walking': {
      const parts = []
      if (d.distanceKm) parts.push(`${d.distanceKm} km`)
      if (d.steps) parts.push(`${Number(d.steps).toLocaleString()} steps`)
      return parts.length ? parts.join(' · ') : duration
    }
    case 'cycling': {
      const parts = []
      if (d.distanceKm) parts.push(`${d.distanceKm} km`)
      const speed = computeSpeedKmh(d.distanceKm, session.durationMinutes)
      if (speed) parts.push(speed)
      return parts.length ? parts.join(' · ') : duration
    }
    case 'swimming': {
      const parts = []
      if (d.distanceM) parts.push(`${d.distanceM}m`)
      if (d.stroke) parts.push(d.stroke)
      return parts.length ? parts.join(' · ') : duration
    }
    case 'basketball': {
      const parts = []
      if (d.gameType) parts.push(d.gameType)
      if (d.score) parts.push(d.score)
      return parts.length ? parts.join(' · ') : duration
    }
    case 'tennis': {
      const parts = []
      if (d.matchType) parts.push(d.matchType)
      if (d.result) parts.push(d.result)
      return parts.length ? parts.join(' · ') : duration
    }
    case 'martialArts': {
      const parts = []
      if (d.discipline) parts.push(d.discipline)
      if (d.intensity) parts.push(`${d.intensity} intensity`)
      return parts.length ? parts.join(' · ') : duration
    }
    case 'yoga': {
      const parts = []
      if (d.style) parts.push(d.style)
      if (d.intensity) parts.push(d.intensity)
      return parts.length ? parts.join(' · ') : duration
    }
    default:
      return session.notes || duration || 'Session logged'
  }
}
