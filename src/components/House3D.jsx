import { Suspense, useCallback, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr, ContactShadows, Grid, Line } from '@react-three/drei'
import { ROOMS } from '../data/rooms'
import { useHomeStore } from '../store/useHomeStore'
import { HouseShell } from './three/HouseShell'
import { LivingRoom } from './three/rooms/LivingRoom'
import { Kitchen } from './three/rooms/Kitchen'
import { Bedroom } from './three/rooms/Bedroom'
import { Office } from './three/rooms/Office'
import { SceneLighting, ShadowBaker } from './three/SceneLighting'
import { CameraRig } from './three/CameraRig'
import { RoomPins } from './three/RoomPins'
import { LightBusController } from './three/lightBus'

function RoomOutline({ room }) {
  const line = useRef()
  const { x, z } = room.bounds
  const inset = 0.14
  const y = 0.02
  const points = [
    [x[0] + inset, y, z[0] + inset],
    [x[1] - inset, y, z[0] + inset],
    [x[1] - inset, y, z[1] - inset],
    [x[0] + inset, y, z[1] - inset],
    [x[0] + inset, y, z[0] + inset],
  ]
  useFrame((_, dt) => {
    const { focus, hoveredRoom } = useHomeStore.getState()
    const target = focus === room.id ? 0.95 : hoveredRoom === room.id ? 0.55 : 0
    const mat = line.current.material
    mat.opacity += (target - mat.opacity) * (1 - Math.exp(-dt * 8))
    line.current.visible = mat.opacity > 0.01
  })
  return (
    <Line
      ref={line}
      points={points}
      color="#818CF8"
      lineWidth={2.5}
      transparent
      opacity={0}
      depthWrite={false}
      toneMapped={false}
    />
  )
}

function Scene({ pinLayer }) {
  const setFocus = useHomeStore((s) => s.setFocus)
  const setHoveredRoom = useHomeStore((s) => s.setHoveredRoom)

  const floorEvents = {
    onClick: useCallback(
      (e, id) => {
        if (e.delta > 6) return
        e.stopPropagation()
        setFocus(id)
      },
      [setFocus],
    ),
    onPointerOver: useCallback(
      (e, id) => {
        e.stopPropagation()
        setHoveredRoom(id)
        document.body.style.cursor = 'pointer'
      },
      [setHoveredRoom],
    ),
    onPointerOut: useCallback(
      (e, id) => {
        if (useHomeStore.getState().hoveredRoom !== id) return
        setHoveredRoom(null)
        document.body.style.cursor = ''
      },
      [setHoveredRoom],
    ),
  }

  return (
    <>
      <LightBusController />
      <SceneLighting />
      <ShadowBaker />
      <CameraRig />

      <group>
        <HouseShell onFloorEvents={floorEvents} />
        <LivingRoom />
        <Kitchen />
        <Bedroom />
        <Office />
        {ROOMS.map((room) => (
          <RoomOutline key={room.id} room={room} />
        ))}
      </group>

      <RoomPins portal={pinLayer} />

      <ContactShadows position={[0, -0.57, 0]} scale={34} blur={2.6} far={6} opacity={0.7} resolution={512} frames={1} color="#000000" />
      <Grid
        position={[0, -0.58, 0]}
        infiniteGrid
        cellSize={1}
        cellThickness={0.6}
        cellColor="#1B2233"
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#2A3350"
        fadeDistance={55}
        fadeStrength={2.2}
      />
    </>
  )
}

export default function House3D() {
  const pinLayer = useRef(null)
  return (
    <div className="relative size-full">
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        camera={{ position: [30, 26, 34], fov: 32, near: 0.5, far: 200 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => useHomeStore.getState().setHoveredRoom(null)}
      >
        <Suspense fallback={null}>
          <Scene pinLayer={pinLayer} />
        </Suspense>
        <AdaptiveDpr pixelated={false} />
      </Canvas>
      {/* Stable portal target: drei <Html> otherwise re-roots once events connect, racing React 19 unmounts */}
      <div ref={pinLayer} className="pointer-events-none absolute inset-0 overflow-hidden" />
    </div>
  )
}
