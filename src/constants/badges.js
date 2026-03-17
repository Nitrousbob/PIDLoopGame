export const BADGES = {
  NO_OVERSHOOT: {
    id: 'NO_OVERSHOOT',
    name: 'No Overshoot',
    icon: '🎯',
    description: 'Reached setpoint without going past it by more than 5%.',
    rarity: 'uncommon',
  },
  SMOOTH_OPERATOR: {
    id: 'SMOOTH_OPERATOR',
    name: 'Smooth Operator',
    icon: '🌊',
    description: 'Achieved a Smoothness score of 90 or higher.',
    rarity: 'uncommon',
  },
  SPEED_DEMON: {
    id: 'SPEED_DEMON',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Settled at setpoint in under 1.5× the system time constant.',
    rarity: 'rare',
  },
  STEADY_STATE_MASTER: {
    id: 'STEADY_STATE_MASTER',
    name: 'Steady State Master',
    icon: '✅',
    description: 'Held the setpoint within tolerance for 95% of the last 60 seconds.',
    rarity: 'common',
  },
  INTEGRAL_TAMER: {
    id: 'INTEGRAL_TAMER',
    name: 'Integral Tamer',
    icon: '🛡️',
    description: 'Ran for 120 simulated seconds with zero integral windup events.',
    rarity: 'uncommon',
  },
  DISTURBANCE_REJECTOR: {
    id: 'DISTURBANCE_REJECTOR',
    name: 'Disturbance Rejector',
    icon: '☂️',
    description: 'Recovered from a load disturbance within 2× the time constant.',
    rarity: 'rare',
  },
  PERFECT_TUNE: {
    id: 'PERFECT_TUNE',
    name: 'Perfect Tune',
    icon: '⭐',
    description: 'Achieved an S grade (95+ overall score) on any loop.',
    rarity: 'legendary',
  },
  MULTI_LOOP_MASTER: {
    id: 'MULTI_LOOP_MASTER',
    name: 'Multi-Loop Master',
    icon: '🔗',
    description: 'Had 3 or more loops running green simultaneously.',
    rarity: 'rare',
  },
  COLD_START_PRO: {
    id: 'COLD_START_PRO',
    name: 'Cold Start Pro',
    icon: '🚀',
    description: 'Brought any loop from its initial value to setpoint with an A grade or better.',
    rarity: 'uncommon',
  },
  PRESSURE_PRO: {
    id: 'PRESSURE_PRO',
    name: 'Pressure Pro',
    icon: '💪',
    description: 'Achieved an S or A grade on a pressure loop.',
    rarity: 'rare',
  },
}

export const BADGE_LIST = Object.values(BADGES)

export const RARITY_COLORS = {
  common: 'text-gray-300 border-gray-600',
  uncommon: 'text-green-400 border-green-700',
  rare: 'text-blue-400 border-blue-700',
  legendary: 'text-yellow-300 border-yellow-600',
}
