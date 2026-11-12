import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { M, bookMaterials } from '../materials'
import { Box, Cyl, Halo, Plant, RBox, Screen } from '../primitives'
import { useBusGlow, useBusLight, useDeviceLevel } from '../lightBus'

function Desk() {
  return (
    <group position={[4, 0, 0.6]}>
      <RBox size={[2.5, 0.05, 0.82]} radius={0.02} position={[0, 0.745, 0]} material={M.walnut} />
      {[-1.12, 1.12].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <Box size={[0.05, 0.72, 0.05]} position={[0, 0.36, -0.32]} material={M.metalBlack} />
          <Box size={[0.05, 0.72, 0.05]} position={[0, 0.36, 0.32]} material={M.metalBlack} />
          <Box size={[0.05, 0.05, 0.7]} position={[0, 0.06, 0]} material={M.metalBlack} />
        </group>
      ))}
      <RBox size={[0.9, 0.006, 0.36]} radius={0.003} position={[0, 0.773, 0.18]} material={M.rugInk} cast={false} />
      <RBox size={[0.46, 0.02, 0.15]} radius={0.008} position={[0, 0.785, 0.18]} material={M.metalBlack} cast={false} />
      <RBox size={[0.07, 0.025, 0.11]} radius={0.012} position={[0.36, 0.785, 0.2]} material={M.metalBlack} cast={false} />
      <Cyl r={0.045} h={0.1} position={[-0.75, 0.82, 0.12]} material={M.ceramic} cast={false} />
    </group>
  )
}

function Monitor({ x, rotY, kind }) {
  const level = useDeviceLevel('office', 'monitors')
  return (
    <group position={[x, 0, 0.42]} rotation={[0, rotY, 0]}>
      <RBox size={[0.22, 0.014, 0.16]} radius={0.006} position={[0, 0.777, 0]} material={M.metalBlack} cast={false} />
      <Cyl r={0.018} h={0.32} position={[0, 0.93, -0.02]} material={M.metalBlack} />
      <RBox size={[0.84, 0.5, 0.035]} radius={0.012} position={[0, 1.18, 0]} material={M.metalBlack} />
      <Screen kind={kind} size={[0.8, 0.45]} levelRef={level} intensity={1.15} position={[0, 1.18, 0.019]} />
    </group>
  )
}

function MonitorGlow() {
  const level = useDeviceLevel('office', 'monitors')
  const light = useRef()
  useFrame(() => {
    light.current.intensity = level.current * 1.8
  })
  return <pointLight ref={light} position={[4, 1.2, 0.95]} color="#93C5FD" distance={3} decay={2} />
}

function DeskLamp() {
  const glow = useBusGlow('office', 4)
  const light = useBusLight('office', 2.2)
  return (
    <group position={[5.0, 0.77, 0.4]}>
      <Cyl r={0.08} h={0.02} position={[0, 0.01, 0]} material={M.metalBlack} />
      <Cyl r={0.012} h={0.42} position={[0, 0.21, 0]} rotation={[0, 0, 0.25]} material={M.metalBlack} />
      <Cyl r={0.012} h={0.3} position={[-0.12, 0.47, 0.0]} rotation={[0, 0, -1.1]} material={M.metalBlack} />
      <mesh position={[-0.25, 0.52, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.03, 0.07, 0.1, 24]} />
        <meshStandardMaterial ref={glow} color="#1C2029" toneMapped={false} />
      </mesh>
      <Halo roomId="office" position={[-0.27, 0.47, 0]} scale={0.7} strength={0.7} />
      <pointLight ref={light} position={[-0.27, 0.4, 0.05]} distance={2.5} decay={2} />
    </group>
  )
}

function ErgoChair() {
  const legs = [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2)
  return (
    <group position={[4, 0, 1.55]} rotation={[0, 0.18, 0]}>
      {legs.map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <Box size={[0.03, 0.03, 0.3]} position={[0, 0.07, 0.15]} material={M.metalBlack} cast={false} />
          <mesh position={[0, 0.03, 0.29]} material={M.metalBlack}>
            <sphereGeometry args={[0.03, 12, 12]} />
          </mesh>
        </group>
      ))}
      <Cyl r={0.03} h={0.36} position={[0, 0.26, 0]} material={M.steel} />
      <RBox size={[0.56, 0.09, 0.52]} radius={0.04} position={[0, 0.48, 0]} material={M.fabricCharcoal} />
      <RBox size={[0.52, 0.62, 0.06]} radius={0.05} position={[0, 0.9, 0.28]} rotation={[-0.14, 0, 0]} material={M.rugInk} />
      <RBox size={[0.34, 0.14, 0.06]} radius={0.03} position={[0, 1.3, 0.34]} rotation={[-0.2, 0, 0]} material={M.rugInk} />
      <Box size={[0.03, 0.4, 0.03]} position={[0, 0.65, 0.3]} material={M.metalBlack} cast={false} />
      {[-0.3, 0.3].map((x) => (
        <group key={x}>
          <Box size={[0.03, 0.2, 0.03]} position={[x, 0.6, 0.02]} material={M.metalBlack} cast={false} />
          <RBox size={[0.07, 0.035, 0.28]} radius={0.015} position={[x, 0.71, 0.0]} material={M.metalBlack} />
        </group>
      ))}
    </group>
  )
}

function Bookshelf() {
  const books = useMemo(() => {
    const out = []
    for (let shelf = 0; shelf < 4; shelf++) {
      let z = -0.9
      let i = 0
      while (z < 0.85) {
        const w = 0.04 + ((shelf * 7 + i * 13) % 5) * 0.012
        const h = 0.26 + ((shelf * 3 + i * 11) % 6) * 0.025
        if ((shelf + i) % 7 !== 3) out.push({ y: 0.12 + shelf * 0.46 + h / 2, z: z + w / 2, w, h, m: (shelf * 3 + i) % bookMaterials.length })
        z += w + 0.008
        i++
      }
    }
    return out
  }, [])
  return (
    <group position={[7.62, 0, 2.6]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box key={i} size={[0.36, 0.03, 2.0]} position={[0, 0.1 + i * 0.46, 0]} material={M.oak} />
      ))}
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.36, 1.98, 0.03]} position={[0, 1.0, s * 1.0]} material={M.oak} />
      ))}
      {books.map((b, i) => (
        <Box key={i} size={[0.24, b.h, b.w]} position={[0.02, b.y, b.z]} material={bookMaterials[b.m]} cast={false} />
      ))}
    </group>
  )
}

function LoungeChair() {
  return (
    <group position={[5.9, 0, 4.4]} rotation={[0, -2.3, 0]}>
      <RBox size={[0.8, 0.22, 0.78]} radius={0.08} position={[0, 0.3, 0]} material={M.fabricTerracotta} />
      <RBox size={[0.8, 0.6, 0.16]} radius={0.08} position={[0, 0.62, -0.34]} rotation={[-0.18, 0, 0]} material={M.fabricTerracotta} />
      {[-0.32, 0.32].map((x) =>
        [-0.3, 0.3].map((z) => <Cyl key={`${x}${z}`} r={0.02} h={0.2} position={[x, 0.1, z]} material={M.walnut} cast={false} />),
      )}
    </group>
  )
}

function NeonStrip() {
  const glow = useBusGlow('office', 3, 0.05)
  return (
    <mesh position={[4, 1.18, 0.12]}>
      <boxGeometry args={[2.4, 0.02, 0.02]} />
      <meshStandardMaterial ref={glow} color="#111" toneMapped={false} />
    </mesh>
  )
}

export function Office() {
  return (
    <group>
      <RBox size={[3.2, 0.016, 2.4]} radius={0.006} position={[4, 0.008, 1.5]} material={M.rugInk} cast={false} />
      <Desk />
      <Monitor x={3.55} rotY={0.14} kind="code" />
      <Monitor x={4.45} rotY={-0.14} kind="chart" />
      <MonitorGlow />
      <DeskLamp />
      <NeonStrip />
      <ErgoChair />
      <Bookshelf />
      <LoungeChair />
      <Cyl r={0.26} h={0.04} seg={32} position={[6.9, 0.5, 5.15]} material={M.marble} />
      <Cyl r={0.03} h={0.5} position={[6.9, 0.25, 5.15]} material={M.metalBlack} />
      <Plant position={[1.0, 0, 5.3]} scale={1.1} />
    </group>
  )
}
