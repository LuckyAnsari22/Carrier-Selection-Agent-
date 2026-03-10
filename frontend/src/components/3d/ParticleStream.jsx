import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random'
import * as THREE from 'three'

export default function ParticleStream({ start, end, color = '#00FF88', active = true }) {
  const ref = useRef()
  const positionArray = useRef(null)

  const sphere = random.inSphere(new Float32Array(300), { radius: 1.5 })

  // Create particles along the route
  if (!positionArray.current) {
    positionArray.current = new Float32Array(300)
    const count = Math.floor(300 / 3)
    for (let i = 0; i < count; i++) {
      const t = i / count
      const x = start[0] + (end[0] - start[0]) * t
      const y = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI) * 0.5
      const z = start[2] + (end[2] - start[2]) * t
      positionArray.current[i * 3] = x
      positionArray.current[i * 3 + 1] = y
      positionArray.current[i * 3 + 2] = z
    }
  }

  useFrame(() => {
    if (ref.current && active) {
      ref.current.rotation.x = Date.now() * 0.00005
      ref.current.rotation.y = Date.now() * 0.00003
    }
  })

  return (
    <Points ref={ref} positions={positionArray.current} stride={12} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={active ? 0.6 : 0.2}
      />
    </Points>
  )
}
