import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { ROOMS, roomCenter } from '../../data/rooms'
import { envBus, useBusLight } from './lightBus'

const DAY = {
  ambient: 0.28,
  hemi: 0.6,
  sun: 2.3,
  sunColor: new THREE.Color('#FFF1DC'),
  env: 0.7,
}
const NIGHT = {
  ambient: 0.05,
  hemi: 0.08,
  sun: 0.35,
  sunColor: new THREE.Color('#6D74FF'),
  env: 0.12,
}

const lerp = (a, b, t) => a + (b - a) * t

function RoomSpot({ room }) {
  const [cx, cz] = roomCenter(room)
  const ref = useBusLight(room.id, 48)
  const target = useMemo(() => new THREE.Object3D(), [])
  return (
    <>
      <primitive object={target} position={[cx, 0, cz]} />
      <spotLight
        ref={ref}
        target={target}
        position={[cx, 2.95, cz]}
        angle={1.0}
        penumbra={0.85}
        distance={11}
        decay={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-near={0.3}
        shadow-camera-far={8}
      />
    </>
  )
}

/** Day/night environment that eases between an architectural morning and a moody night. */
export function SceneLighting() {
  const ambient = useRef()
  const hemi = useRef()
  const sun = useRef()
  const scene = useThree((s) => s.scene)

  useFrame(() => {
    const t = envBus.night
    ambient.current.intensity = lerp(DAY.ambient, NIGHT.ambient, t)
    hemi.current.intensity = lerp(DAY.hemi, NIGHT.hemi, t)
    sun.current.intensity = lerp(DAY.sun, NIGHT.sun, t)
    sun.current.color.copy(DAY.sunColor).lerp(NIGHT.sunColor, t)
    scene.environmentIntensity = lerp(DAY.env, NIGHT.env, t)
  })

  return (
    <>
      <ambientLight ref={ambient} />
      <hemisphereLight ref={hemi} args={['#DCEBFF', '#2A2F3A']} />
      <directionalLight
        ref={sun}
        position={[-10, 16, 7]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.04}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        shadow-camera-near={1}
        shadow-camera-far={45}
      />
      {ROOMS.map((room) => (
        <RoomSpot key={room.id} room={room} />
      ))}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#C7D2FE" position={[-10, 3, 0]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#FFE4C4" position={[10, 3, 4]} rotation-y={-Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="ring" intensity={2} color="#818CF8" position={[0, 4, -10]} scale={6} />
      </Environment>
    </>
  )
}

/**
 * Lights and geometry are static, so shadow maps are rendered for the first frames only,
 * which keeps five shadow-casting lights within a 60fps budget.
 */
export function ShadowBaker() {
  const gl = useThree((s) => s.gl)
  const frames = useRef(0)
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    return () => {
      gl.shadowMap.autoUpdate = true
    }
  }, [gl])
  useFrame(() => {
    if (frames.current < 90) {
      frames.current++
      gl.shadowMap.needsUpdate = true
    }
  })
  return null
}
