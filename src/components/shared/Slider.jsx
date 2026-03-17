export default function Slider({ label, value, min, max, step, onChange, disabled, description, unit = '' }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={`space-y-1 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-gray-200">{label}</span>
        <span className="text-base font-mono font-bold text-blue-300">{value.toFixed(step < 0.1 ? 3 : step < 1 ? 2 : 1)}{unit}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #3b82f6 ${pct}%, #374151 ${pct}%)`,
            borderRadius: '3px',
            height: '6px',
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {description && (
        <p className="text-xs text-gray-400 leading-relaxed italic mt-1">{description}</p>
      )}
    </div>
  )
}
