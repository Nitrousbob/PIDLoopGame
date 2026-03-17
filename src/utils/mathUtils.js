export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

// Box-Muller transform for Gaussian noise
let _seed = 1
export function gaussianNoise(amplitude) {
  if (amplitude === 0) return 0
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  const u1 = ((_seed >>> 0) / 0xffffffff)
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  const u2 = ((_seed >>> 0) / 0xffffffff)
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-9))) * Math.cos(2 * Math.PI * u2)
  return z * amplitude
}

export function round(val, decimals = 2) {
  const factor = Math.pow(10, decimals)
  return Math.round(val * factor) / factor
}
