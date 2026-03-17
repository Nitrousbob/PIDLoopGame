/**
 * Analyzes a loop's history buffer to detect PID tuning deficiencies.
 * Returns an AnalysisResult with deficiencies, metrics, and a plain-English summary.
 */
export function analyzeLoop(history, loopType) {
  if (history.length < 20) {
    return { deficiencies: [], metrics: {}, summary: 'Not enough data yet. Run the loop for at least 30 seconds before analyzing.' }
  }

  const deficiencies = []
  const metrics = {}
  const sp = history[0]?.sp ?? loopType.setpoint

  // --- 1. Overshoot Detection ---
  let firstCrossIdx = -1
  for (let i = 1; i < history.length; i++) {
    if (Math.abs(history[i].pv - sp) < loopType.tolerance) {
      firstCrossIdx = i
      break
    }
  }

  if (firstCrossIdx !== -1) {
    let peakOver = 0
    for (let i = firstCrossIdx; i < Math.min(firstCrossIdx + 100, history.length); i++) {
      const over = Math.abs(history[i].pv - sp) - loopType.tolerance
      if (over > peakOver) peakOver = over
    }
    const overshootPct = (peakOver / Math.abs(sp - history[0].pv + 0.001)) * 100
    metrics.overshootPct = Math.round(overshootPct * 10) / 10

    if (overshootPct > 15) {
      deficiencies.push({
        id: 'overshoot',
        severity: 'CRITICAL',
        title: 'Too Much Overshoot',
        explanation: `Your system shot past the target by ${metrics.overshootPct}%. Think of it like a car that brakes too late — it blows past the stop sign and has to back up. This usually means your P setting is cranked up too high, causing the system to push too hard even when it's close to the goal.`,
        suggestion: 'Try reducing your P (Proportional) value by 20-30% and see if the overshoot decreases.',
        metric: metrics.overshootPct,
        threshold: 15,
      })
    } else if (overshootPct > 5) {
      deficiencies.push({
        id: 'overshoot',
        severity: 'WARNING',
        title: 'Slight Overshoot',
        explanation: `Your system went a little past the target (${metrics.overshootPct}%). A small amount of overshoot is sometimes okay, but it can cause equipment to work harder than needed. The P setting might be slightly high, or you may need a small D (Derivative) value to slow things down near the target.`,
        suggestion: 'Try slightly reducing P, or adding a small D value to dampen the approach.',
        metric: metrics.overshootPct,
        threshold: 5,
      })
    }
  }

  // --- 2. Oscillation Detection ---
  const tail = history.slice(Math.floor(history.length * 0.3))
  let zeroCrossings = 0
  for (let i = 1; i < tail.length; i++) {
    const prev = tail[i - 1].pv - tail[i - 1].sp
    const curr = tail[i].pv - tail[i].sp
    if (prev * curr < 0) zeroCrossings++
  }
  const observedSeconds = tail.length / 10 // at 10hz
  const crossingsPerTau = zeroCrossings / Math.max(observedSeconds / loopType.tau, 0.1)
  metrics.crossingsPerTau = Math.round(crossingsPerTau * 10) / 10

  if (crossingsPerTau > 3) {
    deficiencies.push({
      id: 'oscillation',
      severity: 'CRITICAL',
      title: 'Constant Hunting/Oscillation',
      explanation: `The system keeps swinging back and forth past the target like a pendulum that won't stop. This is called "hunting" in HVAC. It means your P or I settings are way too high, causing the controller to overcorrect in both directions over and over.`,
      suggestion: 'Reduce P significantly (cut it in half), then reduce I as well. Start fresh from lower values.',
      metric: metrics.crossingsPerTau,
      threshold: 3,
    })
  } else if (crossingsPerTau > 1.5) {
    deficiencies.push({
      id: 'oscillation',
      severity: 'WARNING',
      title: 'Mild Oscillation',
      explanation: `The system is wobbling a bit around the target instead of settling smoothly. It's not terrible, but it wastes energy and can wear out valves and actuators faster. Your P or I value may be a little high.`,
      suggestion: 'Try reducing I (Integral) by 30% first, then P if oscillation continues.',
      metric: metrics.crossingsPerTau,
      threshold: 1.5,
    })
  }

  // --- 3. Slow Response Detection ---
  const initial = history[0]?.pv ?? loopType.initialPV
  const target63 = initial + 0.63 * (sp - initial)
  let rise63Time = null
  for (let i = 0; i < history.length; i++) {
    const d = Math.sign(sp - initial)
    if (d * (history[i].pv - target63) >= 0) {
      rise63Time = i / 10
      break
    }
  }
  metrics.rise63Time = rise63Time !== null ? Math.round(rise63Time) : null

  if (rise63Time !== null && rise63Time > 4 * loopType.tau) {
    deficiencies.push({
      id: 'slow_response',
      severity: 'WARNING',
      title: 'Slow to Respond',
      explanation: `The system is taking a long time to get moving toward the target (${rise63Time}s to reach 63% of the way there, when it should take around ${Math.round(loopType.tau)}s). It's like a car with too little throttle — it creeps toward the destination instead of driving at a normal speed.`,
      suggestion: 'Increase your P (Proportional) value. A higher P makes the system push harder when it\'s far from the setpoint.',
      metric: rise63Time,
      threshold: loopType.tau,
    })
  }

  // --- 4. Integral Windup Detection ---
  let windupTicks = 0
  for (let i = 1; i < history.length; i++) {
    if (history[i].integralSaturated) windupTicks++
  }
  const windupFraction = windupTicks / history.length
  metrics.windupFraction = Math.round(windupFraction * 100)

  if (windupFraction > 0.15) {
    deficiencies.push({
      id: 'windup',
      severity: 'WARNING',
      title: 'Integral Windup',
      explanation: `The I (Integral) part of your controller kept building up too much force while the system was stuck, then dumped it all at once causing a big overshoot. Think of it like squeezing a water balloon — if you keep squeezing when nothing comes out, then suddenly release, water goes everywhere.`,
      suggestion: 'Reduce the I value, or ensure anti-windup is active in the controller. Never set I too high on slow processes.',
      metric: metrics.windupFraction,
      threshold: 15,
    })
  }

  // --- 5. Steady-State Error ---
  const finalSection = history.slice(Math.floor(history.length * 0.8))
  if (finalSection.length > 5) {
    const meanError = finalSection.reduce((s, h) => s + Math.abs(h.pv - h.sp), 0) / finalSection.length
    metrics.steadyStateError = Math.round(meanError * 100) / 100

    if (meanError > loopType.tolerance * 0.5) {
      deficiencies.push({
        id: 'steady_state_error',
        severity: 'WARNING',
        title: 'Missing the Target (Steady-State Error)',
        explanation: `The system got close to the setpoint but never quite reached it — it's off by about ${metrics.steadyStateError} ${loopType.units} on average. This is called steady-state error. A P-only controller will always have some of this. Adding or increasing I (Integral) fixes it over time.`,
        suggestion: 'Increase I (Integral) slightly. Even a small I value will eliminate steady-state error.',
        metric: metrics.steadyStateError,
        threshold: loopType.tolerance * 0.5,
      })
    }
  }

  // --- 6. Output Saturation ---
  let satTicks = 0
  for (const h of history) {
    if (h.output >= 99 || h.output <= 1) satTicks++
  }
  const satFraction = satTicks / history.length
  metrics.saturationPct = Math.round(satFraction * 100)

  if (satFraction > 0.3) {
    deficiencies.push({
      id: 'saturation',
      severity: 'WARNING',
      title: 'Output Maxed Out Too Often',
      explanation: `The control output (valve position, fan speed, etc.) was fully open or fully closed ${metrics.saturationPct}% of the time. When the output is pegged at the limit, the controller loses the ability to make fine adjustments. The system might be undersized for this setpoint, or the P gain is too high.`,
      suggestion: 'Check if the setpoint is achievable. If yes, reduce P to prevent the output from slamming to limits.',
      metric: metrics.saturationPct,
      threshold: 30,
    })
  }

  // --- Build Summary ---
  const criticals = deficiencies.filter(d => d.severity === 'CRITICAL').length
  const warnings = deficiencies.filter(d => d.severity === 'WARNING').length

  let summary
  if (deficiencies.length === 0) {
    summary = 'Great job! No major tuning issues were found. Your loop is responding smoothly and holding the setpoint well.'
  } else if (criticals > 0) {
    summary = `Found ${criticals} critical issue${criticals > 1 ? 's' : ''} that need attention — your loop is having real trouble. Focus on the red items first. ${warnings > 0 ? `There are also ${warnings} warning(s) to address after.` : ''}`
  } else {
    summary = `Found ${warnings} area${warnings > 1 ? 's' : ''} where your tuning could be improved. These are not emergencies, but fixing them will make your loop run smoother and save energy.`
  }

  return { deficiencies, metrics, summary }
}
