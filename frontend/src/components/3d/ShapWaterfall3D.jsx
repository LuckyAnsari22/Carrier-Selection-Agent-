import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ShapWaterfall3D({ data = [] }) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = -0.2
    }
  })

  // Default sample data if none provided
  const chartData = data.length > 0 ? data : [
    { label: 'Cost', value: 2.1 },
    { label: 'Reliability', value: 1.8 },
    { label: 'Speed', value: -0.5 },
    { label: 'Quality', value: 1.2 },
  ]

  return (
    <group ref={groupRef}>
      {chartData.map((item, idx) => {
        const height = Math.abs(item.value)
        const color = item.value > 0 ? '#00FF88' : '#FF2244'
        const xPos = (idx - chartData.length / 2) * 1.5

        return (
          <group key={idx}>
            {/* Bar */}
            <mesh position={[xPos, height / 2, 0]}>
              <boxGeometry args={[0.8, height, 0.8]} />
              <meshPhongMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.4}
              />
            </mesh>

            {/* Label plane */}
            <mesh position={[xPos, -0.5, 0]}>
              <planeGeometry args={[0.8, 0.4]} />
              <meshPhongMaterial color="#0D1B2A" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
