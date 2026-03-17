import { useSimStore } from '../../store/useSimStore.js'
import { CHALLENGES } from '../../constants/challenges.js'

const TIER_STYLES = {
  beginner: { label: 'Beginner', color: 'text-green-400 bg-green-900/40 border-green-800' },
  intermediate: { label: 'Intermediate', color: 'text-yellow-400 bg-yellow-900/40 border-yellow-800' },
  expert: { label: 'Expert', color: 'text-red-400 bg-red-900/40 border-red-800' },
}

export default function ChallengePanel({ loopId, onClose }) {
  const addLoop = useSimStore(s => s.addLoop)
  const setLoopParam = useSimStore(s => s.setLoopParam)
  const loops = useSimStore(s => s.loops)
  const setActiveLoop = useSimStore(s => s.setActiveLoop)

  const startChallenge = (challenge) => {
    if (!challenge.loopType) {
      alert('Add loops for all 6 types manually for this challenge!')
      return
    }
    // Find or create a loop of the right type
    let targetId = null
    if (loopId && loops[loopId]?.typeKey === challenge.loopType) {
      targetId = loopId
    } else {
      targetId = addLoop(challenge.loopType, `${challenge.name} Loop`)
    }
    // Set the challenge starting PID values
    if (challenge.startKp !== null) setLoopParam(targetId, 'kp', challenge.startKp)
    if (challenge.startKi !== null) setLoopParam(targetId, 'ki', challenge.startKi)
    if (challenge.startKd !== null) setLoopParam(targetId, 'kd', challenge.startKd)
    setActiveLoop(targetId)
    if (onClose) onClose()
  }

  const tiers = ['beginner', 'intermediate', 'expert']

  return (
    <div className="space-y-4">
      {tiers.map(tier => {
        const tierChallenges = CHALLENGES.filter(c => c.tier === tier)
        const style = TIER_STYLES[tier]
        return (
          <div key={tier}>
            <div className={`inline-block text-xs font-bold uppercase px-2 py-0.5 rounded border mb-2 ${style.color}`}>
              {style.label}
            </div>
            <div className="space-y-2">
              {tierChallenges.map(c => (
                <div key={c.id} className="bg-gray-800/70 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-100 text-sm">{c.name}</div>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{c.description}</p>
                      <div className="mt-2 bg-blue-950/50 border border-blue-900 rounded-lg px-2.5 py-1.5 text-xs text-blue-300">
                        🎯 <strong>Goal:</strong> {c.objective}
                      </div>
                      <div className="mt-1.5 text-xs text-gray-500 italic">
                        💡 {c.hint}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => startChallenge(c)}
                    className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-semibold transition-colors"
                  >
                    Start Challenge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
