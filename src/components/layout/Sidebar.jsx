import { useState } from 'react'
import { useSimStore } from '../../store/useSimStore.js'
import LoopCard from '../loop/LoopCard.jsx'
import AddLoopModal from '../modals/AddLoopModal.jsx'

export default function Sidebar() {
  const loopOrder = useSimStore(s => s.loopOrder)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
        >
          + Add Loop
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loopOrder.length === 0 ? (
          <div className="text-center py-8 px-3">
            <div className="text-4xl mb-2">🎛️</div>
            <p className="text-sm text-gray-500 leading-relaxed">
              No loops yet. Add your first loop to start tuning!
            </p>
          </div>
        ) : (
          loopOrder.map(id => <LoopCard key={id} loopId={id} />)
        )}
      </div>

      <div className="p-3 border-t border-gray-800 text-xs text-gray-600 text-center">
        {loopOrder.length} loop{loopOrder.length !== 1 ? 's' : ''}
      </div>

      <AddLoopModal open={showAdd} onClose={() => setShowAdd(false)} />
    </aside>
  )
}
