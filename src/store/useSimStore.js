import { create } from 'zustand'
import { LOOP_TYPES } from '../constants/loopTypes.js'
import { createPidState } from '../engine/pidController.js'
import { createProcessState } from '../engine/processModel.js'
import { createScoreState } from '../engine/scorer.js'
import { RingBuffer } from '../utils/ringBuffer.js'

let nextId = 1

function createLoop(typeKey, name, simSpeed = 60) {
  const loopType = LOOP_TYPES[typeKey]
  const id = `loop_${nextId++}`
  return {
    id,
    typeKey,
    name: name || `${loopType.shortName} ${id}`,
    setpoint: loopType.setpoint,
    kp: loopType.defaultKp,
    ki: loopType.defaultKi,
    kd: loopType.defaultKd,
    isRunning: false,
    simTime: 0,
    pidState: createPidState(),
    processState: createProcessState(loopType, simSpeed),
    scoreState: createScoreState(),
    history: new RingBuffer(1200),
    currentPV: loopType.initialPV,
    currentOutput: loopType.initialOutput,
    currentError: 0,
    health: 'red',
    divergeCount: 0,
    lastError: null,
    analysis: null,
    earnedBadges: [],
    disturbanceActive: false,
  }
}

export const useSimStore = create((set, get) => ({
  loops: {},
  loopOrder: [],
  activeLoopId: null,
  simSpeed: 60,
  noiseEnabled: true,
  globalBadges: {},
  globalScore: 0,
  badgeQueue: [],

  addLoop(typeKey, name) {
    const { simSpeed } = get()
    const loop = createLoop(typeKey, name, simSpeed)
    set(state => ({
      loops: { ...state.loops, [loop.id]: loop },
      loopOrder: [...state.loopOrder, loop.id],
      activeLoopId: state.activeLoopId ?? loop.id,
    }))
    return loop.id
  },

  removeLoop(id) {
    set(state => {
      const newLoops = { ...state.loops }
      delete newLoops[id]
      const newOrder = state.loopOrder.filter(i => i !== id)
      const newActive = state.activeLoopId === id
        ? (newOrder[0] ?? null)
        : state.activeLoopId
      return { loops: newLoops, loopOrder: newOrder, activeLoopId: newActive }
    })
  },

  setActiveLoop(id) {
    set({ activeLoopId: id })
  },

  setLoopParam(id, param, value) {
    set(state => ({
      loops: {
        ...state.loops,
        [id]: { ...state.loops[id], [param]: value },
      },
    }))
  },

  setLoopRunning(id, running) {
    set(state => {
      const loop = state.loops[id]
      if (!loop) return {}
      const updated = { ...loop, isRunning: running }
      if (running && loop.scoreState.startTime === 0) {
        updated.scoreState = { ...loop.scoreState, startTime: loop.simTime }
      }
      return { loops: { ...state.loops, [id]: updated } }
    })
  },

  resetLoop(id) {
    const { simSpeed, loops } = get()
    const loop = loops[id]
    if (!loop) return
    const loopType = LOOP_TYPES[loop.typeKey]
    const fresh = {
      ...loop,
      isRunning: false,
      simTime: 0,
      setpoint: loopType.setpoint,
      pidState: createPidState(),
      processState: createProcessState(loopType, simSpeed),
      scoreState: createScoreState(),
      history: new RingBuffer(1200),
      currentPV: loopType.initialPV,
      currentOutput: loopType.initialOutput,
      currentError: 0,
      health: 'red',
      divergeCount: 0,
      lastError: null,
      analysis: null,
      disturbanceActive: false,
    }
    set(state => ({ loops: { ...state.loops, [id]: fresh } }))
  },

  updateLoopState(id, updates) {
    set(state => ({
      loops: {
        ...state.loops,
        [id]: { ...state.loops[id], ...updates },
      },
    }))
  },

  setSimSpeed(speed) {
    set({ simSpeed: speed })
  },

  toggleNoise() {
    set(state => ({ noiseEnabled: !state.noiseEnabled }))
  },

  earnBadge(badgeId, loopId) {
    set(state => {
      const already = state.globalBadges[badgeId]
      if (already) return {}
      return {
        globalBadges: { ...state.globalBadges, [badgeId]: { earnedAt: Date.now(), loopId } },
        globalScore: state.globalScore + 100,
        badgeQueue: [...state.badgeQueue, badgeId],
      }
    })
  },

  dismissBadge(badgeId) {
    set(state => ({
      badgeQueue: state.badgeQueue.filter(b => b !== badgeId),
    }))
  },

  setAnalysis(loopId, analysis) {
    set(state => ({
      loops: { ...state.loops, [loopId]: { ...state.loops[loopId], analysis } },
    }))
  },

  addGlobalScore(pts) {
    set(state => ({ globalScore: state.globalScore + pts }))
  },

  loadSave(saveData) {
    // Recreate loops from saved data
    nextId = saveData.nextId || nextId
    const restoredLoops = {}
    const { simSpeed = 60 } = saveData
    for (const saved of Object.values(saveData.loops || {})) {
      const loopType = LOOP_TYPES[saved.typeKey]
      if (!loopType) continue
      const loop = createLoop(saved.typeKey, saved.name, simSpeed)
      loop.id = saved.id
      loop.kp = saved.kp
      loop.ki = saved.ki
      loop.kd = saved.kd
      loop.setpoint = saved.setpoint
      restoredLoops[loop.id] = loop
    }
    set({
      loops: restoredLoops,
      loopOrder: saveData.loopOrder || Object.keys(restoredLoops),
      activeLoopId: saveData.activeLoopId || Object.keys(restoredLoops)[0] || null,
      simSpeed: saveData.simSpeed || 60,
      globalBadges: saveData.globalBadges || {},
      globalScore: saveData.globalScore || 0,
    })
  },

  getSaveData() {
    const state = get()
    const loopsToSave = {}
    for (const [id, loop] of Object.entries(state.loops)) {
      loopsToSave[id] = {
        id: loop.id,
        typeKey: loop.typeKey,
        name: loop.name,
        kp: loop.kp,
        ki: loop.ki,
        kd: loop.kd,
        setpoint: loop.setpoint,
      }
    }
    return {
      loops: loopsToSave,
      loopOrder: state.loopOrder,
      activeLoopId: state.activeLoopId,
      simSpeed: state.simSpeed,
      globalBadges: state.globalBadges,
      globalScore: state.globalScore,
      nextId,
      savedAt: Date.now(),
    }
  },
}))
