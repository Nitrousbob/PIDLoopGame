import { useSimStore } from '../../store/useSimStore.js'
import { LOOP_TYPES } from '../../constants/loopTypes.js'
import { analyzeLoop } from '../../engine/analyzer.js'
import { computeScore } from '../../engine/scorer.js'
import { getLetterGrade, getGradeColor } from '../../utils/formatters.js'

const SEVERITY_STYLES = {
  CRITICAL: {
    border: 'border-red-700',
    bg: 'bg-red-950/40',
    badge: 'bg-red-800 text-red-200',
    icon: '🚨',
  },
  WARNING: {
    border: 'border-yellow-700',
    bg: 'bg-yellow-950/40',
    badge: 'bg-yellow-800 text-yellow-200',
    icon: '⚠️',
  },
  INFO: {
    border: 'border-blue-700',
    bg: 'bg-blue-950/40',
    badge: 'bg-blue-800 text-blue-200',
    icon: 'ℹ️',
  },
}

export default function AnalysisPanel({ loopId }) {
  const loop = useSimStore(s => s.loops[loopId])
  const setAnalysis = useSimStore(s => s.setAnalysis)

  if (!loop) return null
  const loopType = LOOP_TYPES[loop.typeKey]
  const histLen = loop.history.length

  const runAnalysis = () => {
    const history = loop.history.toArray()
    const result = analyzeLoop(history, loopType)
    setAnalysis(loopId, result)
  }

  const score = loop.score
  const analysis = loop.analysis

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Loop Analysis</h3>
          <p className="text-xs text-gray-400">{histLen} data points collected ({(histLen / 10).toFixed(0)}s of simulated data)</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={histLen < 20}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg font-semibold transition-colors"
        >
          🔍 Analyze Loop
        </button>
      </div>

      {/* Live score */}
      {score && (
        <div className="bg-gray-800/60 rounded-xl p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className={`text-5xl font-black ${getGradeColor(score.grade)} grade-reveal`} key={score.grade}>
              {score.grade}
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">Overall Score</div>
              <div className="text-2xl font-bold text-white">{score.overall}<span className="text-sm text-gray-400">/100</span></div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Accuracy (50%)', value: score.accuracy, color: 'bg-blue-500' },
              { label: 'Smoothness (30%)', value: score.smoothness, color: 'bg-emerald-500' },
              { label: 'Speed (20%)', value: score.speed, color: 'bg-purple-500' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{label}</span>
                  <span className="font-mono font-bold text-gray-200">{value}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis results */}
      {analysis ? (
        <div className="space-y-3">
          <div className={`rounded-lg p-3 text-sm ${
            analysis.deficiencies.length === 0
              ? 'bg-green-950/40 border border-green-800 text-green-300'
              : 'bg-gray-800/60 border border-gray-700 text-gray-300'
          }`}>
            {analysis.summary}
          </div>

          {analysis.deficiencies.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              ✅ No deficiencies detected — your loop looks well-tuned!
            </div>
          )}

          {analysis.deficiencies.map(d => {
            const style = SEVERITY_STYLES[d.severity] || SEVERITY_STYLES.INFO
            return (
              <div key={d.id} className={`rounded-xl p-4 border ${style.border} ${style.bg} space-y-2`}>
                <div className="flex items-center gap-2">
                  <span>{style.icon}</span>
                  <span className="font-semibold text-gray-100">{d.title}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                    {d.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{d.explanation}</p>
                <div className="bg-gray-900/60 rounded-lg p-2.5 text-xs text-blue-300">
                  💡 <strong>Suggestion:</strong> {d.suggestion}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          <div className="text-3xl mb-2">🔍</div>
          <p>Run your loop, then click <strong className="text-gray-300">Analyze Loop</strong> to get a detailed report of how well your PID is tuned.</p>
          <p className="mt-2 text-xs">You need at least 30 seconds of data to analyze.</p>
        </div>
      )}
    </div>
  )
}
