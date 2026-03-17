import { useSimStore } from '../../store/useSimStore.js'
import { LOOP_TYPES } from '../../constants/loopTypes.js'
import Slider from '../shared/Slider.jsx'

const PID_DESCRIPTIONS = {
  kp: (loopType) =>
    `P is like how hard you push when you're off target. If the temperature is 10 degrees away from the setpoint, P says "push ${loopType.shortName.toLowerCase()} harder by that much." Too high = the system overshoots and hunts back and forth. Too low = it takes forever to get there.`,
  ki: () =>
    `I is a slow buildup that fixes small leftover errors over time. Even if the system is only a tiny bit off, I will keep nudging it until it hits the bullseye. Too much I causes the system to wobble (oscillate). Zero I means the loop might never quite reach the exact setpoint.`,
  kd: () =>
    `D acts like brakes — it slows the system down when it's moving fast toward the target, preventing it from flying past. In HVAC, D is rarely needed for slow temperature loops, but fast pressure loops can benefit. Too much D makes the system react to every tiny sensor wiggle.`,
}

export default function PIDTuningPanel({ loopId }) {
  const loop = useSimStore(s => s.loops[loopId])
  const setLoopParam = useSimStore(s => s.setLoopParam)
  const setLoopRunning = useSimStore(s => s.setLoopRunning)
  const resetLoop = useSimStore(s => s.resetLoop)
  const simSpeed = useSimStore(s => s.simSpeed)
  const setSimSpeed = useSimStore(s => s.setSimSpeed)

  if (!loop) return null
  const loopType = LOOP_TYPES[loop.typeKey]
  const isRunning = loop.isRunning
  const disabled = isRunning

  const pAbs = Math.abs(loopType.pRange[0]) > 0.01 || loopType.reverseActing
  const pMin = loopType.pRange[0]
  const pMax = loopType.pRange[1]
  const iMin = loopType.iRange[0]
  const iMax = loopType.iRange[1]
  const dMin = loopType.dRange[0]
  const dMax = loopType.dRange[1]

  return (
    <div className="space-y-5">
      {disabled && (
        <div className="bg-amber-950/50 border border-amber-800 rounded-lg px-3 py-2 text-amber-300 text-xs flex items-center gap-2">
          <span>⏸</span> Pause the loop to adjust PID values
        </div>
      )}
      {loopType.reverseActing && (
        <div className="bg-blue-950/50 border border-blue-800 rounded-lg px-3 py-2 text-blue-300 text-xs flex items-center gap-2">
          <span>🔄</span> <strong>Reverse-acting loop:</strong> More output = more cooling (PV goes down). Standard positive P, I, D values work correctly.
        </div>
      )}

      <div className="bg-gray-800/60 rounded-lg p-4 space-y-1">
        <Slider
          label="Proportional (P)"
          value={loop.kp}
          min={pMin}
          max={pMax}
          step={loopType.pStep}
          onChange={v => setLoopParam(loopId, 'kp', v)}
          disabled={disabled}
          description={PID_DESCRIPTIONS.kp(loopType)}
        />
      </div>

      <div className="bg-gray-800/60 rounded-lg p-4 space-y-1">
        <Slider
          label="Integral (I)"
          value={loop.ki}
          min={iMin}
          max={iMax}
          step={loopType.iStep}
          onChange={v => setLoopParam(loopId, 'ki', v)}
          disabled={disabled}
          description={PID_DESCRIPTIONS.ki(loopType)}
        />
      </div>

      <div className="bg-gray-800/60 rounded-lg p-4 space-y-1">
        <Slider
          label="Derivative (D)"
          value={loop.kd}
          min={dMin}
          max={dMax}
          step={loopType.dStep}
          onChange={v => setLoopParam(loopId, 'kd', v)}
          disabled={disabled}
          description={PID_DESCRIPTIONS.kd(loopType)}
        />
      </div>

      {/* Setpoint control */}
      <div className="bg-gray-800/60 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-200">Setpoint</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={loop.setpoint}
              onChange={e => setLoopParam(loopId, 'setpoint', parseFloat(e.target.value))}
              className="w-24 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-right font-mono text-blue-300 focus:outline-none focus:border-blue-500"
              step={loopType.pStep}
            />
            <span className="text-gray-400 text-sm">{loopType.units}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[-10, -5, -1, +1, +5, +10].map(delta => {
            const d = loopType.units === 'in H₂O'
              ? delta * loopType.tolerance
              : delta
            const label = delta > 0 ? `+${d.toFixed(Math.abs(delta) < 2 ? 3 : 0)}` : d.toFixed(Math.abs(delta) < 2 ? 3 : 0)
            return (
              <button
                key={delta}
                onClick={() => setLoopParam(loopId, 'setpoint', Math.round((loop.setpoint + d) * 1000) / 1000)}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
              >{label}</button>
            )
          })}
        </div>
      </div>

      {/* Simulation speed */}
      <div className="bg-gray-800/60 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-200">Simulation Speed</div>
            <div className="text-xs text-gray-400 mt-0.5">Speed up slow loops (hot water, zone temp) to see results faster</div>
          </div>
          <div className="flex gap-1">
            {[1, 5, 10, 60].map(s => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                className={`px-2.5 py-1.5 text-xs rounded font-mono font-bold transition-colors ${
                  simSpeed === s ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >{s}x</button>
            ))}
          </div>
        </div>
      </div>

      {/* Run controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={() => setLoopRunning(loopId, true)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 font-semibold transition-colors"
          >
            ▶ Run
          </button>
        ) : (
          <button
            onClick={() => setLoopRunning(loopId, false)}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg py-2.5 font-semibold transition-colors"
          >
            ⏸ Pause
          </button>
        )}
        <button
          onClick={() => resetLoop(loopId)}
          className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-semibold transition-colors"
          title="Reset loop"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  )
}
