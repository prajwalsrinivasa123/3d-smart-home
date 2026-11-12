import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { M } from '../materials'
import { Box, Cyl, Halo, Plant, RBox, Screen } from '../primitives'
import { useBusGlow, useBusLight, useDeviceLevel } from '../lightBus'
import { useHomeStore } from '../../../store/useHomeStore'

function Sectional() {
  return (
    <group>
      {/* Main section facing the TV */}
      <RBox size={[2.75, 0.36, 0.96]} radius={0.08} position={[-3.6, 0.24, -1.95]} material={M.fabricSlate} />
      {/* Chaise running toward the TV wall */}
      <RBox size={[0.96, 0.36, 2.35]} radius={0.08} position={[-5.38, 0.24, -2.62]} material={M.fabricSlate} />
      {/* Seat cushions */}
      <RBox size={[1.3, 0.14, 0.78]} radius={0.06} position={[-4.28, 0.49, -2.02]} material={M.fabricSlateLight} />
      <RBox size={[1.3, 0.14, 0.78]} radius={0.06} position={[-2.94, 0.49, -2.02]} material={M.fabricSlateLight} />
      <RBox size={[0.76, 0.14, 1.95]} radius={0.06} position={[-5.32, 0.49, -2.78]} material={M.fabricSlateLight} />
      {/* Backs */}
      <RBox size={[3.7, 0.52, 0.22]} radius={0.09} position={[-4.0, 0.68, -1.55]} material={M.fabricSlate} />
      <RBox size={[0.22, 0.52, 2.15]} radius={0.09} position={[-5.79, 0.68, -2.7]} material={M.fabricSlate} />
      {/* Arms */}
      <RBox size={[0.22, 0.58, 0.96]} radius={0.09} position={[-2.15, 0.36, -1.95]} material={M.fabricSlate} />
      <RBox size={[0.96, 0.58, 0.22]} radius={0.09} position={[-5.38, 0.36, -3.79]} material={M.fabricSlate} />
      {/* Throw pillows */}
      <RBox size={[0.46, 0.42, 0.14]} radius={0.07} position={[-5.2, 0.72, -1.78]} rotation={[-0.2, 0.6, 0]} material={M.fabricTerracotta} />
      <RBox size={[0.44, 0.4, 0.13]} radius={0.07} position={[-2.55, 0.72, -1.78]} rotation={[-0.25, -0.3, 0]} material={M.fabricCream} />
      <RBox size={[0.13, 0.4, 0.44]} radius={0.07} position={[-5.6, 0.72, -3.3]} rotation={[0, 0, 0.2]} material={M.fabricCream} />
      {/* Legs */}
      {[
        [-4.9, -1.55],
        [-2.3, -1.55],
        [-2.3, -2.35],
        [-5.78, -3.72],
        [-5.0, -3.72],
      ].map(([x, z], i) => (
        <Cyl key={i} r={0.03} h={0.08} position={[x, 0.04, z]} material={M.metalBlack} cast={false} />
      ))}
    </group>
  )
}

function CoffeeTable() {
  return (
    <group position={[-3.75, 0, -3.15]}>
      <Cyl r={0.58} h={0.06} seg={48} position={[0, 0.4, 0]} material={M.marble} />
      <Cyl rTop={0.12} rBottom={0.3} h={0.37} position={[0, 0.185, 0]} material={M.metalBlack} />
      <Cyl r={0.36} h={0.05} seg={40} position={[0.72, 0.28, 0.25]} material={M.walnut} />
      <Cyl r={0.05} h={0.26} position={[0.72, 0.13, 0.25]} material={M.metalBlack} />
      <RBox size={[0.32, 0.05, 0.24]} radius={0.01} position={[-0.15, 0.455, 0.1]} rotation={[0, 0.3, 0]} material={M.fabricTerracotta} />
      <RBox size={[0.3, 0.04, 0.22]} radius={0.01} position={[-0.13, 0.5, 0.09]} rotation={[0, 0.15, 0]} material={M.fabricCream} />
      <Cyl rTop={0.05} rBottom={0.08} h={0.24} position={[0.2, 0.55, -0.15]} material={M.ceramic} />
    </group>
  )
}

function MediaWall() {
  const tv = useDeviceLevel('living', 'tv')
  const glow = useRef()
  useFrame(() => {
    glow.current.intensity = tv.current * 3.2
  })
  return (
    <group>
      <RBox size={[3.1, 0.38, 0.44]} radius={0.04} position={[-4.2, 0.42, -5.66]} material={M.walnut} />
      <Box size={[3.0, 0.015, 0.02]} position={[-4.2, 0.42, -5.435]} material={M.metalBlack} cast={false} />
      <RBox size={[2.62, 1.5, 0.06]} radius={0.02} position={[-4.2, 1.62, -5.86]} material={M.metalBlack} />
      <Screen kind="tv" size={[2.52, 1.4]} levelRef={tv} intensity={1.25} position={[-4.2, 1.62, -5.825]} />
      <RBox size={[1.1, 0.08, 0.14]} radius={0.03} position={[-4.2, 0.65, -5.6]} material={M.metalBlack} />
      <pointLight ref={glow} position={[-4.2, 1.6, -4.9]} color="#A78BFA" distance={5} decay={2} />
    </group>
  )
}

function FloorLamp() {
  const glow = useBusGlow('living', 3.5)
  const light = useBusLight('living', 4)
  return (
    <group position={[-1.65, 0, -1.55]}>
      <Cyl r={0.2} h={0.04} position={[0, 0.02, 0]} material={M.metalBlack} />
      <Cyl r={0.018} h={1.55} position={[0, 0.8, 0]} material={M.brass} />
      <mesh position={[0, 1.68, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.34, 32, 1, true]} />
        <meshStandardMaterial ref={glow} color="#F5EBDD" side={THREE.DoubleSide} roughness={0.9} toneMapped={false} />
      </mesh>
      <Halo roomId="living" position={[0, 1.66, 0]} scale={1.6} />
      <pointLight ref={light} position={[0, 1.55, 0]} distance={5} decay={2} />
    </group>
  )
}

const VACUUM_PATH = new THREE.CatmullRomCurve3(
  [
    [-0.9, -5.2],
    [-2.6, -4.6],
    [-4.6, -4.45],
    [-3.2, -4.0],
    [-1.4, -3.6],
    [-1.0, -2.3],
    [-1.1, -0.7],
    [-0.6, -2.8],
  ].map(([x, z]) => new THREE.Vector3(x, 0, z)),
  true,
)
const DOCK = new THREE.Vector3(-0.9, 0, -5.55)

function RobotVacuum() {
  const group = useRef()
  const led = useRef()
  const t = useRef(0)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, dt) => {
    const cleaning = useHomeStore.getState().devices.vacuum
    const g = group.current
    if (cleaning) {
      t.current = (t.current + dt * 0.035) % 1
      VACUUM_PATH.getPointAt(t.current, tmp)
      g.position.lerp(tmp, 1 - Math.exp(-dt * 6))
      const tangent = VACUUM_PATH.getTangentAt(t.current)
      g.rotation.y = Math.atan2(tangent.x, tangent.z)
    } else {
      g.position.lerp(DOCK, 1 - Math.exp(-dt * 1.5))
      g.rotation.y += (Math.PI - g.rotation.y) * (1 - Math.exp(-dt * 2))
    }
    led.current.emissiveIntensity = cleaning ? 2 + Math.sin(state.clock.elapsedTime * 6) * 1.2 : 0.6
  })
  return (
    <group>
      <RBox size={[0.5, 0.3, 0.12]} radius={0.03} position={[-0.9, 0.15, -5.85]} material={M.plasticWhite} />
      <group ref={group} position={DOCK.toArray()}>
        <Cyl r={0.17} h={0.07} seg={32} position={[0, 0.045, 0]} material={M.plasticWhite} cast={false} />
        <Cyl r={0.06} h={0.02} position={[0, 0.09, 0.03]} material={M.metalBlack} cast={false} />
        <mesh position={[0, 0.082, -0.1]}>
          <boxGeometry args={[0.08, 0.01, 0.02]} />
          <meshStandardMaterial ref={led} color="#0f172a" emissive="#22D3EE" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

export function LivingRoom() {
  return (
    <group>
      <RBox size={[3.9, 0.016, 2.9]} radius={0.006} position={[-3.95, 0.008, -2.75]} material={M.rugSand} cast={false} />
      <Sectional />
      <CoffeeTable />
      <MediaWall />
      <FloorLamp />
      <Plant position={[-7.45, 0, -5.45]} scale={1.15} />
      <Plant position={[-0.55, 0, -0.6]} scale={0.8} />
      <RobotVacuum />
    </group>
  )
}
