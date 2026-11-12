import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ROOM_MAP, roomCenter } from '../../data/rooms'
import { useHomeStore } from '../../store/useHomeStore'

const OVERVIEW = { position: new THREE.Vector3(15, 15.5, 17.5), target: new THREE.Vector3(0, 0.2, 0.4) }
const ROOM_OFFSET = new THREE.Vector3(5.2, 6.6, 7.4)

function viewFor(focus, aspect) {
  const zoomOut = aspect < 0.8 ? 2.2 : aspect < 1 ? 1.7 : aspect < 1.4 ? 1.25 : 1
  if (focus === 'overview') {
    const target = OVERVIEW.target.clone()
    const position = OVERVIEW.position.clone().sub(target).multiplyScalar(zoomOut).add(target)
    return { position, target }
  }
  const [cx, cz] = roomCenter(ROOM_MAP[focus])
  const target = new THREE.Vector3(cx, 0.7, cz)
  return { position: ROOM_OFFSET.clone().multiplyScalar(zoomOut).add(target), target }
}

/**
 * Eases the camera toward the focused room while OrbitControls stays live;
 * any user drag/zoom immediately hands control back to the user.
 */
export function CameraRig() {
  const controls = useRef()
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)
  const focus = useHomeStore((s) => s.focus)
  const anim = useRef({ active: true, ...viewFor('overview', aspect) })

  useEffect(() => {
    anim.current = { active: true, ...viewFor(focus, aspect) }
  }, [focus, aspect])

  useFrame((_, dt) => {
    const a = anim.current
    const c = controls.current
    if (!a.active || !c) return
    const k = 1 - Math.exp(-dt * 2.6)
    camera.position.lerp(a.position, k)
    c.target.lerp(a.target, k)
    c.update()
    if (camera.position.distanceToSquared(a.position) < 1e-4 && c.target.distanceToSquared(a.target) < 1e-4) {
      a.active = false
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={4}
      maxDistance={70}
      maxPolarAngle={Math.PI / 2.15}
      onStart={() => {
        anim.current.active = false
      }}
    />
  )
}
