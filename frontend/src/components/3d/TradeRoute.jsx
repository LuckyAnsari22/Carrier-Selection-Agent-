import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function TradeRoute({ start, end, status = 'healthy' }) {
  const lineRef = useRef()
  const particlesRef = useRef()

  // Determine color based on status
  const getColor = () => {
    switch (status) {
      case 'healthy': return new THREE.Color('#00FF88')
      case 'warning': return new THREE.Color('#FF8C00')
      case 'critical': return new THREE.Color('#FF2244')
      default: return new THREE.Color('#00FF88')
    }
  }

  useFrame(() => {
    if (lineRef.current && lineRef.current.material) {
      // Pulsing opacity
      const opacity = 0.4 + Math.sin(Date.now() * 0.002) * 0.3
      lineRef.current.material.opacity = opacity
    }
  })

  // Create line geometry
  const points = [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ]

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={getColor()}
          linewidth={2}
          transparent={true}
          opacity={0.6}
        />
      </line>
    </group>
  )
}
