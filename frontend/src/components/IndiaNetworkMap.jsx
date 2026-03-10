import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

// mock data for 15 carriers
const carriers = [...Array(15).keys()].map(i => ({
  id: i,
  name: `Carrier ${i + 1}`,
  tier: ['premium', 'standard', 'budget'][i % 3],
  score: Math.random(),
  // random positions on a flat India outline (-1..1)
  pos: [Math.random() * 1.8 - 0.9, Math.random() * 1.2 - 0.6, 0]
}));

// utility for pulsing ring
function PulseRing({ position, color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 3) * 0.15;
    if (ref.current) ref.current.scale.set(scale, scale, scale);
  });
  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[0.11, 0.14, 32]} />
      <meshBasicMaterial transparent opacity={0.4} color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Node({ carrier, onHover, onClick, selected }) {
  const ref = useRef();
  const colorMap = {
    premium: '#6366f1',
    standard: '#22d3ee',
    budget: '#8b8b9a'
  };
  const color = colorMap[carrier.tier];
  const scale = carrier.score * 0.5 + 0.5;

  return (
    <group
      ref={ref}
      position={carrier.pos}
      onPointerOver={e => onHover(carrier)}
      onPointerOut={() => onHover(null)}
      onClick={() => onClick(carrier)}
    >
      <mesh>
        <sphereGeometry args={[0.05 * scale, 16, 16]} />
        <meshStandardMaterial emissive={color} color="#050508" />
      </mesh>
      <PulseRing position={[0, 0, 0]} color={color} />
      {selected && (
        <Html distanceFactor={10} center>
          <div className="bg-black bg-opacity-70 text-white p-1 rounded text-xs">
            {carrier.name} ({(carrier.score * 100).toFixed(0)}%)
          </div>
        </Html>
      )}
    </group>
  );
}

function Connections({ topCarriers }) {
  const groupRef = useRef();
  // create curves between first 5 carriers
  const curves = useMemo(() => {
    const pts = topCarriers.slice(0, 5).map(c => new THREE.Vector3(...c.pos));
    const arr = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const curve = new THREE.CatmullRomCurve3([pts[i], pts[i].clone().add(new THREE.Vector3(0, 0, 0.2)), pts[i + 1]]);
      arr.push(curve);
    }
    return arr;
  }, [topCarriers]);

  return (
    <group ref={groupRef}>
      {curves.map((curve, idx) => (
        <mesh key={idx}>
          <tubeGeometry args={[curve, 64, 0.005, 8, false]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function AutoRotateCamera() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.001);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function IndiaNetworkMap() {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  // sort to get top 5 by score
  const topFive = useMemo(
    () => [...carriers].sort((a, b) => b.score - a.score),
    []
  );

  return (
    <div className="relative w-full h-[400px] bg-black">
      <Canvas camera={{ position: [0, 0, 2] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        {/* flat plane as India map placeholder */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}> 
          <planeGeometry args={[2.5, 1.7]} />
          <meshStandardMaterial color="#0d0d14" />
        </mesh>
        <Connections topCarriers={topFive} />
        {carriers.map(c => (
          <Node
            key={c.id}
            carrier={c}
            onHover={setHovered}
            onClick={setSelected}
            selected={selected && selected.id === c.id}
          />
        ))}
        <AutoRotateCamera />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      {/* overlays */}
      <div className="absolute top-2 left-2 text-sm text-brand-primary font-bold">
        NETWORK COVERAGE
      </div>
      <div className="absolute top-2 right-2 text-sm text-brand-secondary font-bold">
        30 CARRIERS | 20,000+ ROUTES
      </div>
      {hovered && (
        <div className="absolute bottom-2 left-2 p-1 bg-black bg-opacity-60 text-xs rounded">
          {hovered.name} — {(hovered.score * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
}
