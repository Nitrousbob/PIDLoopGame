import { useEffect, useRef } from 'react'
import { useSimStore } from './useSimStore.js'

const KEY_PREFIX = 'pidHelper_save_'
const AUTO_SAVE_SLOT = 0

export function usePersistence() {
  const getSaveData = useSimStore(s => s.getSaveData)
  const loadSave = useSimStore(s => s.loadSave)
  const loopCount = useSimStore(s => s.loopOrder.length)
  const autoSaveRef = useRef(null)

  // Auto-save every 30s
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (loopCount > 0) {
        saveToSlot(AUTO_SAVE_SLOT, getSaveData())
      }
    }, 30000)
    return () => clearInterval(autoSaveRef.current)
  }, [getSaveData, loopCount])

  // Load auto-save on mount
  useEffect(() => {
    const data = loadFromSlot(AUTO_SAVE_SLOT)
    if (data && data.loops && Object.keys(data.loops).length > 0) {
      loadSave(data)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { saveToSlot, loadFromSlot }
}

export function saveToSlot(slot, data) {
  try {
    localStorage.setItem(KEY_PREFIX + slot, JSON.stringify(data))
  } catch (e) {
    console.warn('Save failed', e)
  }
}

export function loadFromSlot(slot) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + slot)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getSlotInfo(slot) {
  const data = loadFromSlot(slot)
  if (!data) return null
  return {
    loopCount: Object.keys(data.loops || {}).length,
    score: data.globalScore || 0,
    savedAt: data.savedAt ? new Date(data.savedAt).toLocaleString() : 'Unknown',
    badgeCount: Object.keys(data.globalBadges || {}).length,
  }
}
