export default function LoopStatusBadge({ health, size = 'md' }) {
  const colors = { green: 'bg-green-500', yellow: 'bg-yellow-400', red: 'bg-red-500' }
  const labels = { green: 'On Target', yellow: 'Close', red: 'Needs Attention' }
  const textColors = { green: 'text-green-400', yellow: 'text-yellow-300', red: 'text-red-400' }
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${dotSize} rounded-full ${colors[health]} ${health === 'red' ? 'pulse-red' : ''}`} />
      {size !== 'sm' && (
        <span className={`text-xs font-medium ${textColors[health]}`}>{labels[health]}</span>
      )}
    </span>
  )
}
