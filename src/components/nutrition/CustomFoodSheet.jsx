import { useState } from 'react'
import BottomSheet from '../BottomSheet'
import { useTracker } from '../../lib/store'

const FIELDS = [
  { key: 'calories', label: 'Calories (kcal)' },
  { key: 'protein', label: 'Protein (g)' },
  { key: 'carbs', label: 'Carbs (g)' },
  { key: 'fat', label: 'Fat (g)' },
  { key: 'fiber', label: 'Fibre (g)' },
  { key: 'sugar', label: 'Sugar (g)' },
  { key: 'sodium', label: 'Sodium (mg)' },
]

const emptyForm = { name: '', servingSize: '100', calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: '' }

export default function CustomFoodSheet({ open, onClose }) {
  const { addCustomFood } = useTracker()
  const [form, setForm] = useState(emptyForm)

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value.replace(/[^0-9.]/g, '') }))

  const handleClose = () => {
    setForm(emptyForm)
    onClose()
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.servingSize) return
    addCustomFood(form)
    handleClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Create custom food">
      <form onSubmit={submit} className="flex flex-col gap-3 pb-2">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Food name"
          autoFocus
          className="min-h-12 rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
        />

        <label>
          <span className="mb-1.5 block text-xs text-muted">Serving size (g)</span>
          <input
            value={form.servingSize}
            onChange={(e) => setField('servingSize', e.target.value)}
            inputMode="decimal"
            placeholder="100"
            className="min-h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
          />
        </label>

        <p className="text-xs text-muted-2">Enter the macros for one serving of that size.</p>

        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <label key={f.key}>
              <span className="mb-1.5 block text-xs text-muted">{f.label}</span>
              <input
                value={form[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="min-h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          Save custom food
        </button>
      </form>
    </BottomSheet>
  )
}
