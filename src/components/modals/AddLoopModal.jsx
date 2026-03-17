import { useState } from 'react'
import Modal from '../shared/Modal.jsx'
import { LOOP_TYPE_LIST } from '../../constants/loopTypes.js'
import { useSimStore } from '../../store/useSimStore.js'

const DIFFICULTY_LABELS = ['', 'Easy', 'Medium', 'Hard']
const DIFFICULTY_COLORS = ['', 'text-green-400', 'text-yellow-400', 'text-red-400']

export default function AddLoopModal({ open, onClose }) {
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const addLoop = useSimStore(s => s.addLoop)
  const setActiveLoop = useSimStore(s => s.setActiveLoop)

  const handleAdd = () => {
    if (!selected) return
    const id = addLoop(selected, name || undefined)
    setActiveLoop(id)
    setSelected(null)
    setName('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Loop" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">Choose the type of control loop you want to simulate:</p>

        <div className="grid grid-cols-2 gap-3">
          {LOOP_TYPE_LIST.map(lt => (
            <button
              key={lt.key}
              onClick={() => { setSelected(lt.key); setName(lt.shortName) }}
              className={`text-left p-4 rounded-xl border transition-all ${
                selected === lt.key
                  ? 'border-blue-500 bg-blue-950/50'
                  : 'border-gray-700 bg-gray-800/60 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{lt.icon}</span>
                <span className={`text-xs font-medium ${DIFFICULTY_COLORS[lt.difficulty]}`}>
                  {DIFFICULTY_LABELS[lt.difficulty]}
                </span>
              </div>
              <div className="font-semibold text-gray-100 text-sm">{lt.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                Setpoint: {lt.setpoint} {lt.units} · τ = {lt.tau}s
              </div>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{lt.description}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="border-t border-gray-800 pt-4">
            <label className="block text-sm text-gray-300 mb-1">Name this loop (optional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`My ${LOOP_TYPE_LIST.find(l => l.key === selected)?.shortName}`}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
        )}

        <div className="flex gap-3 justify-end border-t border-gray-800 pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selected}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-lg font-semibold transition-colors"
          >
            Add Loop
          </button>
        </div>
      </div>
    </Modal>
  )
}
