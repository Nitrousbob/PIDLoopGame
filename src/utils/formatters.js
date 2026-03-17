export function formatPV(value, units, decimals) {
  if (value === null || value === undefined || isNaN(value)) return '--'
  const d = decimals !== undefined ? decimals : getDecimals(units)
  return `${value.toFixed(d)}${units}`
}

function getDecimals(units) {
  if (units === '°F') return 1
  if (units === 'in H₂O') return 3
  if (units === '%') return 1
  return 2
}

export function formatScore(score) {
  if (score === null || score === undefined) return '---'
  return Math.round(score).toString()
}

export function getLetterGrade(score) {
  if (score >= 95) return 'S'
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  return 'D'
}

export function getGradeColor(grade) {
  const map = { S: 'text-yellow-300', A: 'text-green-400', B: 'text-blue-400', C: 'text-orange-400', D: 'text-red-500' }
  return map[grade] || 'text-gray-400'
}
