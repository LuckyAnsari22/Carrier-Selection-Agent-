import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function Dial({ risk }) {
  const needleRef = useRef()
  const targetAngle = THREE.MathUtils.lerp(-Math.PI / 2, Math.PI / 2, risk / 100)

  useFrame(() => {
    if (needleRef.current) {
      needleRef.current.rotation.z = THREE.MathUtils.lerp(
        needleRef.current.rotation.z,
        targetAngle,
        0.05
      )
    }
  })

  const color = risk < 30 ? '#00FF88' : risk < 70 ? '#FF8C00' : '#FF2244'

  return (
    <group>
      {/* Gauge arc */}
      {Array.from({ length: 180 }, (_, i) => {
        const angle = (i / 180) * Math.PI - Math.PI / 2
        const r = 0.8
        return (
          <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]}>
            <circleGeometry args={[0.015, 4]} />
            <meshBasicMaterial
              color={i < 60 ? '#00FF88' : i < 120 ? '#FF8C00' : '#FF2244'}
              transparent opacity={0.6}
            />
          </mesh>
        )
      })}
      {/* Needle */}
      <group ref={needleRef}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.02, 0.7, 0.01]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
      {/* Center cap */}
      <mesh>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color="#0D1B2A" />
      </mesh>
      {/* Risk number */}
      <Text position={[0, -0.3, 0]} fontSize={0.2} color={color}>
        {`${Math.round(risk)}`}
      </Text>
      <Text position={[0, -0.52, 0]} fontSize={0.1} color="#8892A4">
        DELAY RISK
      </Text>
    </group>
  )
}

export default function RiskGauge3D({ risk = 0 }) {
  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 40 }} style={{ height: 200 }}>
      <ambientLight intensity={0.8} />
      <Dial risk={risk} />
    </Canvas>
  )
}
