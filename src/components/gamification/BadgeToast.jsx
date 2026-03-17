import { useEffect } from 'react'
import { useSimStore } from '../../store/useSimStore.js'
import { BADGES, RARITY_COLORS } from '../../constants/badges.js'

export default function BadgeToast() {
  const badgeQueue = useSimStore(s => s.badgeQueue)
  const dismissBadge = useSimStore(s => s.dismissBadge)

  const current = badgeQueue[0]

  useEffect(() => {
    if (!current) return
    const timer = setTimeout(() => dismissBadge(current), 4000)
    return () => clearTimeout(timer)
  }, [current, dismissBadge])

  if (!current) return null

  const badge = BADGES[current]
  if (!badge) return null

  const rarityStyle = RARITY_COLORS[badge.rarity] || RARITY_COLORS.common

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`badge-pop bg-gray-900 border-2 ${rarityStyle} rounded-2xl p-4 shadow-2xl flex items-center gap-3 max-w-xs`}>
        <div className="text-4xl flex-shrink-0">{badge.icon}</div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Badge Unlocked!</div>
          <div className={`font-bold text-sm ${rarityStyle.split(' ')[0]}`}>{badge.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{badge.description}</div>
        </div>
        <button
          onClick={() => dismissBadge(current)}
          className="absolute top-2 right-2 text-gray-500 hover:text-white text-sm"
        >×</button>
      </div>
    </div>
  )
}
