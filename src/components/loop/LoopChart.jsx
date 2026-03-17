import { useMemo, useState } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine,
  ReferenceArea, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useSimStore } from '../../store/useSimStore.js'
import { LOOP_TYPES } from '../../constants/loopTypes.js'

const TIME_WINDOWS = [
  { label: '30s', ticks: 300 },
  { label: '60s', ticks: 600 },
  { label: '120s', ticks: 1200 },
]

export default function LoopChart({ loopId }) {
  const loop = useSimStore(s => s.loops[loopId])
  const [windowIdx, setWindowIdx] = useState(0)

  if (!loop) return null

  const loopType = LOOP_TYPES[loop.typeKey]
  const { ticks } = TIME_WINDOWS[windowIdx]
  const history = loop.history.last(ticks)

  // Thin data for performance (max 200 points on chart)
  const data = useMemo(() => {
    if (history.length <= 150) return history
    const step = Math.ceil(history.length / 150)
    return history.filter((_, i) => i % step === 0)
  }, [history])

  const sp = loop.setpoint
  const tolHigh = sp + loopType.tolerance
  const tolLow = sp - loopType.tolerance
  const dec = loopType.units === 'in H₂O' ? 3 : 1

  const formatX = (t) => {
    if (t === undefined) return ''
    return `${t.toFixed(0)}s`
  }

  const formatY = (v) => `${v.toFixed(dec)}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-500 inline-block" /> PV ({loopType.units})</span>
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 border-t-2 border-dashed border-gray-400 inline-block" /> Setpoint</span>
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-emerald-500 inline-block" /> Output (%)</span>
        </div>
        <div className="flex gap-1">
          {TIME_WINDOWS.map((w, i) => (
            <button
              key={w.label}
              onClick={() => setWindowIdx(i)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                windowIdx === i ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >{w.label}</button>
          ))}
        </div>
      </div>

      {data.length < 5 ? (
        <div className="h-52 flex items-center justify-center text-gray-500 text-sm bg-gray-900 rounded-lg border border-gray-800">
          Run the loop to see the chart
        </div>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 50, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="t"
                tickFormatter={formatX}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                stroke="#374151"
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="pv"
                tickFormatter={formatY}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                stroke="#374151"
                width={45}
                domain={['auto', 'auto']}
              />
              <YAxis
                yAxisId="out"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                stroke="#374151"
                width={35}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                labelFormatter={v => `t=${typeof v === 'number' ? v.toFixed(1) : v}s`}
                formatter={(val, name) => {
                  if (name === 'output') return [`${val.toFixed(1)}%`, 'Output']
                  return [`${val.toFixed(dec)} ${loopType.units}`, name === 'pv' ? 'PV' : 'SP']
                }}
              />
              <ReferenceArea
                yAxisId="pv"
                y1={tolLow}
                y2={tolHigh}
                fill="#22c55e"
                fillOpacity={0.08}
                strokeOpacity={0}
              />
              <ReferenceLine
                yAxisId="pv"
                y={sp}
                stroke="#6b7280"
                strokeDasharray="6 3"
                strokeWidth={1.5}
              />
              <Line
                yAxisId="pv"
                type="monotone"
                dataKey="pv"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="out"
                type="monotone"
                dataKey="output"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                strokeOpacity={0.7}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
