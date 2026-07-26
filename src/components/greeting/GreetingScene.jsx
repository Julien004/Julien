const VB_W = 1000
const VB_H = 600

const GRADIENTS = {
  morning: 'linear-gradient(150deg, #163454 0%, #2f6690 22%, #6fb3d9 50%, #bfe3f5 75%, #eef7fb 100%)',
  afternoon: 'linear-gradient(180deg, #1b3a7a 0%, #3f63c9 40%, #7b8fe0 75%, #b9c6f2 100%)',
  evening: 'linear-gradient(180deg, #241238 0%, #5c2350 35%, #c04b52 70%, #f0954a 100%)',
  night: 'linear-gradient(180deg, #05060f 0%, #0a0d1f 50%, #131a33 100%)',
}

const SOURCE = {
  morning: { x: 780, y: 470 },
  afternoon: { x: 780, y: 480 },
  evening: { x: 800, y: 430 },
  night: { x: 780, y: 470 },
}

function Sun({ cx, cy, glow, core }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="110" fill={glow} opacity="0.28" filter="url(#soften)" />
      <circle cx={cx} cy={cy} r="62" fill={glow} opacity="0.55" />
      <circle cx={cx} cy={cy} r="34" fill={core} />
    </g>
  )
}

function Moon({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="60" fill="#c9c6f5" opacity="0.12" filter="url(#soften)" />
      <circle cx={cx} cy={cy} r="30" fill="#f4f2fb" />
      <circle cx={cx - 12} cy={cy - 6} r="26" fill="#05060f" />
    </g>
  )
}

function Stars({ count = 36 }) {
  const stars = Array.from({ length: count }, (_, i) => {
    const seed = (i * 137.5) % 100
    const x = ((seed * 3.7) % 100) * (VB_W / 100)
    const y = ((seed * 5.3) % 55) * (VB_H / 100)
    const r = 1 + (i % 3) * 0.7
    const delay = (i % 6) * 0.5
    return { x, y, r, delay, key: i }
  })
  return (
    <g>
      {stars.map((s) => (
        <circle
          key={s.key}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#ffffff"
          className="animate-twinkle"
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}
    </g>
  )
}

function Clouds({ opacity = 0.22, tint = '#ffffff' }) {
  return (
    <g fill={tint} opacity={opacity} filter="url(#soften)">
      <ellipse cx={VB_W * 0.18} cy={VB_H * 0.26} rx="70" ry="22" />
      <ellipse cx={VB_W * 0.26} cy={VB_H * 0.21} rx="46" ry="16" />
      <ellipse cx={VB_W * 0.42} cy={VB_H * 0.36} rx="58" ry="18" />
    </g>
  )
}

function LightRays({ cx, cy, color, count = 6, spread = 12, opacity = 0.4 }) {
  const rays = Array.from({ length: count }, (_, i) => -50 + i * spread)
  return (
    <g style={{ mixBlendMode: 'screen' }} opacity={opacity}>
      {rays.map((angle, i) => (
        <rect
          key={i}
          x={-55}
          y={-1400}
          width="90"
          height="1400"
          fill="url(#rayFade)"
          transform={`translate(${cx}, ${cy}) rotate(${angle})`}
        />
      ))}
    </g>
  )
}

function Grain({ opacity = 0.3 }) {
  return (
    <rect
      x="0"
      y="0"
      width={VB_W}
      height={VB_H}
      fill="black"
      filter="url(#grain)"
      opacity={opacity}
      style={{ mixBlendMode: 'overlay' }}
    />
  )
}

export default function GreetingScene({ period }) {
  const src = SOURCE[period]
  const rayColor = period === 'night' ? '#dfe8ff' : period === 'evening' ? '#ffd8a0' : '#ffffff'

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: GRADIENTS[period] }}>
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <linearGradient id="rayFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={rayColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={rayColor} stopOpacity="0" />
          </linearGradient>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.28 0.28 0.28 0 0" />
          </filter>
        </defs>

        <LightRays cx={src.x} cy={src.y} color={rayColor} opacity={period === 'night' ? 0.16 : 0.35} />

        {period === 'morning' && (
          <>
            <Sun cx={src.x} cy={src.y} glow="#ffe9c2" core="#fffdf5" />
            <Clouds opacity={0.2} tint="#ffffff" />
          </>
        )}
        {period === 'afternoon' && (
          <>
            <Sun cx={src.x} cy={src.y} glow="#fff2c7" core="#fffbe8" />
            <Clouds opacity={0.28} tint="#ffffff" />
          </>
        )}
        {period === 'evening' && <Sun cx={src.x} cy={src.y} glow="#ffcf8a" core="#ffe9c2" />}
        {period === 'night' && (
          <>
            <Stars />
            <Moon cx={src.x} cy={src.y} />
          </>
        )}

        <Grain opacity={period === 'night' ? 0.35 : 0.22} />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-transparent to-transparent" />
    </div>
  )
}
