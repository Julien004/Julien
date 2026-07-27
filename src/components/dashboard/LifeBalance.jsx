import { CATEGORY_LIST } from '../../lib/categories'

export default function LifeBalance({ balance }) {
  return (
    <div className="flex flex-col gap-3">
      {CATEGORY_LIST.map((cat) => {
        const stat = balance[cat.id]
        const percent = stat.percent ?? 0
        return (
          <div key={cat.id}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{cat.label}</span>
              <span className="text-muted">{stat.percent == null ? '—' : `${stat.percent}%`}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: cat.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
