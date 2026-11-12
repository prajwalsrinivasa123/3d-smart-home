import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ROOMS, LIGHT_PRESETS } from '../../data/rooms'
import { useHomeStore } from '../../store/useHomeStore'

/**
 * Mutable per-frame animation state shared between the light controller and every fixture.
 * Kept outside React so dozens of fixtures can animate at 60fps without re-rendering.
 */
export const lightBus = Object.fromEntries(
  ROOMS.map((r) => [r.id, { level: 0, color: new THREE.Color(LIGHT_PRESETS.warm.color) }]),
)
export const envBus = { night: 0 }

const tmpColor = new THREE.Color()

/** Smoothly eases each room's level and color toward the store values. */
export function LightBusController() {
  useFrame((_, dt) => {
    const { rooms, isNight } = useHomeStore.getState()
    const k = 1 - Math.exp(-dt * 4)
    for (const id in lightBus) {
      const room = rooms[id]
      const bus = lightBus[id]
      const target = room.on ? room.brightness / 100 : 0
      bus.level += (target - bus.level) * k
      bus.color.lerp(tmpColor.set(LIGHT_PRESETS[room.preset].color), k)
    }
    envBus.night += ((isNight ? 1 : 0) - envBus.night) * (1 - Math.exp(-dt * 1.8))
  })
  return null
}

/** Ref for a light whose intensity/color follow a room's bus. */
export function useBusLight(roomId, max) {
  const ref = useRef()
  useFrame(() => {
    const light = ref.current
    if (!light) return
    const bus = lightBus[roomId]
    light.intensity = bus.level * max
    light.color.copy(bus.color)
  })
  return ref
}

/** Ref for a material whose emissive glow follows a room's bus. */
export function useBusGlow(roomId, max = 3, base = 0.02) {
  const ref = useRef()
  useFrame(() => {
    const mat = ref.current
    if (!mat) return
    const bus = lightBus[roomId]
    mat.emissive.copy(bus.color)
    mat.emissiveIntensity = base + bus.level * max
  })
  return ref
}

/** Eased 0..1 value for a boolean room device (TV, oven, monitors…). */
export function useDeviceLevel(roomId, deviceId, speed = 3) {
  const level = useRef(0)
  useFrame((_, dt) => {
    const on = useHomeStore.getState().rooms[roomId].devices[deviceId]
    level.current += ((on ? 1 : 0) - level.current) * (1 - Math.exp(-dt * speed))
  })
  return level
}
