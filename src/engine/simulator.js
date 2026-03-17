import { pidTick } from './pidController.js'
import { processModelTick, resizeDeadTimeBuffer } from './processModel.js'
import { scoreTick, computeScore } from './scorer.js'
import { LOOP_TYPES } from '../constants/loopTypes.js'
import { BADGES } from '../constants/badges.js'

const TICK_RATE_MS = 100 // 10hz

class SimulatorEngine {
  constructor() {
    this.interval = null
    this.store = null
    this._lastSimSpeed = null
  }

  init(store) {
    this.store = store
  }

  start() {
    if (this.interval) return
    this.interval = setInterval(() => this._tick(), TICK_RATE_MS)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  _tick() {
    const state = this.store.getState()
    const { loops, simSpeed, noiseEnabled } = state

    // Resize dead-time buffers if simSpeed changed
    if (this._lastSimSpeed !== simSpeed) {
      for (const loop of Object.values(loops)) {
        const loopType = LOOP_TYPES[loop.typeKey]
        resizeDeadTimeBuffer(loop.processState, loopType, simSpeed)
      }
      this._lastSimSpeed = simSpeed
    }

    const dt = simSpeed / 10 // simulated seconds per tick

    for (const loop of Object.values(loops)) {
      if (!loop.isRunning) continue

      const loopType = LOOP_TYPES[loop.typeKey]
      const newSimTime = loop.simTime + dt

      // Apply scheduled disturbances
      let disturbance = 0
      for (const d of loopType.disturbanceProfile) {
        if (newSimTime >= d.atSimTime && newSimTime < d.atSimTime + d.duration) {
          disturbance = d.magnitude
          break
        }
      }
      loop.processState.disturbance = disturbance

      // PID tick — reverse-acting loops: error = PV - SP (flip via pidSP = 2*PV - SP)
      const prevIntegral = loop.pidState.integral
      const params = { kp: loop.kp, ki: loop.ki, kd: loop.kd }
      // For reverse-acting (e.g. CHW): more output = lower PV, so we flip error sign
      const pidSP = loopType.reverseActing ? 2 * loop.currentPV - loop.setpoint : loop.setpoint
      const pidResult = pidTick(loop.pidState, params, pidSP, loop.currentPV, dt)

      // Update pid state in place
      loop.pidState.integral = pidResult.newState.integral
      loop.pidState.lastPV = pidResult.newState.lastPV
      loop.pidState.lastDerivative = pidResult.newState.lastDerivative

      // Process model tick
      const noiseAmp = noiseEnabled ? loopType.noiseAmplitude : 0
      const newPV = processModelTick(loop.processState, loopType, pidResult.output, dt, noiseAmp)
      // Error shown to user is always SP - PV (even for reverse-acting, for consistency)
      const newError = loop.setpoint - newPV

      // Score tick
      scoreTick(
        loop.scoreState,
        newPV,
        loop.setpoint,
        pidResult.output,
        loopType.tolerance,
        newSimTime,
        prevIntegral,
        loop.pidState.integral,
        100,
      )

      // Compute live score
      const score = computeScore(loop.scoreState, loopType)

      // Health indicator
      const absErr = Math.abs(newError)
      let health = 'green'
      if (absErr >= loopType.tolerance * 2) health = 'red'
      else if (absErr >= loopType.tolerance) health = 'yellow'

      // Diverge detection
      let divergeCount = loop.divergeCount
      if (loop.lastError !== null && Math.abs(newError) > Math.abs(loop.lastError)) {
        divergeCount++
      } else {
        divergeCount = 0
      }
      if (divergeCount >= 5) health = 'red'

      // Track integral saturation for analysis
      const integralSaturated = Math.abs(loop.pidState.integral) >= 99

      // Append to history
      loop.history.push({
        t: newSimTime,
        pv: newPV,
        sp: loop.setpoint,
        output: pidResult.output,
        error: newError,
        integralSaturated,
      })

      // Badge checks
      this._checkBadges(loop, loopType, score, state)

      // Dispatch update (batch all changes into one store update per loop)
      state.updateLoopState(loop.id, {
        simTime: newSimTime,
        currentPV: newPV,
        currentOutput: pidResult.output,
        currentError: newError,
        health,
        divergeCount,
        lastError: newError,
        scoreState: { ...loop.scoreState },
        score,
      })
    }

    // Multi-loop badge
    const runningLoops = Object.values(state.loops).filter(l => l.isRunning)
    if (runningLoops.length >= 3 && runningLoops.every(l => l.health === 'green')) {
      state.earnBadge(BADGES.MULTI_LOOP_MASTER.id)
    }
  }

  _checkBadges(loop, loopType, score, state) {
    if (!loop.scoreState || loop.simTime < loopType.tau * 2) return

    // Perfect Tune
    if (score.overall >= 95) {
      state.earnBadge(BADGES.PERFECT_TUNE.id, loop.id)
    }

    // Cold Start Pro
    if (score.overall >= 85) {
      state.earnBadge(BADGES.COLD_START_PRO.id, loop.id)
    }

    // Steady State Master
    if (score.accuracy >= 95) {
      state.earnBadge(BADGES.STEADY_STATE_MASTER.id, loop.id)
    }

    // Smooth Operator
    if (score.smoothness >= 90) {
      state.earnBadge(BADGES.SMOOTH_OPERATOR.id, loop.id)
    }

    // Speed Demon
    if (score.speed >= 90) {
      state.earnBadge(BADGES.SPEED_DEMON.id, loop.id)
    }

    // No Overshoot: check if peak error beyond setpoint is < 5%
    const histArr = loop.history.toArray()
    if (histArr.length > 20) {
      const sp = loopType.setpoint
      const initial = loopType.initialPV
      const range = Math.abs(sp - initial)
      const maxOver = histArr.reduce((m, h) => {
        const over = (sp > initial) ? (h.pv - sp) : (sp - h.pv)
        return Math.max(m, over)
      }, 0)
      if (maxOver < range * 0.05 && score.accuracy > 60) {
        state.earnBadge(BADGES.NO_OVERSHOOT.id, loop.id)
      }
    }

    // Integral Tamer
    if (loop.scoreState.windupEvents === 0 && loop.simTime >= 120) {
      state.earnBadge(BADGES.INTEGRAL_TAMER.id, loop.id)
    }

    // Pressure Pro
    if ((loop.typeKey === 'SAT_PRESSURE' || loop.typeKey === 'BLDG_STATIC') && score.overall >= 85) {
      state.earnBadge(BADGES.PRESSURE_PRO.id, loop.id)
    }
  }
}

export const simulator = new SimulatorEngine()
