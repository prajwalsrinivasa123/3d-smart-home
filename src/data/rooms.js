import { Armchair, BedDouble, ChefHat, LayoutGrid, MonitorSmartphone } from 'lucide-react'

export const LIGHT_PRESETS = {
  warm: { id: 'warm', label: 'Warm', color: '#FFB347', kelvin: '2700K' },
  daylight: { id: 'daylight', label: 'Daylight', color: '#E0F2FE', kelvin: '5600K' },
  sunset: { id: 'sunset', label: 'Sunset', color: '#FF7A59', kelvin: '2200K' },
  cyberpunk: { id: 'cyberpunk', label: 'Cyberpunk', color: '#818CF8', kelvin: 'RGB' },
}

/**
 * Floor plan (meters). The house spans x ∈ [-8, 8], z ∈ [-6, 6].
 * Back (−z) and left (−x) exterior walls are full height; front and right are cut away.
 */
export const ROOMS = [
  {
    id: 'living',
    name: 'Living Room',
    short: 'Living',
    icon: Armchair,
    bounds: { x: [-8, 0], z: [-6, 0] },
    lightKw: 0.12,
    devices: [
      { id: 'tv', label: 'OLED TV', kw: 0.18, default: true },
      { id: 'speaker', label: 'Soundbar', kw: 0.05, default: true },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen & Dining',
    short: 'Kitchen',
    icon: ChefHat,
    bounds: { x: [0, 8], z: [-6, 0] },
    lightKw: 0.14,
    devices: [
      { id: 'fridge', label: 'Fridge', kw: 0.15, default: true },
      { id: 'oven', label: 'Oven', kw: 1.6, default: false },
    ],
  },
  {
    id: 'bedroom',
    name: 'Master Bedroom',
    short: 'Bedroom',
    icon: BedDouble,
    bounds: { x: [-8, 0], z: [0, 6] },
    lightKw: 0.08,
    devices: [
      { id: 'purifier', label: 'Air Purifier', kw: 0.04, default: true },
      { id: 'blinds', label: 'Smart Blinds', kw: 0.01, default: false },
    ],
  },
  {
    id: 'office',
    name: 'Home Office',
    short: 'Office',
    icon: MonitorSmartphone,
    bounds: { x: [0, 8], z: [0, 6] },
    lightKw: 0.09,
    devices: [
      { id: 'workstation', label: 'Workstation', kw: 0.32, default: true },
      { id: 'monitors', label: 'Dual Monitors', kw: 0.08, default: true },
    ],
  },
]

export const ROOM_MAP = Object.fromEntries(ROOMS.map((r) => [r.id, r]))

export const OVERVIEW = { id: 'overview', name: 'Overview', short: 'Overview', icon: LayoutGrid }

export function roomCenter(room) {
  return [(room.bounds.x[0] + room.bounds.x[1]) / 2, (room.bounds.z[0] + room.bounds.z[1]) / 2]
}

export const HOME_MODES = [
  { id: 'home', label: 'Home' },
  { id: 'away', label: 'Away' },
  { id: 'night', label: 'Night' },
  { id: 'cinema', label: 'Cinema' },
]

export const HVAC_MODES = {
  cool: { id: 'cool', label: 'Cool', color: '#38BDF8', glow: '#0EA5E9' },
  heat: { id: 'heat', label: 'Heat', color: '#FB923C', glow: '#F97316' },
  eco: { id: 'eco', label: 'Eco', color: '#34D399', glow: '#10B981' },
}

export const OUTDOOR_TEMP = 21
