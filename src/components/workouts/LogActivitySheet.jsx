import { useEffect, useState } from 'react'
import { ChevronLeft, Check, Plus, Trash2 } from 'lucide-react'
import BottomSheet from '../BottomSheet'
import { getIcon } from '../../lib/icons'
import {
  ACTIVITY_TYPES,
  getActivityType,
  MARTIAL_ARTS_DISCIPLINES,
  YOGA_STYLES,
  SWIM_STROKES,
  INTENSITY_LEVELS,
  GAME_TYPES,
  MATCH_TYPES,
  MATCH_RESULTS,
} from '../../lib/activityTypes'
import { computePaceMinPerKm, computeSpeedKmh } from '../../lib/sessionSummary'

const inputClass =
  'min-h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none'
const labelClass = 'mb-1.5 block text-xs text-muted'

function SelectPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`min-h-10 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors ${
            value === opt ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

const emptyExercise = () => ({ name: '', sets: '', reps: '', weight: '' })

export default function LogActivitySheet({ open, onClose, onSave, onDelete, initial, defaultDate, startType }) {
  const isEdit = !!initial
  const [step, setStep] = useState('pick')
  const [activityType, setActivityType] = useState('gym')
  const [name, setName] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [notes, setNotes] = useState('')
  const [details, setDetails] = useState({})

  useEffect(() => {
    if (!open) return
    if (initial) {
      setActivityType(initial.activityType || 'custom')
      setName(initial.name || '')
      setDate(initial.date || defaultDate)
      setStartTime(initial.startTime || '')
      setDurationMinutes(initial.durationMinutes ?? 30)
      setNotes(initial.notes || '')
      setDetails(initial.details || {})
      setStep('form')
    } else if (startType) {
      setActivityType(startType)
      setName(getActivityType(startType).label)
      setDate(defaultDate)
      setStartTime('')
      setDurationMinutes(30)
      setNotes('')
      setDetails({})
      setStep('form')
    } else {
      setActivityType('gym')
      setName('')
      setDate(defaultDate)
      setStartTime('')
      setDurationMinutes(30)
      setNotes('')
      setDetails({})
      setStep('pick')
    }
  }, [open, initial, defaultDate, startType])

  const type = getActivityType(activityType)

  const chooseType = (id) => {
    setActivityType(id)
    setName(getActivityType(id).label)
    setDetails({})
    setStep('form')
  }

  const setDetail = (key, value) => setDetails((d) => ({ ...d, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim() || !date) return
    onSave({
      activityType,
      name: name.trim(),
      date,
      startTime,
      durationMinutes: Number(durationMinutes) || 0,
      notes: notes.trim(),
      details,
    })
  }

  const addExercise = () => setDetail('exercises', [...(details.exercises || []), emptyExercise()])
  const updateExercise = (i, patch) =>
    setDetail(
      'exercises',
      (details.exercises || []).map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex))
    )
  const removeExercise = (i) =>
    setDetail(
      'exercises',
      (details.exercises || []).filter((_, idx) => idx !== i)
    )

  const title = step === 'pick' ? 'Log an activity' : `${isEdit ? 'Edit' : 'Log'} ${type.label}`

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {step === 'pick' && (
        <div className="grid grid-cols-3 gap-3 pb-2 sm:grid-cols-4">
          {ACTIVITY_TYPES.map((t) => {
            const Icon = getIcon(t.icon)
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => chooseType(t.id)}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border bg-white/5 py-4 text-center transition-colors hover:bg-white/10"
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl"
                  style={{ backgroundColor: `${t.color}22`, color: t.color }}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-xs font-medium text-foreground">{t.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {step === 'form' && (
        <form onSubmit={submit} className="flex flex-col gap-4 pb-2">
          {!isEdit && (
            <button
              type="button"
              onClick={() => setStep('pick')}
              className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary"
            >
              <ChevronLeft className="h-4 w-4" /> Choose a different activity
            </button>
          )}

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Session name"
            className={inputClass}
          />

          <div className="flex gap-3">
            <label className="flex-1">
              <span className={labelClass}>Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </label>
            <label className="flex-1">
              <span className={labelClass}>Time (optional)</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label>
            <span className={labelClass}>Duration (minutes)</span>
            <input
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value.replace(/[^0-9]/g, ''))}
              className={inputClass}
            />
          </label>

          {/* Bespoke fields — each activity type gets its own tailored block. */}
          {activityType === 'gym' && (
            <div>
              <span className={labelClass}>Exercises</span>
              <div className="flex flex-col gap-2">
                {(details.exercises || []).map((ex, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-white/5 p-2.5">
                    <input
                      value={ex.name}
                      onChange={(e) => updateExercise(i, { name: e.target.value })}
                      placeholder="Exercise, e.g. Bench Press"
                      className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-white/5 px-3 text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
                    />
                    <input
                      value={ex.sets}
                      onChange={(e) => updateExercise(i, { sets: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="Sets"
                      inputMode="numeric"
                      className="min-h-10 w-14 rounded-lg border border-border bg-white/5 px-2 text-center text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
                    />
                    <input
                      value={ex.reps}
                      onChange={(e) => updateExercise(i, { reps: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="Reps"
                      inputMode="numeric"
                      className="min-h-10 w-14 rounded-lg border border-border bg-white/5 px-2 text-center text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
                    />
                    <input
                      value={ex.weight}
                      onChange={(e) => updateExercise(i, { weight: e.target.value.replace(/[^0-9.]/g, '') })}
                      placeholder="kg"
                      inputMode="decimal"
                      className="min-h-10 w-16 rounded-lg border border-border bg-white/5 px-2 text-center text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(i)}
                      aria-label="Remove exercise"
                      className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center text-muted-2 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExercise}
                  className="flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-sm font-medium text-muted hover:bg-white/5"
                >
                  <Plus className="h-4 w-4" /> Add exercise
                </button>
              </div>
            </div>
          )}

          {activityType === 'running' && (
            <>
              <label>
                <span className={labelClass}>Distance (km)</span>
                <input
                  value={details.distanceKm || ''}
                  onChange={(e) => setDetail('distanceKm', e.target.value.replace(/[^0-9.]/g, ''))}
                  inputMode="decimal"
                  placeholder="5.0"
                  className={inputClass}
                />
              </label>
              {computePaceMinPerKm(Number(details.distanceKm), Number(durationMinutes)) && (
                <p className="-mt-2 text-xs text-muted-2">
                  Pace: {computePaceMinPerKm(Number(details.distanceKm), Number(durationMinutes))}
                </p>
              )}
            </>
          )}

          {activityType === 'walking' && (
            <div className="flex gap-3">
              <label className="flex-1">
                <span className={labelClass}>Distance (km)</span>
                <input
                  value={details.distanceKm || ''}
                  onChange={(e) => setDetail('distanceKm', e.target.value.replace(/[^0-9.]/g, ''))}
                  inputMode="decimal"
                  placeholder="3.0"
                  className={inputClass}
                />
              </label>
              <label className="flex-1">
                <span className={labelClass}>Steps (optional)</span>
                <input
                  value={details.steps || ''}
                  onChange={(e) => setDetail('steps', e.target.value.replace(/[^0-9]/g, ''))}
                  inputMode="numeric"
                  placeholder="4200"
                  className={inputClass}
                />
              </label>
            </div>
          )}

          {activityType === 'cycling' && (
            <>
              <label>
                <span className={labelClass}>Distance (km)</span>
                <input
                  value={details.distanceKm || ''}
                  onChange={(e) => setDetail('distanceKm', e.target.value.replace(/[^0-9.]/g, ''))}
                  inputMode="decimal"
                  placeholder="18.0"
                  className={inputClass}
                />
              </label>
              {computeSpeedKmh(Number(details.distanceKm), Number(durationMinutes)) && (
                <p className="-mt-2 text-xs text-muted-2">
                  Avg speed: {computeSpeedKmh(Number(details.distanceKm), Number(durationMinutes))}
                </p>
              )}
            </>
          )}

          {activityType === 'swimming' && (
            <>
              <label>
                <span className={labelClass}>Distance (m)</span>
                <input
                  value={details.distanceM || ''}
                  onChange={(e) => setDetail('distanceM', e.target.value.replace(/[^0-9]/g, ''))}
                  inputMode="numeric"
                  placeholder="800"
                  className={inputClass}
                />
              </label>
              <div>
                <span className={labelClass}>Stroke</span>
                <SelectPills options={SWIM_STROKES} value={details.stroke} onChange={(v) => setDetail('stroke', v)} />
              </div>
            </>
          )}

          {activityType === 'basketball' && (
            <>
              <div>
                <span className={labelClass}>Game type</span>
                <SelectPills options={GAME_TYPES} value={details.gameType} onChange={(v) => setDetail('gameType', v)} />
              </div>
              <label>
                <span className={labelClass}>Score (optional)</span>
                <input
                  value={details.score || ''}
                  onChange={(e) => setDetail('score', e.target.value)}
                  placeholder="e.g. 24-18"
                  className={inputClass}
                />
              </label>
            </>
          )}

          {activityType === 'tennis' && (
            <>
              <div>
                <span className={labelClass}>Match type</span>
                <SelectPills options={MATCH_TYPES} value={details.matchType} onChange={(v) => setDetail('matchType', v)} />
              </div>
              <div>
                <span className={labelClass}>Result</span>
                <SelectPills options={MATCH_RESULTS} value={details.result} onChange={(v) => setDetail('result', v)} />
              </div>
            </>
          )}

          {activityType === 'martialArts' && (
            <>
              <div>
                <span className={labelClass}>Discipline</span>
                <SelectPills
                  options={MARTIAL_ARTS_DISCIPLINES}
                  value={details.discipline}
                  onChange={(v) => setDetail('discipline', v)}
                />
              </div>
              <div>
                <span className={labelClass}>Intensity</span>
                <SelectPills options={INTENSITY_LEVELS} value={details.intensity} onChange={(v) => setDetail('intensity', v)} />
              </div>
            </>
          )}

          {activityType === 'yoga' && (
            <>
              <div>
                <span className={labelClass}>Style</span>
                <SelectPills options={YOGA_STYLES} value={details.style} onChange={(v) => setDetail('style', v)} />
              </div>
              <div>
                <span className={labelClass}>Intensity</span>
                <SelectPills options={INTENSITY_LEVELS} value={details.intensity} onChange={(v) => setDetail('intensity', v)} />
              </div>
            </>
          )}

          <label>
            <span className={labelClass}>Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="How did it go?"
              className="rounded-xl border border-border bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
            />
          </label>

          <div className="flex gap-2">
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-destructive/30 px-5 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary text-base font-medium text-white transition-opacity hover:opacity-90"
            >
              <Check className="h-4 w-4" /> {isEdit ? 'Save changes' : `Log ${type.label}`}
            </button>
          </div>
        </form>
      )}
    </BottomSheet>
  )
}
