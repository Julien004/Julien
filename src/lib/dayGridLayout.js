export const HOUR_HEIGHT = 60
export const GRID_HEIGHT = 24 * HOUR_HEIGHT
export const MIN_BLOCK_HEIGHT = 30
export const SNAP_MINUTES = 15

export function timeToMinutes(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(mins) {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(mins)))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function snapMinutes(mins, step = SNAP_MINUTES) {
  return Math.round(mins / step) * step
}

/**
 * Positions activities on a 12AM-11PM grid (1px = 1 minute), assigning
 * side-by-side columns to overlapping activities (Google Calendar style).
 * Activities without a startTime are returned separately as `unscheduled`.
 */
export function layoutDayActivities(activities) {
  const unscheduled = activities.filter((a) => !a.startTime)

  const withTimes = activities
    .filter((a) => a.startTime)
    .map((a) => {
      const start = timeToMinutes(a.startTime)
      let end = a.endTime ? timeToMinutes(a.endTime) : start + 30
      if (end <= start) end = start + 30
      return { ...a, _start: start, _end: end }
    })
    .sort((a, b) => a._start - b._start || a._end - b._end)

  const positioned = []
  let cluster = []
  let clusterEnd = -Infinity

  const flushCluster = () => {
    if (cluster.length === 0) return
    const columnEnds = []
    for (const item of cluster) {
      let placedCol = -1
      for (let i = 0; i < columnEnds.length; i++) {
        if (columnEnds[i] <= item._start) {
          columnEnds[i] = item._end
          placedCol = i
          break
        }
      }
      if (placedCol === -1) {
        placedCol = columnEnds.length
        columnEnds.push(item._end)
      }
      item._col = placedCol
    }
    const totalCols = columnEnds.length
    for (const item of cluster) positioned.push({ ...item, col: item._col, totalCols })
    cluster = []
  }

  for (const item of withTimes) {
    if (item._start >= clusterEnd) {
      flushCluster()
      clusterEnd = item._end
    } else {
      clusterEnd = Math.max(clusterEnd, item._end)
    }
    cluster.push(item)
  }
  flushCluster()

  const scheduled = positioned.map((item) => ({
    ...item,
    top: item._start,
    height: Math.max(MIN_BLOCK_HEIGHT, item._end - item._start),
  }))

  return { scheduled, unscheduled }
}
