const GRADIENTS = {
  morning: 'linear-gradient(180deg, #2a1b4d 0%, #6a3f7a 30%, #d9707a 60%, #ffab5c 100%)',
  afternoon: 'linear-gradient(180deg, #1b3a7a 0%, #3f63c9 40%, #7b8fe0 75%, #b9c6f2 100%)',
  evening: 'linear-gradient(180deg, #241238 0%, #5c2350 35%, #c04b52 70%, #f0954a 100%)',
  night: 'linear-gradient(180deg, #05060f 0%, #0a0d1f 50%, #131a33 100%)',
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
      <circle cx={cx} cy={cy} r="26" fill="#05060f" transform="translate(-12,-6)" />
    </g>
  )
}

function Stars({ count = 36 }) {
  const stars = Array.from({ length: count }, (_, i) => {
    const seed = (i * 137.5) % 100
    const x = `${(seed * 3.7) % 100}%`
    const y = `${(seed * 5.3) % 55}%`
    const r = 0.6 + (i % 3) * 0.5
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
      <ellipse cx="18%" cy="26%" rx="70" ry="22" />
      <ellipse cx="26%" cy="21%" rx="46" ry="16" />
      <ellipse cx="42%" cy="36%" rx="58" ry="18" />
    </g>
  )
}

export default function GreetingScene({ period }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: GRADIENTS[period] }}>
      <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        {period === 'morning' && (
          <>
            <Sun cx="76%" cy="80%" glow="#ffb37a" core="#ffe0a3" />
            <Clouds opacity={0.16} tint="#ffd9c2" />
          </>
        )}
        {period === 'afternoon' && (
          <>
            <Sun cx="78%" cy="82%" glow="#fff2c7" core="#fffbe8" />
            <Clouds opacity={0.28} tint="#ffffff" />
          </>
        )}
        {period === 'evening' && <Sun cx="80%" cy="72%" glow="#ffcf8a" core="#ffe9c2" />}
        {period === 'night' && (
          <>
            <Stars />
            <Moon cx="76%" cy="82%" />
          </>
        )}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
    </div>
  )
}
