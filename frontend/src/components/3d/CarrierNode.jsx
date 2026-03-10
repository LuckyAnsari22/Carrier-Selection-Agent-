import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CarrierNode({ position, color = '#00FF88', label = 'Node', status = 'healthy' }) {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
      
      // Pulsing animation
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group position={position}>
      {/* Main node */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          shininess={100}
        />
      </mesh>

      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent={true}
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}
