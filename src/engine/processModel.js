import { gaussianNoise } from '../utils/mathUtils.js'

/**
 * First-Order Plus Dead Time (FOPDT) process model
 * PV(s) = [Kp / (tau*s + 1)] * e^(-deadTime*s) * U(s)
 */
export function createProcessState(loopType, simSpeed) {
  const dt = simSpeed / 10
  const bufferSize = Math.max(1, Math.round(loopType.deadTime / dt))
  const deadTimeBuffer = new Array(bufferSize).fill(loopType.initialOutput)

  return {
    pv: loopType.initialPV,
    deadTimeBuffer,
    disturbance: 0,
  }
}

export function processModelTick(processState, loopType, controlOutput, dt, noiseAmplitude) {
  // 1. Dead-time: push current output, get delayed output
  processState.deadTimeBuffer.push(controlOutput)
  const delayedOutput = processState.deadTimeBuffer.shift()

  // 2. First-order lag: dPV/dt = (Kp * u_delayed - PV + disturbance) / tau
  const { processGain, tau } = loopType
  const dPV = (processGain * delayedOutput - (processState.pv - loopType.initialPV) + processState.disturbance) / tau

  const newPV = processState.pv + dPV * dt

  // 3. Add Gaussian noise
  const noisyPV = newPV + gaussianNoise(noiseAmplitude !== undefined ? noiseAmplitude : loopType.noiseAmplitude)

  processState.pv = newPV // store clean PV internally

  return noisyPV
}

export function resizeDeadTimeBuffer(processState, loopType, simSpeed) {
  const dt = simSpeed / 10
  const newSize = Math.max(1, Math.round(loopType.deadTime / dt))
  const currentVal = processState.deadTimeBuffer[0] ?? loopType.initialOutput
  processState.deadTimeBuffer = new Array(newSize).fill(currentVal)
}
