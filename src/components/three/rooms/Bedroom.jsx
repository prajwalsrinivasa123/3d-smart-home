import * as THREE from 'three'
import { M } from '../materials'
import { Box, Cyl, Halo, Plant, RBox } from '../primitives'
import { useBusGlow, useBusLight } from '../lightBus'

function Bed() {
  return (
    <group position={[-4, 0, 0]}>
      <RBox size={[2.3, 1.1, 0.16]} radius={0.06} position={[0, 0.6, 0.22]} material={M.fabricCharcoal} />
      {[-0.75, -0.25, 0.25, 0.75].map((x) => (
        <Box key={x} size={[0.01, 0.9, 0.01]} position={[x, 0.62, 0.305]} material={M.rugInk} cast={false} />
      ))}
      <RBox size={[2.12, 0.3, 2.3]} radius={0.06} position={[0, 0.2, 1.45]} material={M.fabricCharcoal} />
      <RBox size={[1.98, 0.22, 2.14]} radius={0.08} position={[0, 0.46, 1.48]} material={M.linen} />
      <RBox size={[2.04, 0.08, 1.5]} radius={0.04} position={[0, 0.6, 1.83]} material={M.fabricDusk} />
      <RBox size={[2.06, 0.06, 0.42]} radius={0.03} position={[0, 0.66, 2.3]} material={M.fabricTerracotta} />
      <RBox size={[0.74, 0.16, 0.44]} radius={0.08} position={[-0.46, 0.66, 0.66]} rotation={[0.12, 0, 0]} material={M.linen} />
      <RBox size={[0.74, 0.16, 0.44]} radius={0.08} position={[0.46, 0.66, 0.66]} rotation={[0.12, 0, 0]} material={M.linen} />
      <RBox size={[0.46, 0.3, 0.12]} radius={0.06} position={[-0.3, 0.78, 0.92]} rotation={[-0.35, 0.08, 0]} material={M.fabricSage} />
      <RBox size={[0.46, 0.3, 0.12]} radius={0.06} position={[0.3, 0.78, 0.92]} rotation={[-0.35, -0.08, 0]} material={M.fabricCream} />
    </group>
  )
}

function BedsideLamp({ x }) {
  const glow = useBusGlow('bedroom', 3.2)
  const light = useBusLight('bedroom', 2.6)
  return (
    <group position={[x, 0, 0.48]}>
      <RBox size={[0.52, 0.5, 0.44]} radius={0.03} position={[0, 0.25, 0]} material={M.walnut} />
      <Box size={[0.42, 0.01, 0.01]} position={[0, 0.3, 0.225]} material={M.brass} cast={false} />
      <Cyl rTop={0.05} rBottom={0.09} h={0.24} position={[0, 0.62, 0]} material={M.ceramic} />
      <mesh position={[0, 0.84, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.2, 32, 1, true]} />
        <meshStandardMaterial ref={glow} color="#F6EEE2" side={THREE.DoubleSide} roughness={0.9} toneMapped={false} />
      </mesh>
      <Halo roomId="bedroom" position={[0, 0.84, 0]} scale={1.1} strength={0.8} />
      <pointLight ref={light} position={[0, 0.78, 0.08]} distance={3.5} decay={2} />
    </group>
  )
}

function Wardrobe() {
  return (
    <group position={[-7.58, 0, 4.5]}>
      <RBox size={[0.62, 2.35, 2.3]} radius={0.03} position={[0, 1.175, 0]} material={M.lightOak} />
      {[-0.575, 0, 0.575].map((z) => (
        <Box key={z} size={[0.01, 2.2, 0.012]} position={[0.315, 1.2, z]} material={M.walnut} cast={false} />
      ))}
      {[-0.66, -0.49, 0.49, 0.66].map((z) => (
        <Cyl key={z} r={0.012} h={0.42} position={[0.34, 1.15, z]} material={M.brass} />
      ))}
    </group>
  )
}

export function Bedroom() {
  return (
    <group>
      <RBox size={[3.3, 0.016, 2.7]} radius={0.006} position={[-4, 0.008, 1.95]} material={M.rugStone} cast={false} />
      <Bed />
      <BedsideLamp x={-5.48} />
      <BedsideLamp x={-2.52} />
      <RBox size={[1.5, 0.12, 0.42]} radius={0.04} position={[-4, 0.44, 3.0]} material={M.fabricCream} />
      {[-0.65, 0.65].map((x) => (
        <Box key={x} size={[0.04, 0.38, 0.36]} position={[-4 + x, 0.19, 3.0]} material={M.metalBlack} />
      ))}
      <Wardrobe />
      <Plant position={[-0.6, 0, 5.35]} scale={1.05} />
      <RBox size={[1.0, 0.8, 0.45]} radius={0.03} position={[-2.0, 0.4, 5.6]} material={M.walnut} />
      <Cyl rTop={0.04} rBottom={0.07} h={0.3} position={[-2.25, 0.95, 5.6]} material={M.ceramic} />
    </group>
  )
}
