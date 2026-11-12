import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { M } from './materials'
import { Box, RBox } from './primitives'
import { envBus } from './lightBus'

export const WALL_H = 3
export const PARTITION_H = 1.2
const T = 0.2

/**
 * Axis-aligned wall built from box segments around rectangular openings.
 * axis 'x': runs along x at z = `at`; axis 'z': runs along z at x = `at`.
 * openings: [{ from, to, bottom, top, window }] in wall-local coordinates.
 */
function Wall({ axis, at, from, to, height, openings = [] }) {
  const pieces = []
  const sorted = [...openings].sort((a, b) => a.from - b.from)
  let cursor = from
  for (const o of sorted) {
    if (o.from > cursor) pieces.push([cursor, o.from, 0, height])
    if (o.bottom > 0) pieces.push([o.from, o.to, 0, o.bottom])
    if (o.top < height) pieces.push([o.from, o.to, o.top, height])
    cursor = o.to
  }
  if (cursor < to) pieces.push([cursor, to, 0, height])

  const place = (a, b, y0, y1, thickness = T) =>
    axis === 'x'
      ? { position: [(a + b) / 2, (y0 + y1) / 2, at], size: [b - a, y1 - y0, thickness] }
      : { position: [at, (y0 + y1) / 2, (a + b) / 2], size: [thickness, y1 - y0, b - a] }

  return (
    <group>
      {pieces.map(([a, b, y0, y1], i) => {
        const p = place(a, b, y0, y1)
        return <Box key={i} size={p.size} position={p.position} material={M.wall} />
      })}
      {pieces
        .filter(([, , , y1]) => y1 === height)
        .map(([a, b], i) => {
          const cap = place(a, b, height, height + 0.03, T + 0.02)
          return <Box key={`cap${i}`} size={cap.size} position={cap.position} material={M.wallCap} cast={false} />
        })}
      {sorted
        .filter((o) => o.window)
        .map((o, i) => (
          <WindowFrame key={i} axis={axis} at={at} {...o} />
        ))}
    </group>
  )
}

function WindowFrame({ axis, at, from, to, bottom, top, mullions = 1 }) {
  const w = to - from
  const h = top - bottom
  const cx = (from + to) / 2
  const cy = (bottom + top) / 2
  const f = 0.05
  const rot = axis === 'x' ? [0, 0, 0] : [0, Math.PI / 2, 0]
  const pos = axis === 'x' ? [cx, cy, at] : [at, cy, cx]
  return (
    <group position={pos} rotation={rot}>
      <mesh material={M.glass} renderOrder={2}>
        <boxGeometry args={[w, h, 0.02]} />
      </mesh>
      <Box size={[w, f, 0.12]} position={[0, h / 2 - f / 2, 0]} material={M.metalBlack} cast={false} />
      <Box size={[w + 0.04, f, 0.22]} position={[0, -h / 2 + f / 2, 0.02]} material={M.metalBlack} cast={false} />
      <Box size={[f, h, 0.12]} position={[-w / 2 + f / 2, 0, 0]} material={M.metalBlack} cast={false} />
      <Box size={[f, h, 0.12]} position={[w / 2 - f / 2, 0, 0]} material={M.metalBlack} cast={false} />
      {Array.from({ length: mullions }, (_, i) => (
        <Box
          key={i}
          size={[0.035, h, 0.08]}
          position={[-w / 2 + (w / (mullions + 1)) * (i + 1), 0, 0]}
          material={M.metalBlack}
          cast={false}
        />
      ))}
      <Box size={[w, 0.03, 0.08]} position={[0, h * 0.18, 0]} material={M.metalBlack} cast={false} />
    </group>
  )
}

function PlinthGlow() {
  const mat = useRef()
  useFrame(() => {
    mat.current.emissiveIntensity = 0.25 + envBus.night * 2.2
  })
  return (
    <mesh position={[0, -0.09, 0]}>
      <boxGeometry args={[17.04, 0.025, 13.04]} />
      <meshStandardMaterial ref={mat} color="#0b1020" emissive="#6366F1" toneMapped={false} />
    </mesh>
  )
}

export function HouseShell({ onFloorEvents }) {
  return (
    <group>
      <RBox size={[17, 0.5, 13]} radius={0.12} position={[0, -0.31, 0]} material={M.plinth} />
      <PlinthGlow />

      <Floor id="living" x={[-8, 0]} z={[-6, 0]} material={M.floorOak} {...onFloorEvents} />
      <Floor id="kitchen" x={[0, 8]} z={[-6, 0]} material={M.floorTile} {...onFloorEvents} />
      <Floor id="bedroom" x={[-8, 0]} z={[0, 6]} material={M.floorAsh} {...onFloorEvents} />
      <Floor id="office" x={[0, 8]} z={[0, 6]} material={M.floorWalnut} {...onFloorEvents} />

      {/* Exterior: back + left full height with glazing; front + right cut away */}
      <Wall
        axis="x"
        at={-6}
        from={-8.1}
        to={8.1}
        height={WALL_H}
        openings={[{ from: 3.0, to: 5.6, bottom: 1.25, top: 2.45, window: true, mullions: 1 }]}
      />
      <Wall
        axis="z"
        at={-8}
        from={-5.9}
        to={6.1}
        height={WALL_H}
        openings={[
          { from: -5.2, to: -1.4, bottom: 0.25, top: 2.65, window: true, mullions: 2 },
          { from: 1.3, to: 3.0, bottom: 0.8, top: 2.4, window: true, mullions: 1 },
        ]}
      />
      <Wall axis="z" at={8} from={-5.9} to={6.1} height={0.45} />
      <Wall axis="x" at={6} from={-7.9} to={7.9} height={0.45} />

      {/* Interior partitions (cut low for the dollhouse view) */}
      <Wall
        axis="x"
        at={0}
        from={-7.9}
        to={7.9}
        height={PARTITION_H}
        openings={[
          { from: -1.7, to: -0.5, bottom: 0, top: PARTITION_H + 1 },
          { from: 0.5, to: 1.7, bottom: 0, top: PARTITION_H + 1 },
        ]}
      />
      <Wall axis="z" at={0} from={0.1} to={5.9} height={PARTITION_H} />
      <Wall axis="z" at={0} from={-5.9} to={-4.4} height={PARTITION_H} />
    </group>
  )
}

function Floor({ id, x, z, material, onClick, onPointerOver, onPointerOut }) {
  const w = x[1] - x[0]
  const d = z[1] - z[0]
  return (
    <mesh
      position={[(x[0] + x[1]) / 2, -0.03, (z[0] + z[1]) / 2]}
      material={material}
      receiveShadow
      onClick={(e) => onClick?.(e, id)}
      onPointerOver={(e) => onPointerOver?.(e, id)}
      onPointerOut={(e) => onPointerOut?.(e, id)}
    >
      <boxGeometry args={[w, 0.06, d]} />
    </mesh>
  )
}
