import { getLetterGrade } from '../utils/formatters.js'

export function createScoreState() {
  return {
    tickCount: 0,
    inTolCount: 0,
    outputChanges: 0,
    lastOutput: null,
    settlingTime: null,
    firstCrossing: null,
    peakOvershoot: 0,
    windupEvents: 0,
    startTime: 0,
  }
}

export function scoreTick(scoreState, pv, sp, output, tolerance, simTime, prevIntegral, newIntegral, outputMax) {
  scoreState.tickCount++
  const error = Math.abs(pv - sp)

  // Track first setpoint crossing
  if (scoreState.firstCrossing === null) {
    if (error < tolerance) {
      scoreState.firstCrossing = simTime
    }
  }

  // Count in-tolerance ticks (only after first approach)
  if (scoreState.firstCrossing !== null) {
    if (error < tolerance) scoreState.inTolCount++
    if (scoreState.settlingTime === null && error < tolerance) {
      scoreState.settlingTime = simTime - scoreState.startTime
    }
    if (error >= tolerance) scoreState.settlingTime = null // reset if it leaves tolerance
  }

  // Smoothness: track output chatter
  if (scoreState.lastOutput !== null) {
    scoreState.outputChanges += Math.abs(output - scoreState.lastOutput)
  }
  scoreState.lastOutput = output

  // Peak overshoot (distance past setpoint in wrong direction)
  const overshoot = pv - sp // positive if over setpoint
  if (Math.abs(overshoot) > scoreState.peakOvershoot) {
    scoreState.peakOvershoot = Math.abs(overshoot)
  }

  // Windup events: integral was clamped at saturation
  if (Math.abs(newIntegral - prevIntegral) < 0.001 && Math.abs(prevIntegral) >= outputMax * 0.95) {
    scoreState.windupEvents++
  }
}

export function computeScore(scoreState, loopType) {
  const { tickCount, inTolCount, outputChanges, settlingTime } = scoreState
  if (tickCount === 0) return { accuracy: 0, smoothness: 0, speed: 0, overall: 0, grade: 'D' }

  const accuracy = (inTolCount / Math.max(tickCount, 1)) * 100

  // Smoothness: normalize by tickCount. High chatter = low score.
  const avgChatter = outputChanges / Math.max(tickCount, 1)
  const maxChatter = 5 // per-tick output change that = 0% smoothness
  const smoothness = Math.max(0, 100 - (avgChatter / maxChatter) * 100)

  // Speed: compare settling time to 2*tau (ideal)
  let speed = 50 // default
  if (settlingTime !== null) {
    const ideal = 2 * loopType.tau
    const worst = 10 * loopType.tau
    speed = Math.max(0, 100 - ((settlingTime - ideal) / (worst - ideal)) * 100)
  }

  const overall = accuracy * 0.5 + smoothness * 0.3 + speed * 0.2
  return {
    accuracy: Math.round(accuracy),
    smoothness: Math.round(smoothness),
    speed: Math.round(speed),
    overall: Math.round(overall),
    grade: getLetterGrade(overall),
  }
}
