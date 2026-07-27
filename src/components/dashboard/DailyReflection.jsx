import { useState } from 'react'
import { SmilePlus, Smile, Meh, Frown } from 'lucide-react'
import MoodCheck from './MoodCheck'
import { lastNDays, format } from '../../lib/dateUtils'
import { dateKey } from '../../lib/store'

const MOOD_ICONS = { amazing: SmilePlus, good: Smile, okay: Meh, difficult: Frown }

export default function DailyReflection({ period, reflection, reflections, onSaveMood, onSaveReflection }) {
  const hasReflectionText = !!(reflection?.wentWell || reflection?.improve)
  const [editing, setEditing] = useState(!hasReflectionText)
  const [wentWell, setWentWell] = useState(reflection?.wentWell || '')
  const [improve, setImprove] = useState(reflection?.improve || '')

  const showReflectionForm = period === 'evening' || period === 'night'
  const week = lastNDays(7)

  const submit = (e) => {
    e.preventDefault()
    onSaveReflection({ wentWell: wentWell.trim(), improve: improve.trim() })
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <MoodCheck mood={reflection?.mood ?? null} onSelect={onSaveMood} />

      {showReflectionForm &&
        (editing ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-xs text-muted">What went well today?</label>
              <textarea
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                rows={2}
                placeholder="Anything, big or small"
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted">What could improve tomorrow?</label>
              <textarea
                value={improve}
                onChange={(e) => setImprove(e.target.value)}
                rows={2}
                placeholder="No pressure — just a thought"
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="min-h-12 cursor-pointer rounded-xl bg-primary text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Save reflection
            </button>
          </form>
        ) : (
          <div className="rounded-xl bg-white/5 p-4">
            {reflection?.wentWell && (
              <p className="text-sm text-foreground">
                <span className="text-muted">Went well: </span>
                {reflection.wentWell}
              </p>
            )}
            {reflection?.improve && (
              <p className="mt-2 text-sm text-foreground">
                <span className="text-muted">To improve: </span>
                {reflection.improve}
              </p>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-3 cursor-pointer text-xs font-medium text-primary hover:underline"
            >
              Edit
            </button>
          </div>
        ))}

      <div>
        <p className="mb-2 text-xs text-muted">Last 7 days</p>
        <div className="flex gap-2">
          {week.map((d) => {
            const key = dateKey(d)
            const mood = reflections[key]?.mood
            const Icon = mood ? MOOD_ICONS[mood] : null
            return (
              <div key={key} className="flex flex-1 flex-col items-center gap-1">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/5">
                  {Icon ? (
                    <Icon className="h-4 w-4 text-primary" />
                  ) : (
                    <span className="text-[10px] text-muted-2">—</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-2">{format(d, 'EEEEE')}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
