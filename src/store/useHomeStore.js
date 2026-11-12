import { create } from 'zustand'
import { ROOMS, ROOM_MAP, OUTDOOR_TEMP } from '../data/rooms'

const BASE_LOAD_KW = 0.32
const HISTORY_LENGTH = 48

const initialRooms = {
  living: { on: true, brightness: 78, preset: 'warm', temp: 22.4 },
  kitchen: { on: true, brightness: 64, preset: 'daylight', temp: 21.8 },
  bedroom: { on: false, brightness: 40, preset: 'sunset', temp: 21.2 },
  office: { on: true, brightness: 86, preset: 'cyberpunk', temp: 22.9 },
}

for (const room of ROOMS) {
  initialRooms[room.id].devices = Object.fromEntries(room.devices.map((d) => [d.id, d.default]))
}

export function computePower(state) {
  const breakdown = { base: BASE_LOAD_KW, lighting: 0, appliances: 0, climate: 0, security: 0 }
  const perRoom = {}

  for (const room of ROOMS) {
    const rs = state.rooms[room.id]
    const light = rs.on ? room.lightKw * (0.15 + 0.85 * (rs.brightness / 100)) : 0
    const appliances = room.devices.reduce((sum, d) => sum + (rs.devices[d.id] ? d.kw : 0), 0)
    breakdown.lighting += light
    breakdown.appliances += appliances
    perRoom[room.id] = light + appliances
  }

  const { ac, vacuum, cameras, lock } = state.devices
  if (ac) {
    const indoor = ROOMS.reduce((a, r) => a + state.rooms[r.id].temp, 0) / ROOMS.length
    const working = ROOMS.some((r) => hvacEngaged(state, state.rooms[r.id].temp)) || Math.abs(indoor - state.thermostat.target) < 0.3
    const delta = Math.abs(state.thermostat.target - OUTDOOR_TEMP)
    const load = 0.75 + delta * 0.09
    breakdown.climate = !working ? 0.12 : state.thermostat.hvac === 'eco' ? load * 0.55 : load
  }
  if (vacuum) breakdown.appliances += 0.06
  if (cameras) breakdown.security += 0.05
  if (lock) breakdown.security += 0.004

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0)
  return { total, breakdown, perRoom }
}

/** Whether the HVAC is actively driving a room toward the target in the current mode. */
function hvacEngaged(state, temp) {
  const { target, hvac } = state.thermostat
  if (hvac === 'eco') return true
  return hvac === 'cool' ? temp > target : temp < target
}

export function activeDeviceCount(roomState) {
  return (roomState.on ? 1 : 0) + Object.values(roomState.devices).filter(Boolean).length
}

let eventId = 0
const stamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const makeEvent = (text, tone = 'info') => ({ id: ++eventId, time: stamp(), text, tone })

const seedHistory = (kw) =>
  Array.from({ length: HISTORY_LENGTH }, (_, i) => kw * (0.82 + 0.12 * Math.sin(i / 4) + Math.random() * 0.08))

const SCENES = {
  home: (s) => ({
    rooms: mapRooms(s.rooms, (id, r) => ({
      ...r,
      on: true,
      brightness: id === 'bedroom' ? 55 : 80,
      preset: id === 'office' ? 'daylight' : 'warm',
    })),
    devices: { ...s.devices, ac: true, vacuum: false },
  }),
  away: (s) => ({
    rooms: mapRooms(s.rooms, (id, r) => ({
      ...r,
      on: false,
      devices: Object.fromEntries(Object.keys(r.devices).map((k) => [k, k === 'fridge'])),
    })),
    devices: { ...s.devices, lock: true, cameras: true, vacuum: true, ac: false },
  }),
  night: (s) => ({
    isNight: true,
    rooms: mapRooms(s.rooms, (id, r) => ({
      ...r,
      on: id === 'bedroom' || id === 'living',
      brightness: id === 'bedroom' ? 18 : 12,
      preset: id === 'bedroom' ? 'sunset' : 'warm',
      devices: { ...r.devices, ...(r.devices.tv !== undefined && { tv: false }), ...(r.devices.monitors !== undefined && { monitors: false, workstation: false }) },
    })),
    devices: { ...s.devices, lock: true, cameras: true, vacuum: false },
    thermostat: { ...s.thermostat, hvac: 'eco' },
  }),
  cinema: (s) => ({
    isNight: true,
    rooms: mapRooms(s.rooms, (id, r) =>
      id === 'living'
        ? { ...r, on: true, brightness: 22, preset: 'cyberpunk', devices: { ...r.devices, tv: true, speaker: true } }
        : { ...r, on: false },
    ),
    devices: { ...s.devices, vacuum: false },
  }),
}

function mapRooms(rooms, fn) {
  return Object.fromEntries(Object.entries(rooms).map(([id, r]) => [id, fn(id, r)]))
}

const initialThermostat = { target: 22, hvac: 'cool' }
const initialDevices = { lock: true, ac: true, vacuum: false, cameras: true }
const initialPower = computePower({ rooms: initialRooms, thermostat: initialThermostat, devices: initialDevices }).total

export const useHomeStore = create((set, get) => ({
  focus: 'overview',
  hoveredRoom: null,
  isNight: false,
  mode: 'home',
  view: 'floorplan',
  rooms: initialRooms,
  thermostat: initialThermostat,
  devices: initialDevices,
  energyHistory: seedHistory(initialPower),
  energyToday: 18.6,
  events: [
    makeEvent('Front door locked automatically', 'success'),
    makeEvent('Motion detected · Driveway', 'warn'),
    makeEvent('Security system armed', 'info'),
  ],

  setFocus: (focus) => set({ focus }),
  setHoveredRoom: (hoveredRoom) => set({ hoveredRoom }),
  toggleNight: () => set((s) => ({ isNight: !s.isNight })),
  setView: (view) => set({ view }),

  setMode: (mode) =>
    set((s) => {
      const scene = SCENES[mode]?.(s) ?? {}
      return { mode, ...scene, events: [makeEvent(`Scene “${mode[0].toUpperCase() + mode.slice(1)}” activated`), ...s.events].slice(0, 12) }
    }),

  setRoomLight: (roomId, patch) =>
    set((s) => ({ rooms: { ...s.rooms, [roomId]: { ...s.rooms[roomId], ...patch } } })),

  toggleRoomDevice: (roomId, deviceId) =>
    set((s) => {
      const room = s.rooms[roomId]
      return {
        rooms: { ...s.rooms, [roomId]: { ...room, devices: { ...room.devices, [deviceId]: !room.devices[deviceId] } } },
      }
    }),

  setThermostat: (target) =>
    set((s) => ({ thermostat: { ...s.thermostat, target: Math.min(30, Math.max(16, Math.round(target * 2) / 2)) } })),
  setHvac: (hvac) => set((s) => ({ thermostat: { ...s.thermostat, hvac }, devices: { ...s.devices, ac: true } })),

  toggleDevice: (key) =>
    set((s) => {
      const next = !s.devices[key]
      const messages = {
        lock: [next ? 'Front door locked' : 'Front door unlocked', next ? 'success' : 'warn'],
        cameras: [next ? 'Security cameras armed' : 'Security cameras disarmed', next ? 'success' : 'warn'],
        vacuum: [next ? 'Robot vacuum started cleaning' : 'Robot vacuum returned to dock', 'info'],
        ac: [next ? 'Climate control on' : 'Climate control off', 'info'],
      }
      const [text, tone] = messages[key]
      return { devices: { ...s.devices, [key]: next }, events: [makeEvent(text, tone), ...s.events].slice(0, 12) }
    }),

  /** Simulated telemetry: called once per second. */
  tick: () => {
    const s = get()
    const { total } = computePower(s)
    const history = s.energyHistory
    const prev = history[history.length - 1]
    const sample = prev + (total * (0.97 + Math.random() * 0.06) - prev) * 0.55

    const rooms = { ...s.rooms }
    for (const room of ROOMS) {
      const r = rooms[room.id]
      const engaged = s.devices.ac && hvacEngaged(s, r.temp)
      const goal = engaged ? s.thermostat.target : OUTDOOR_TEMP + (room.id === 'office' ? 1.4 : 0.6)
      const rate = engaged ? (s.thermostat.hvac === 'eco' ? 0.03 : 0.06) : 0.02
      const temp = r.temp + (goal - r.temp) * rate + (Math.random() - 0.5) * 0.04
      rooms[room.id] = { ...r, temp: Math.round(temp * 100) / 100 }
    }

    set({
      energyHistory: [...history.slice(-(HISTORY_LENGTH - 1)), sample],
      energyToday: s.energyToday + sample / 3600,
      rooms,
    })
  },
}))

export const selectFocusedRoom = (s) => (s.focus === 'overview' ? null : ROOM_MAP[s.focus])
