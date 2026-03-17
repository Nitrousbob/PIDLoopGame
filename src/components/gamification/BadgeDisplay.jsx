import { useSimStore } from '../../store/useSimStore.js'
import { BADGE_LIST, RARITY_COLORS } from '../../constants/badges.js'

export default function BadgeDisplay() {
  const globalBadges = useSimStore(s => s.globalBadges)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">Badges</h3>
      <div className="grid grid-cols-2 gap-2">
        {BADGE_LIST.map(badge => {
          const earned = globalBadges[badge.id]
          const rarityStyle = RARITY_COLORS[badge.rarity]
          return (
            <div
              key={badge.id}
              className={`rounded-lg p-3 border transition-all ${
                earned
                  ? `border-2 ${rarityStyle} bg-gray-800/80`
                  : 'border-gray-800 bg-gray-900/60 opacity-40 grayscale'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{badge.icon}</span>
                <span className={`text-xs font-bold truncate ${earned ? rarityStyle.split(' ')[0] : 'text-gray-500'}`}>
                  {badge.name}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-tight">{badge.description}</p>
              {earned && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(earned.earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
