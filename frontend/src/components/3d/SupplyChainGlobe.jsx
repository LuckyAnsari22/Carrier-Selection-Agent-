import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Convert lat/lon to 3D sphere coordinates
function latLonToXYZ(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

// Major logistics hubs with real coordinates
const CARRIER_HUBS = [
  { name: 'Mumbai', lat: 19.08, lon: 72.88, health: 0.95 },
  { name: 'Delhi', lat: 28.61, lon: 77.21, health: 0.80 },
  { name: 'Shanghai', lat: 31.23, lon: 121.47, health: 0.90 },
  { name: 'Singapore', lat: 1.35, lon: 103.82, health: 0.99 },
  { name: 'Dubai', lat: 25.20, lon: 55.27, health: 0.72 },
  { name: 'London', lat: 51.51, lon: -0.13, health: 0.88 },
  { name: 'New York', lat: 40.71, lon: -74.01, health: 0.93 },
  { name: 'Tokyo', lat: 35.68, lon: 139.69, health: 0.85 },
]

const TRADE_ROUTES = [
  { from: 'Mumbai', to: 'Delhi', health: 0.80 },
  { from: 'Mumbai', to: 'Singapore', health: 0.95 },
  { from: 'Shanghai', to: 'Singapore', health: 0.90 },
  { from: 'Dubai', to: 'Mumbai', health: 0.65 },
  { from: 'Singapore', to: 'Tokyo', health: 0.88 },
]

function healthToColor(health) {
  if (health > 0.85) return new THREE.Color('#00FF88')
  if (health > 0.60) return new THREE.Color('#FF8C00')
  return new THREE.Color('#FF2244')
}

// Animated carrier node
function CarrierNode({ hub }) {
  const meshRef = useRef()
  const position = latLonToXYZ(hub.lat, hub.lon, 1.02)
  const color = healthToColor(hub.health)

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3 + hub.lat) * 0.15 + 0.9
      meshRef.current.scale.setScalar(pulse * (hub.health < 0.7 ? 0.8 : 1.0))
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.025, 0.045, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// Animated trade route artery
function TradeRoute({ from, to, hubs, health }) {
  const lineRef = useRef()
  const particleRef = useRef()
  const progressRef = useRef(Math.random())

  const fromHub = hubs.find(h => h.name === from)
  const toHub = hubs.find(h => h.name === to)

  const points = useMemo(() => {
    if (!fromHub || !toHub) return []
    const start = latLonToXYZ(fromHub.lat, fromHub.lon, 1.02)
    const end = latLonToXYZ(toHub.lat, toHub.lon, 1.02)
    const mid = start.clone().add(end).multiplyScalar(0.5)
    mid.normalize().multiplyScalar(1.5) // Higher arc
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    return curve.getPoints(60)
  }, [fromHub, toHub])

  const color = healthToColor(health)
  const opacity = health > 0.7 ? 0.7 : 0.4

  const geometry = useMemo(() => {
    if (points.length === 0) return null
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.4 * health) % 1
    if (particleRef.current) {
      const idx = Math.floor(progressRef.current * (points.length - 1))
      if (points[idx]) {
        particleRef.current.position.copy(points[idx])
      }
    }
  })

  if (!geometry) return null

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={1} />
      </line>
      {health > 0.3 && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshBasicMaterial color={color} shadowSide={THREE.FrontSide} />
        </mesh>
      )}
    </group>
  )
}

// The Earth globe itself
function Globe({ healthScore }) {
  const globeRef = useRef()
  const atmosphereRef = useRef()
  const gridRef = useRef()

  const atmosphereColor = useMemo(() => {
    if (healthScore > 80) return '#00FF88'
    if (healthScore > 50) return '#FF8C00'
    return '#FF2244'
  }, [healthScore])

  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.08
    if (gridRef.current) gridRef.current.rotation.y += delta * 0.08
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += delta * 0.04
  })

  return (
    <group>
      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef} scale={1.25}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer Glow Ring */}
      <mesh scale={1.12}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main Surface */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color="#0A1428"
          emissive="#0D1B2A"
          emissiveIntensity={0.6}
          specular="#224488"
          shininess={50}
        />
      </mesh>

      {/* Wireframe Grid */}
      <mesh ref={gridRef} scale={1.002}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#1E3A5F"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  )
}

// Main exported component
export default function SupplyChainGlobe({ mini = false, healthScore = 100 }) {
  return (
    <Canvas
      camera={{ position: [0, 0, mini ? 2.5 : 2.4], fov: mini ? 45 : 40 }}
      style={{ background: 'transparent' }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false
      }}
      onCreated={({ gl }) => {
        const handleContextLost = (e) => {
          e.preventDefault();
          console.warn('CarrierIQ 3D: WebGL Context Lost. Attempting restoration...');
        };
        const handleContextRestored = () => {
          console.info('CarrierIQ 3D: WebGL Context Restored.');
        };
        gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
        gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

        // Return a cleanup function via the same closure if possible?
        // Actually onCreated doesn't support cleanup return. 
        // We'll just let it be or use a state.
      }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 5, 10]} intensity={1.5} color="#4488FF" />
      <pointLight position={[-10, -5, -10]} intensity={0.8} color="#FF4488" />
      <spotLight position={[0, 10, 0]} intensity={0.5} color="#FFFFFF" penumbra={1} />

      <Stars radius={100} depth={50} count={mini ? 400 : 2500} factor={4} saturation={0.5} fade speed={1} />

      <Globe healthScore={healthScore} />

      {CARRIER_HUBS.map(hub => (
        <CarrierNode key={hub.name} hub={hub} />
      ))}

      {TRADE_ROUTES.map((route, i) => (
        <TradeRoute
          key={i}
          from={route.from}
          to={route.to}
          hubs={CARRIER_HUBS}
          health={route.health}
        />
      ))}

      {!mini && <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} rotateSpeed={0.4} />}
    </Canvas>
  )
}
