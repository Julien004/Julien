import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Camera, Check, AlertTriangle, Keyboard } from 'lucide-react'
import { fetchProductByBarcode } from '../../lib/openFoodFacts'
import { scaleFoodMacros } from '../../lib/foodDatabase'
import { MEAL_SLOTS, MEAL_SLOT_LABELS } from '../../lib/seedData'
import { useTracker } from '../../lib/store'

// Loaded on demand (not at app startup) so the ~350KB decoding engine only
// downloads for someone who actually opens the scanner.
async function loadScanner() {
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
    import('@zxing/browser'),
    import('@zxing/library'),
  ])
  const formats = [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
  ]
  const hints = new Map([[DecodeHintType.POSSIBLE_FORMATS, formats]])
  return new BrowserMultiFormatReader(hints)
}

const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories (kcal)' },
  { key: 'protein', label: 'Protein (g)' },
  { key: 'carbs', label: 'Carbs (g)' },
  { key: 'fat', label: 'Fat (g)' },
  { key: 'fiber', label: 'Fibre (g)' },
  { key: 'sugar', label: 'Sugar (g)' },
  { key: 'sodium', label: 'Sodium (mg)' },
]

const emptyMacros = { calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: '' }

export default function BarcodeScannerModal({ onClose, dateKey, defaultSlot = 'breakfast', onAdded }) {
  const { findFoodByBarcode, addCustomFood, logFood } = useTracker()
  const [phase, setPhase] = useState('scanning')
  const [cameraMessage, setCameraMessage] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [notice, setNotice] = useState(null)
  const [barcode, setBarcode] = useState(null)
  const [name, setName] = useState('')
  const [grams, setGrams] = useState(100)
  const [macros, setMacros] = useState(emptyMacros)
  const [basePer100, setBasePer100] = useState(null)
  const [slot, setSlot] = useState(defaultSlot)
  const [justAdded, setJustAdded] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'scanning') return undefined
    let cancelled = false
    let controls = null
    let alreadyDetected = false

    async function start() {
      try {
        const reader = await loadScanner()
        if (cancelled) return
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (result) => {
            if (result && !alreadyDetected && !cancelled) {
              alreadyDetected = true
              controls?.stop()
              handleDetected(result.getText())
            }
          }
        )
      } catch (err) {
        if (cancelled) return
        setCameraMessage(
          err?.name === 'NotAllowedError'
            ? 'Camera access was denied. Allow camera access, or enter the barcode manually.'
            : 'Could not access a camera. Enter the barcode manually instead.'
        )
        setPhase('manual')
      }
    }

    start()
    return () => {
      cancelled = true
      controls?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const resetForm = () => {
    setBarcode(null)
    setName('')
    setGrams(100)
    setMacros(emptyMacros)
    setBasePer100(null)
    setSlot(defaultSlot)
    setNotice(null)
  }

  const openReview = (product, code, noticeText) => {
    if (product) {
      setBarcode(code)
      setName(product.name)
      setGrams(product.defaultGrams)
      setBasePer100(product.per100)
      const scaled = scaleFoodMacros(product.per100, product.defaultGrams)
      setMacros({
        calories: String(scaled.calories),
        protein: String(scaled.protein),
        carbs: String(scaled.carbs),
        fat: String(scaled.fat),
        fiber: String(scaled.fiber),
        sugar: String(scaled.sugar),
        sodium: String(scaled.sodium),
      })
    } else {
      resetForm()
      setBarcode(code)
      setGrams(100)
    }
    setNotice(noticeText || null)
    setPhase('review')
  }

  const handleDetected = async (code) => {
    setPhase('looking-up')
    const cached = findFoodByBarcode(code)
    if (cached) {
      openReview(cached, code, null)
      return
    }
    try {
      const product = await fetchProductByBarcode(code)
      if (product) openReview(product, code, null)
      else openReview(null, code, `Barcode ${code} wasn't recognised — enter the details manually.`)
    } catch {
      openReview(null, code, `Couldn't look up barcode ${code} — enter the details manually.`)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    const code = manualCode.trim()
    if (!code) return
    handleDetected(code)
  }

  const handleGramsChange = (value) => {
    const g = Number(value.replace(/[^0-9]/g, '')) || 0
    setGrams(g)
    if (basePer100 && g > 0) {
      const scaled = scaleFoodMacros(basePer100, g)
      setMacros({
        calories: String(scaled.calories),
        protein: String(scaled.protein),
        carbs: String(scaled.carbs),
        fat: String(scaled.fat),
        fiber: String(scaled.fiber),
        sugar: String(scaled.sugar),
        sodium: String(scaled.sodium),
      })
    }
  }

  const setMacroField = (key, value) => setMacros((m) => ({ ...m, [key]: value.replace(/[^0-9.]/g, '') }))

  const handleAddToDiary = (e) => {
    e.preventDefault()
    if (!name.trim() || grams <= 0) return
    const food = addCustomFood({
      name: name.trim(),
      servingSize: grams,
      barcode,
      ...macros,
    })
    logFood(dateKey, slot, food, grams)
    onAdded?.(food.name)
    setJustAdded(true)
    setTimeout(onClose, 700)
  }

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Scan barcode" className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="font-display text-base font-semibold text-white">Scan barcode</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close scanner"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg text-white/70 hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {phase === 'scanning' && (
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="h-40 w-64 rounded-2xl border-2 border-white/80 shadow-[0_0_0_2000px_rgba(0,0,0,0.45)]" />
            <p className="rounded-full bg-black/60 px-4 py-2 text-sm text-white">Point your camera at a barcode</p>
          </div>
          <button
            type="button"
            onClick={() => setPhase('manual')}
            className="absolute bottom-8 flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
          >
            <Keyboard className="h-4 w-4" /> Enter barcode manually
          </button>
        </div>
      )}

      {phase === 'looking-up' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="text-sm text-white/70">Looking up product…</p>
        </div>
      )}

      {phase === 'manual' && (
        <div className="flex flex-1 flex-col gap-4 p-5">
          {cameraMessage && (
            <div className="flex items-start gap-2 rounded-xl bg-white/10 p-3 text-sm text-white/80">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {cameraMessage}
            </div>
          )}
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
            <label>
              <span className="mb-1.5 block text-xs text-white/60">Barcode number</span>
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.replace(/[^0-9]/g, ''))}
                inputMode="numeric"
                autoFocus
                placeholder="e.g. 5449000000996"
                className="min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-base text-white placeholder:text-white/40 focus:border-primary/60 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-primary text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Look up
            </button>
            <button
              type="button"
              onClick={() => {
                setCameraMessage(null)
                setPhase('scanning')
              }}
              className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-medium text-white/80 hover:bg-white/5"
            >
              <Camera className="h-4 w-4" /> Try camera again
            </button>
          </form>
        </div>
      )}

      {phase === 'review' && (
        <form onSubmit={handleAddToDiary} className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain bg-surface p-5">
          {notice && (
            <div className="flex items-start gap-2 rounded-xl bg-white/5 p-3 text-sm text-muted">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {notice}
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1">
            {MEAL_SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={`min-h-11 shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium transition-colors ${
                  slot === s ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
              >
                {MEAL_SLOT_LABELS[s]}
              </button>
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Food name"
            className="min-h-12 rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
          />

          <label>
            <span className="mb-1.5 block text-xs text-muted">Serving size (g)</span>
            <input
              value={grams}
              onChange={(e) => handleGramsChange(e.target.value)}
              inputMode="numeric"
              className="min-h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-base text-foreground focus:border-primary/60 focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            {MACRO_FIELDS.map((f) => (
              <label key={f.key}>
                <span className="mb-1.5 block text-xs text-muted">{f.label}</span>
                <input
                  value={macros[f.key]}
                  onChange={(e) => setMacroField(f.key, e.target.value)}
                  inputMode="decimal"
                  placeholder="0"
                  className="min-h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-base text-foreground placeholder:text-muted-2 focus:border-primary/60 focus:outline-none"
                />
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={!name.trim() || grams <= 0}
            className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl text-base font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              justAdded ? 'bg-accent' : 'bg-primary hover:opacity-90'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              `Add to ${MEAL_SLOT_LABELS[slot]}`
            )}
          </button>
        </form>
      )}
    </div>,
    document.body
  )
}
