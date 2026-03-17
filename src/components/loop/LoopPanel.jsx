import { useState } from 'react'
import { useSimStore } from '../../store/useSimStore.js'
import { LOOP_TYPES } from '../../constants/loopTypes.js'
import { formatPV } from '../../utils/formatters.js'
import LoopStatusBadge from './LoopStatusBadge.jsx'
import PIDTuningPanel from './PIDTuningPanel.jsx'
import LoopChart from './LoopChart.jsx'
import AnalysisPanel from '../analysis/AnalysisPanel.jsx'
import ChallengePanel from '../gamification/ChallengePanel.jsx'
import TabBar from '../shared/TabBar.jsx'

const TABS = [
  { id: 'tune', label: '🎛 Tune' },
  { id: 'chart', label: '📈 Chart' },
  { id: 'analysis', label: '🔍 Analysis' },
  { id: 'challenges', label: '🏆 Challenges' },
]

export default function LoopPanel({ loopId }) {
  const [tab, setTab] = useState('tune')
  const loop = useSimStore(s => s.loops[loopId])

  if (!loop) return (
    <div className="flex-1 flex items-center justify-center text-gray-500">
      Select a loop from the sidebar
    </div>
  )

  const loopType = LOOP_TYPES[loop.typeKey]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Loop Header */}
      <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl">{loopType.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{loop.name}</h2>
              <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full border border-gray-700">
                {loopType.shortName}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{loopType.description}</div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <LoopStatusBadge health={loop.health} />
          </div>
        </div>

        {/* Live readings */}
        <div className="mt-3 grid grid-cols-4 gap-3">
          {[
            { label: 'Process Value', value: formatPV(loop.currentPV, loopType.units), highlight: true },
            { label: 'Setpoint', value: formatPV(loop.setpoint, loopType.units), highlight: false },
            { label: 'Error', value: formatPV(loop.currentError, loopType.units), highlight: false },
            { label: 'Output', value: `${loop.currentOutput.toFixed(1)}%`, highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="bg-gray-800/60 rounded-lg px-3 py-2">
              <div className="text-xs text-gray-400">{label}</div>
              <div className={`font-mono font-bold text-sm ${highlight ? 'text-blue-300' : 'text-gray-100'}`}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <TabBar tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'tune' && <PIDTuningPanel loopId={loopId} />}
        {tab === 'chart' && <LoopChart loopId={loopId} />}
        {tab === 'analysis' && <AnalysisPanel loopId={loopId} />}
        {tab === 'challenges' && <ChallengePanel loopId={loopId} onClose={() => {}} />}
      </div>
    </div>
  )
}
