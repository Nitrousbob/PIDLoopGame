import { useState } from 'react'
import Modal from '../shared/Modal.jsx'
import { useSimStore } from '../../store/useSimStore.js'
import { saveToSlot, loadFromSlot, getSlotInfo } from '../../store/usePersistence.js'

export default function SaveLoadModal({ open, onClose }) {
  const getSaveData = useSimStore(s => s.getSaveData)
  const loadSave = useSimStore(s => s.loadSave)
  const [refreshKey, setRefreshKey] = useState(0)

  const slots = [1, 2, 3, 4]

  const handleSave = (slot) => {
    saveToSlot(slot, getSaveData())
    setRefreshKey(k => k + 1)
    alert(`Saved to slot ${slot}!`)
  }

  const handleLoad = (slot) => {
    const data = loadFromSlot(slot)
    if (!data) return alert('No save data in this slot.')
    if (confirm('Load this save? Your current loops will be replaced.')) {
      loadSave(data)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Save / Load">
      <div className="space-y-3">
        <p className="text-xs text-gray-400">Auto-save runs every 30 seconds to Slot 0 (automatic).</p>
        {slots.map(slot => {
          const info = getSlotInfo(slot)
          return (
            <div key={`${slot}-${refreshKey}`} className="flex items-center gap-3 bg-gray-800/60 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-200">Slot {slot}</div>
                {info ? (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {info.loopCount} loop{info.loopCount !== 1 ? 's' : ''} · Score: {info.score} · {info.badgeCount} badges
                    <br />{info.savedAt}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">Empty</div>
                )}
              </div>
              <button
                onClick={() => handleLoad(slot)}
                disabled={!info}
                className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 rounded-lg transition-colors"
              >Load</button>
              <button
                onClick={() => handleSave(slot)}
                className="px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >Save</button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
