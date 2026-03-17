import { clamp } from '../utils/mathUtils.js'

/**
 * Parallel (ISA) form PID with:
 * - Derivative on measurement (prevents setpoint kick)
 * - Clamping anti-windup
 * - Derivative filter (N=10)
 */
export function createPidState() {
  return {
    integral: 0,
    lastPV: null,
    lastDerivative: 0,
  }
}

export function pidTick(pidState, params, setpoint, processValue, dt) {
  const { kp, ki, kd, outputMin = 0, outputMax = 100 } = params
  const N = 10 // derivative filter coefficient

  const error = setpoint - processValue

  // Proportional
  const P = kp * error

  // Integral with clamping anti-windup
  let newIntegral = pidState.integral + ki * error * dt
  newIntegral = clamp(newIntegral, outputMin, outputMax)

  // Derivative on measurement (not error), with filter
  let rawDerivative = 0
  if (pidState.lastPV !== null && dt > 0) {
    rawDerivative = -kd * (processValue - pidState.lastPV) / dt
  }

  // Derivative filter: alpha = N*dt / (kd + N*dt) when kd>0, else 0
  let alpha = 0
  if (kd > 0) {
    alpha = (N * dt) / (kd + N * dt)
  }
  const filteredDerivative = alpha * pidState.lastDerivative + (1 - alpha) * rawDerivative

  let output = clamp(P + newIntegral + filteredDerivative, outputMin, outputMax)

  // Anti-windup: freeze integral if saturated and error pushes same direction
  if ((output >= outputMax && error > 0) || (output <= outputMin && error < 0)) {
    newIntegral = pidState.integral
    output = clamp(P + newIntegral + filteredDerivative, outputMin, outputMax)
  }

  return {
    output,
    newState: {
      integral: newIntegral,
      lastPV: processValue,
      lastDerivative: filteredDerivative,
    },
    components: { P, I: newIntegral, D: filteredDerivative, error },
  }
}
