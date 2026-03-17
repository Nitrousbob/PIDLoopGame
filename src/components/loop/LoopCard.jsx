import { useSimStore } from '../../store/useSimStore.js'
import { LOOP_TYPES } from '../../constants/loopTypes.js'
import { formatPV, formatScore } from '../../utils/formatters.js'
import LoopStatusBadge from './LoopStatusBadge.jsx'

export default function LoopCard({ loopId }) {
  const loop = useSimStore(s => s.loops[loopId])
  const activeLoopId = useSimStore(s => s.activeLoopId)
  const setActiveLoop = useSimStore(s => s.setActiveLoop)
  const removeLoop = useSimStore(s => s.removeLoop)

  if (!loop) return null
  const loopType = LOOP_TYPES[loop.typeKey]
  const isActive = activeLoopId === loopId
  const score = loop.score

  return (
    <div
      className={`group relative rounded-lg p-3 cursor-pointer transition-all border ${
        isActive
          ? 'bg-gray-800 border-blue-600'
          : 'bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-850'
      }`}
      onClick={() => setActiveLoop(loopId)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{loopType.icon}</span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-100 truncate">{loop.name}</div>
            <div className="text-xs text-gray-400 truncate">{loopType.shortName}</div>
          </div>
        </div>
        <LoopStatusBadge health={loop.health} size="sm" />
      </div>

      <div className="mt-2 flex justify-between items-end">
        <div>
          <span className="text-base font-mono font-bold text-blue-300">
            {formatPV(loop.currentPV, loopType.units)}
          </span>
          <span className="text-xs text-gray-500 ml-1">/ {formatPV(loop.setpoint, loopType.units)}</span>
        </div>
        {score && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            score.grade === 'S' ? 'bg-yellow-900/50 text-yellow-300' :
            score.grade === 'A' ? 'bg-green-900/50 text-green-400' :
            score.grade === 'B' ? 'bg-blue-900/50 text-blue-400' :
            score.grade === 'C' ? 'bg-orange-900/50 text-orange-400' :
            'bg-red-900/50 text-red-400'
          }`}>{score.grade} {formatScore(score.overall)}</span>
        )}
      </div>

      {loop.isRunning && (
        <div className="mt-1.5 w-full bg-gray-700 rounded-full h-1">
          <div
            className="bg-blue-500 h-1 rounded-full transition-all"
            style={{ width: `${Math.min(loop.currentOutput, 100)}%` }}
          />
        </div>
      )}

      <button
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-sm leading-none p-1 transition-opacity"
        onClick={e => { e.stopPropagation(); removeLoop(loopId) }}
        title="Remove loop"
      >×</button>
    </div>
  )
}
