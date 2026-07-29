import { getIcon } from '../../lib/icons'
import { ACTIVITY_TYPES } from '../../lib/activityTypes'

export default function ActivityTypePicker({ selected, onSelect, size = 'md' }) {
  const isSmall = size === 'sm'
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {ACTIVITY_TYPES.map((type) => {
        const Icon = getIcon(type.icon)
        const isSelected = selected === type.id
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelect(type.id)}
            className="flex shrink-0 cursor-pointer flex-col items-center gap-1.5"
          >
            <span
              className={`grid place-items-center rounded-2xl transition-all ${
                isSmall ? 'h-12 w-12' : 'h-16 w-16'
              } ${isSelected ? 'ring-2 ring-offset-2 ring-offset-surface' : ''}`}
              style={{
                backgroundColor: isSelected ? type.color : `${type.color}1a`,
                color: isSelected ? '#fff' : type.color,
                ...(isSelected ? { '--tw-ring-color': type.color } : {}),
              }}
            >
              <Icon className={isSmall ? 'h-5 w-5' : 'h-7 w-7'} strokeWidth={2} />
            </span>
            <span className={`font-medium text-muted ${isSmall ? 'text-[11px]' : 'text-xs'}`}>{type.label}</span>
          </button>
        )
      })}
    </div>
  )
}
