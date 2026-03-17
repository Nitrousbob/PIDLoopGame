import { useState } from 'react'
import { useSimStore } from '../../store/useSimStore.js'
import BadgeDisplay from '../gamification/BadgeDisplay.jsx'
import SaveLoadModal from '../modals/SaveLoadModal.jsx'
import Modal from '../shared/Modal.jsx'

export default function Header({ onAddLoop }) {
  const globalScore = useSimStore(s => s.globalScore)
  const badgeCount = useSimStore(s => Object.keys(s.globalBadges).length)
  const [showBadges, setShowBadges] = useState(false)
  const [showSaveLoad, setShowSaveLoad] = useState(false)

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900/80 border-b border-gray-800 backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="text-2xl">⚙️</div>
        <div>
          <h1 className="text-lg font-bold text-white leading-none">HVAC PID Tuner</h1>
          <p className="text-xs text-gray-400 leading-none mt-0.5">Building Automation Loop Simulator</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5 border border-gray-700">
          <span className="text-yellow-400 text-sm">⭐</span>
          <span className="text-sm font-bold text-yellow-300">{globalScore.toLocaleString()}</span>
          <span className="text-xs text-gray-400">pts</span>
        </div>

        <button
          onClick={() => setShowBadges(true)}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 rounded-full px-3 py-1.5 border border-gray-700 transition-colors"
        >
          <span className="text-sm">🏅</span>
          <span className="text-sm text-gray-300">{badgeCount}</span>
        </button>

        <button
          onClick={() => setShowSaveLoad(true)}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 rounded-full px-3 py-1.5 border border-gray-700 transition-colors text-sm text-gray-300"
        >
          💾 Save/Load
        </button>
      </div>

      <Modal open={showBadges} onClose={() => setShowBadges(false)} title="Your Badges" maxWidth="max-w-xl">
        <BadgeDisplay />
      </Modal>

      <SaveLoadModal open={showSaveLoad} onClose={() => setShowSaveLoad(false)} />
    </header>
  )
}
