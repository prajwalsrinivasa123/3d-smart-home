import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { M } from './materials'
import { lightBus } from './lightBus'

/** Beveled box. `size` is [w, h, d]; radius is clamped so thin panels still bevel cleanly. */
export function RBox({ size, radius = 0.04, material, cast = true, receive = true, ...props }) {
  const r = Math.min(radius, Math.min(...size) / 2 - 0.002)
  return (
    <RoundedBox
      args={size}
      radius={Math.max(r, 0.001)}
      smoothness={3}
      material={material}
      castShadow={cast}
      receiveShadow={receive}
      {...props}
    />
  )
}

export function Box({ size, material, cast = true, receive = true, ...props }) {
  return (
    <mesh material={material} castShadow={cast} receiveShadow={receive} {...props}>
      <boxGeometry args={size} />
    </mesh>
  )
}

export function Cyl({ r = 0.1, rTop, rBottom, h = 1, seg = 24, material, cast = true, receive = true, open = false, ...props }) {
  return (
    <mesh material={material} castShadow={cast} receiveShadow={receive} {...props}>
      <cylinderGeometry args={[rTop ?? r, rBottom ?? r, h, seg, 1, open]} />
    </mesh>
  )
}

let haloTexture
function getHaloTexture() {
  if (haloTexture) return haloTexture
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  haloTexture = new THREE.CanvasTexture(canvas)
  haloTexture.colorSpace = THREE.SRGBColorSpace
  return haloTexture
}

/** Additive sprite that fakes bloom around a light fixture; follows the room's light bus. */
export function Halo({ roomId, scale = 1, strength = 0.9, ...props }) {
  const mat = useRef()
  const texture = useMemo(getHaloTexture, [])
  useFrame(() => {
    const bus = lightBus[roomId]
    mat.current.color.copy(bus.color)
    mat.current.opacity = bus.level * strength
  })
  return (
    <sprite scale={[scale, scale, 1]} {...props}>
      <spriteMaterial
        ref={mat}
        map={texture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  )
}

const screenCache = new Map()

/** Procedural screen content so displays glow with believable UI without loading images. */
export function useScreenTexture(kind) {
  return useMemo(() => {
    if (screenCache.has(kind)) return screenCache.get(kind)
    const w = 512
    const h = 288
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    if (kind === 'tv') {
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#1E1B4B')
      sky.addColorStop(0.45, '#7C3AED')
      sky.addColorStop(0.75, '#F97316')
      sky.addColorStop(1, '#FBBF24')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(255,236,179,0.95)'
      ctx.beginPath()
      ctx.arc(w * 0.62, h * 0.66, 42, 0, Math.PI * 2)
      ctx.fill()
      const ridges = [
        ['#3B0764', 0.72, 60],
        ['#1E1035', 0.82, 40],
        ['#0B0718', 0.92, 26],
      ]
      for (const [color, base, amp] of ridges) {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 16) {
          ctx.lineTo(x, h * base - Math.abs(Math.sin(x * 0.013 + amp)) * amp - Math.sin(x * 0.041) * 8)
        }
        ctx.lineTo(w, h)
        ctx.fill()
      }
    } else {
      ctx.fillStyle = '#0B1020'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#111833'
      ctx.fillRect(0, 0, 96, h)
      ctx.fillStyle = '#161F3D'
      ctx.fillRect(0, 0, w, 22)
      if (kind === 'code') {
        const palette = ['#818CF8', '#22D3EE', '#F472B6', '#A3E635', '#E2E8F0', '#FBBF24']
        for (let i = 0; i < 18; i++) {
          let x = 112 + (i % 5 === 0 ? 0 : 18 * ((i * 7) % 3))
          const y = 38 + i * 13.5
          for (let j = 0; j < 4; j++) {
            const len = 18 + ((i * 31 + j * 17) % 70)
            ctx.fillStyle = palette[(i + j * 2) % palette.length]
            ctx.globalAlpha = 0.9
            ctx.fillRect(x, y, len, 6)
            x += len + 8
          }
        }
        ctx.globalAlpha = 1
      } else {
        ctx.strokeStyle = '#22D3EE'
        ctx.lineWidth = 4
        ctx.beginPath()
        for (let x = 0; x < 380; x += 10) {
          const y = 170 - Math.sin(x / 38) * 40 - x * 0.18
          x === 0 ? ctx.moveTo(116 + x, y) : ctx.lineTo(116 + x, y)
        }
        ctx.stroke()
        const bars = [60, 90, 70, 120, 100, 140, 115]
        bars.forEach((b, i) => {
          ctx.fillStyle = i % 2 ? '#818CF8' : '#6366F1'
          ctx.fillRect(122 + i * 52, h - 16 - b * 0.55, 30, b * 0.55)
        })
        ctx.fillStyle = '#F472B6'
        ctx.fillRect(116, 36, 120, 26)
      }
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i === 1 ? '#818CF8' : '#334155'
        ctx.fillRect(14, 40 + i * 26, 66, 10)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    screenCache.set(kind, texture)
    return texture
  }, [kind])
}

/** Emissive display panel that fades with the device's on/off level. */
export function Screen({ kind, size, levelRef, intensity = 1.4, ...props }) {
  const texture = useScreenTexture(kind)
  const mat = useRef()
  useFrame(() => {
    mat.current.emissiveIntensity = levelRef.current * intensity
  })
  return (
    <mesh {...props}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        ref={mat}
        color="#05070B"
        emissive="#ffffff"
        emissiveMap={texture}
        roughness={0.15}
        metalness={0.3}
        toneMapped={false}
      />
    </mesh>
  )
}

export function Plant({ scale = 1, ...props }) {
  return (
    <group scale={scale} {...props}>
      <Cyl rTop={0.2} rBottom={0.15} h={0.42} position={[0, 0.21, 0]} material={M.pot} />
      <Cyl r={0.18} h={0.02} position={[0, 0.41, 0]} material={M.walnut} cast={false} />
      {[
        [0, 0.85, 0, 0.26],
        [0.13, 0.7, 0.06, 0.2],
        [-0.12, 0.74, -0.05, 0.21],
        [0.03, 1.08, -0.04, 0.18],
        [-0.05, 0.62, 0.12, 0.17],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={i % 2 ? M.leafDark : M.leaf} castShadow>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
    </group>
  )
}
