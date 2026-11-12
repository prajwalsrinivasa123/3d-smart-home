import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { M } from '../materials'
import { Box, Cyl, Halo, RBox } from '../primitives'
import { useBusGlow, useBusLight, useDeviceLevel } from '../lightBus'

const BACK = -5.9

function LedStrip({ x, width }) {
  const glow = useBusGlow('kitchen', 2.4, 0)
  return (
    <mesh position={[x, 1.695, BACK + 0.3]}>
      <boxGeometry args={[width, 0.012, 0.03]} />
      <meshStandardMaterial ref={glow} color="#111" toneMapped={false} />
    </mesh>
  )
}

function CabinetRun() {
  const oven = useDeviceLevel('kitchen', 'oven', 2)
  const ovenMat = useRef()
  const hob = useRef()
  const ovenLight = useRef()
  useFrame(() => {
    ovenMat.current.emissiveIntensity = oven.current * 2.2
    hob.current.emissiveIntensity = oven.current * 1.6
    ovenLight.current.intensity = oven.current * 2.5
  })

  const doorXs = [1.2, 2.4, 3.0, 3.6, 4.8, 5.4, 6.0]
  return (
    <group>
      <Box size={[6.0, 0.06, 0.56]} position={[3.6, 0.03, BACK + 0.3]} material={M.metalBlack} cast={false} />
      <RBox size={[6.0, 0.82, 0.62]} radius={0.015} position={[3.6, 0.47, BACK + 0.31]} material={M.cabinetNavy} />
      <RBox size={[6.08, 0.05, 0.68]} radius={0.015} position={[3.6, 0.905, BACK + 0.34]} material={M.marble} />
      {doorXs.map((x) => (
        <Box key={x} size={[0.01, 0.76, 0.01]} position={[x, 0.47, BACK + 0.625]} material={M.metalBlack} cast={false} />
      ))}
      {[1.5, 2.7, 3.3, 4.5, 5.1, 5.7, 6.3].map((x) => (
        <Box key={x} size={[0.22, 0.018, 0.025]} position={[x, 0.8, BACK + 0.64]} material={M.brass} cast={false} />
      ))}

      {/* Built-in oven + induction hob */}
      <RBox size={[0.62, 0.5, 0.02]} radius={0.008} position={[1.6, 0.48, BACK + 0.63]} cast={false}>
        <meshStandardMaterial ref={ovenMat} color="#07090D" emissive="#FF7A1A" roughness={0.1} metalness={0.5} toneMapped={false} />
      </RBox>
      <Box size={[0.5, 0.02, 0.02]} position={[1.6, 0.78, BACK + 0.65]} material={M.steel} cast={false} />
      <pointLight ref={ovenLight} position={[1.6, 0.5, BACK + 1.0]} color="#FF8A3D" distance={2.5} decay={2} />
      <mesh position={[1.6, 0.935, BACK + 0.34]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.72, 0.5]} />
        <meshStandardMaterial ref={hob} color="#07090D" emissive="#FF3D00" emissiveMap={hobTexture()} roughness={0.08} metalness={0.4} toneMapped={false} />
      </mesh>

      {/* Sink + faucet under the window */}
      <RBox size={[0.7, 0.02, 0.42]} radius={0.008} position={[4.3, 0.932, BACK + 0.36]} material={M.blackGlass} cast={false} />
      <Cyl r={0.022} h={0.34} position={[4.3, 1.1, BACK + 0.14]} material={M.steel} />
      <Cyl r={0.018} h={0.22} position={[4.3, 1.26, BACK + 0.24]} rotation={[Math.PI / 2, 0, 0]} material={M.steel} />

      {/* Upper cabinets with under-cabinet LED strip */}
      <RBox size={[2.3, 0.8, 0.36]} radius={0.015} position={[1.75, 2.1, BACK + 0.18]} material={M.cabinetNavy} />
      <RBox size={[0.7, 0.8, 0.36]} radius={0.015} position={[6.2, 2.1, BACK + 0.18]} material={M.cabinetNavy} />
      <LedStrip x={1.75} width={2.24} />
      <LedStrip x={6.2} width={0.64} />
      <Shelf />
    </group>
  )
}

let hobTex
function hobTexture() {
  if (hobTex) return hobTex
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 180
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 256, 180)
  ctx.strokeStyle = '#fff'
  for (const [x, y, r] of [
    [70, 60, 36],
    [180, 60, 28],
    [70, 130, 28],
    [180, 125, 36],
  ]) {
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  hobTex = new THREE.CanvasTexture(c)
  return hobTex
}

function Shelf() {
  return (
    <group>
      <Box size={[0.7, 0.03, 0.26]} position={[6.2, 1.55, BACK + 0.13]} material={M.oak} cast={false} />
      <Cyl rTop={0.06} rBottom={0.07} h={0.16} position={[6.0, 1.645, BACK + 0.13]} material={M.ceramic} cast={false} />
      <Cyl r={0.05} h={0.22} position={[6.35, 1.675, BACK + 0.13]} material={M.fabricSage} cast={false} />
    </group>
  )
}

function Fridge() {
  return (
    <group position={[7.3, 0, -5.45]}>
      <RBox size={[0.92, 2.1, 0.8]} radius={0.04} position={[0, 1.05, 0]} material={M.steel} />
      <Box size={[0.92, 0.012, 0.012]} position={[0, 1.38, 0.405]} material={M.metalBlack} cast={false} />
      <Box size={[0.012, 0.6, 0.012]} position={[0, 1.72, 0.405]} material={M.metalBlack} cast={false} />
      <Cyl r={0.014} h={0.5} position={[-0.06, 1.72, 0.44]} material={M.metalBlack} />
      <Cyl r={0.014} h={0.5} position={[0.06, 1.72, 0.44]} material={M.metalBlack} />
      <Cyl r={0.014} h={0.6} position={[-0.3, 0.95, 0.44]} material={M.metalBlack} />
      <mesh position={[0.25, 1.68, 0.408]}>
        <planeGeometry args={[0.14, 0.18]} />
        <meshStandardMaterial color="#0b1020" emissive="#22D3EE" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Stool({ position }) {
  return (
    <group position={position}>
      <Cyl r={0.2} h={0.06} seg={32} position={[0, 0.7, 0]} material={M.oak} />
      <Cyl r={0.025} h={0.66} position={[0, 0.35, 0]} material={M.metalBlack} />
      <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.metalBlack}>
        <torusGeometry args={[0.15, 0.012, 8, 32]} />
      </mesh>
      <Cyl r={0.17} h={0.025} position={[0, 0.0125, 0]} material={M.metalBlack} cast={false} />
    </group>
  )
}

function Island() {
  return (
    <group position={[3.3, 0, -2.75]}>
      <RBox size={[2.6, 0.86, 0.95]} radius={0.02} position={[0, 0.45, 0]} material={M.cabinetNavy} />
      <RBox size={[2.9, 0.06, 1.12]} radius={0.02} position={[0, 0.92, 0]} material={M.marble} />
      <RBox size={[0.06, 0.9, 1.12]} radius={0.02} position={[-1.42, 0.45, 0]} material={M.marble} />
      <RBox size={[0.06, 0.9, 1.12]} radius={0.02} position={[1.42, 0.45, 0]} material={M.marble} />
      <Cyl rTop={0.2} rBottom={0.12} h={0.12} position={[0.6, 1.01, -0.1]} material={M.walnut} />
      <mesh position={[0.6, 1.08, -0.1]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#F97316" roughness={0.6} />
      </mesh>
      <mesh position={[0.68, 1.07, -0.04]} castShadow>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#A3E635" roughness={0.6} />
      </mesh>
      {[-0.85, 0, 0.85].map((x) => (
        <Stool key={x} position={[x, 0, 0.85]} />
      ))}
    </group>
  )
}

function Pendant({ position, wide = false }) {
  const glow = useBusGlow('kitchen', 5, 0.02)
  return (
    <group position={position}>
      <Cyl r={0.006} h={3 - position[1]} position={[0, (3 - position[1]) / 2, 0]} material={M.metalBlack} cast={false} />
      <mesh castShadow material={M.metalBlack}>
        <cylinderGeometry args={[0.035, wide ? 0.3 : 0.16, wide ? 0.18 : 0.22, 32, 1, true]} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <sphereGeometry args={[wide ? 0.08 : 0.055, 16, 16]} />
        <meshStandardMaterial ref={glow} color="#fff" toneMapped={false} />
      </mesh>
      <Halo roomId="kitchen" position={[0, -0.12, 0]} scale={wide ? 1.4 : 0.95} strength={0.75} />
    </group>
  )
}

function Chair({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RBox size={[0.46, 0.05, 0.44]} radius={0.02} position={[0, 0.46, 0]} material={M.oak} />
      <RBox size={[0.44, 0.38, 0.04]} radius={0.018} position={[0, 0.72, -0.21]} rotation={[-0.08, 0, 0]} material={M.oak} />
      {[
        [-0.19, -0.18],
        [0.19, -0.18],
        [-0.19, 0.18],
        [0.19, 0.18],
      ].map(([x, z], i) => (
        <Cyl key={i} r={0.018} h={0.45} position={[x, 0.225, z]} material={M.metalBlack} cast={false} />
      ))}
    </group>
  )
}

function Dining() {
  return (
    <group position={[6.4, 0, -1.55]}>
      <Cyl r={0.68} h={0.045} seg={48} position={[0, 0.75, 0]} material={M.oak} />
      <Cyl rTop={0.06} rBottom={0.06} h={0.72} position={[0, 0.37, 0]} material={M.metalBlack} />
      <Cyl r={0.3} h={0.03} position={[0, 0.015, 0]} material={M.metalBlack} cast={false} />
      <Cyl rTop={0.05} rBottom={0.08} h={0.2} position={[0.1, 0.87, 0.05]} material={M.ceramic} />
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => (
        <Chair key={a} position={[Math.sin(a) * 0.85, 0, Math.cos(a) * 0.85]} rotation={a + Math.PI} />
      ))}
    </group>
  )
}

export function Kitchen() {
  const light = useBusLight('kitchen', 5)
  return (
    <group>
      <CabinetRun />
      <Fridge />
      <Island />
      <Dining />
      {[2.5, 3.3, 4.1].map((x) => (
        <Pendant key={x} position={[x, 2.15, -2.75]} />
      ))}
      <Pendant position={[6.4, 2.05, -1.55]} wide />
      <pointLight ref={light} position={[3.3, 1.85, -2.75]} distance={6} decay={2} />
    </group>
  )
}
