export default function GlassCard({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag
      className={`glass-panel rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
