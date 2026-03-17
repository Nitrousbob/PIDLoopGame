import { useEffect } from 'react'
import { useSimStore } from './store/useSimStore.js'
import { simulator } from './engine/simulator.js'
import { usePersistence } from './store/usePersistence.js'
import Header from './components/layout/Header.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import LoopPanel from './components/loop/LoopPanel.jsx'
import BadgeToast from './components/gamification/BadgeToast.jsx'

function WelcomePanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
      <div className="text-6xl mb-4">⚙️</div>
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to HVAC PID Tuner</h2>
      <p className="text-gray-400 max-w-md leading-relaxed mb-6">
        This simulator lets you tune PID control loops used in real building automation systems.
        Adjust the P, I, and D settings and watch how the loop responds in real time.
      </p>
      <div className="grid grid-cols-3 gap-4 max-w-lg text-left mb-8">
        {[
          { icon: '🎛️', title: 'Tune', desc: 'Adjust P, I, D values and see instant feedback with plain-English explanations.' },
          { icon: '📈', title: 'Chart', desc: 'Watch your process value chase the setpoint in real time on a live chart.' },
          { icon: '🔍', title: 'Analyze', desc: 'Get a detailed report showing tuning deficiencies with tips to fix them.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-semibold text-gray-200 text-sm mb-1">{title}</div>
            <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-blue-400">← Click <strong>+ Add Loop</strong> in the sidebar to get started</p>
    </div>
  )
}

export default function App() {
  const activeLoopId = useSimStore(s => s.activeLoopId)
  const loopOrder = useSimStore(s => s.loopOrder)

  // Initialize simulator with store access
  useEffect(() => {
    simulator.init(useSimStore)
    simulator.start()
    return () => simulator.stop()
  }, [])

  // Persistence
  usePersistence()

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col bg-gray-950">
          {loopOrder.length === 0 ? (
            <WelcomePanel />
          ) : activeLoopId ? (
            <LoopPanel loopId={activeLoopId} />
          ) : (
            <WelcomePanel />
          )}
        </main>
      </div>
      <BadgeToast />
    </div>
  )
}
