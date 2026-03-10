import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { COLORS } from '../../styles/theme';

// city definitions roughly laid out to resemble geography
const CITIES = [
  { id: 0, name: 'Mumbai', pos: [-2.5, -1.2, 0], tier: 'P', score: 0.87, risk: 'L', ontime: 97, cost: 42 },
  { id: 1, name: 'Delhi', pos: [0.5, 2.2, -0.3], tier: 'P', score: 0.83, risk: 'L', ontime: 95, cost: 39 },
  { id: 2, name: 'Bangalore', pos: [-1.8, -3, 0], tier: 'P', score: 0.79, risk: 'L', ontime: 93, cost: 35 },
  { id: 3, name: 'Chennai', pos: [0.8, -3.2, 0.1], tier: 'S', score: 0.74, risk: 'M', ontime: 90, cost: 33 },
  { id: 4, name: 'Hyderabad', pos: [-0.5, -2, 0.3], tier: 'S', score: 0.71, risk: 'M', ontime: 89, cost: 31 },
  { id: 5, name: 'Kolkata', pos: [3.5, 0.8, -0.5], tier: 'S', score: 0.68, risk: 'M', ontime: 87, cost: 30 },
  { id: 6, name: 'Pune', pos: [-2, -1.8, 0.4], tier: 'S', score: 0.65, risk: 'M', ontime: 85, cost: 29 },
  { id: 7, name: 'Ahmedabad', pos: [-3.2, 0.5, 0.2], tier: 'S', score: 0.61, risk: 'M', ontime: 84, cost: 28 },
  { id: 8, name: 'Jaipur', pos: [-1.2, 1.5, -0.1], tier: 'B', score: 0.57, risk: 'H', ontime: 82, cost: 27 },
  { id: 9, name: 'Lucknow', pos: [1.5, 1.2, -0.2], tier: 'B', score: 0.53, risk: 'H', ontime: 80, cost: 25 },
];

const ROUTES = [
  [0,1],[0,6],[0,2],[1,5],[1,9],[2,4],[3,4],[4,6],[7,0],[7,1],[1,8],[5,3],
];

function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.1} darkness={0.7} />
    </EffectComposer>
  );
}

function useGlowTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.2, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,size,size);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

function Node({ city, mode, selected, onClick, index, glowTexture }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const spriteRef = useRef();
  const baseColor = city.tier === 'P'
    ? COLORS.premium
    : city.tier === 'S'
      ? COLORS.standard
      : COLORS.budget;
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    let scale = 1;
    let color = baseColor;
    let emissive = 1;

    // voice highlight override
    const vh = useCarrierStore.getState().voiceHighlight;
    if (vh) {
      if (vh.type === 'best' && vh.ids.includes(city.id)) {
        color = COLORS.life;
        emissive = 2;
        scale *= 1.3;
      }
      if (vh.type === 'top3') {
        if (vh.ids.includes(city.id)) {
          emissive = 2;
        } else {
          emissive *= 0.2;
        }
      }
    }

    if (mode === 'normal') {
      scale = 1 + 0.1 * Math.sin(t * 0.6 + index * 0.7);
      ringRef.current.rotation.y += 0.005;
    } else if (mode === 'risk') {
      if (city.risk === 'M') {
        scale = 1 + 0.05 * Math.sin(t * 1.2);
        ringRef.current.rotation.y += 0.01;
        color = COLORS.gold;
      } else if (city.risk === 'H') {
        scale = 1 + 0.3 * Math.abs(Math.sin(t * 3 + index));
        ringRef.current.rotation.y += 0.03 + Math.random() * 0.02;
        color = COLORS.plasma;
        emissive = 2;
      } else {
        ringRef.current.rotation.y += 0.005;
      }
    } else if (mode === 'pulse') {
      const beat = Math.sin(t * 6.28);
      scale = 1 + Math.max(0, beat) * 0.4;
      if (beat > 0) color = COLORS.life;
      ringRef.current.rotation.y += 0.02;
    } else if (mode === 'express') {
      scale = 1 + 0.2 * Math.sin(t * 1.5);
      ringRef.current.rotation.y += 0.05;
      emissive = 1.5;
    }

    const hovered = useCarrierStore.getState().hoveredCarrier;
    if (flash || hovered === city.id) {
      scale *= 1.15;
      emissive *= 1.5;
    }
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale);
      meshRef.current.material.emissive.setHex(color);
      meshRef.current.material.emissiveIntensity = emissive;
    }
    if (spriteRef.current) {
      spriteRef.current.scale.setScalar(scale * 1.2);
    }
  });

  useEffect(() => {
    if (!meshRef.current) return;
    if (selected) {
      gsap.to(meshRef.current.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.4, ease: 'elastic.out(1,0.3)' });
      gsap.to(meshRef.current.position, { z: meshRef.current.position.z + 0.5, duration: 0.4 });
      gsap.to(spriteRef.current.scale, { x: 3, y: 3, z: 3, duration: 0.4 });
    } else {
      gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'elastic.out(1,0.3)' });
      gsap.to(meshRef.current.position, { z: city.pos[2], duration: 0.4 });
      gsap.to(spriteRef.current.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.4 });
    }
  }, [selected]);

  return (
    <group position={city.pos} onClick={() => onClick(city.id)}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={1} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.5, 0.02, 16, 100]} />
        <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <sprite ref={spriteRef} scale={[1.2, 1.2, 1.2]}> 
        <spriteMaterial map={glowTexture} blending={THREE.AdditiveBlending} transparent />
      </sprite>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.18}
        color="#c0c4e8"
        anchorX="center"
        anchorY="middle"
      >
        {city.name}
      </Text>
    </group>
  );
}

function Route({ startPos, endPos, mode, startRisk, endRisk, startId, endId }) {
  const pointsRef = useRef();
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 50; i++) {
      arr.push({ progress: Math.random(), speed: 0.003 + Math.random() * 0.004 });
    }
    return arr;
  }, []);

  const curve = useMemo(() => {
    const p0 = new THREE.Vector3(...startPos);
    const p2 = new THREE.Vector3(...endPos);
    const mid = p0.clone().lerp(p2, 0.5);
    mid.y += 1;
    return new THREE.CatmullRomCurve3([p0, mid, p2]);
  }, [startPos, endPos]);

  useFrame(() => {
    const positions = [];
    particles.forEach(p => {
      // voice-best highlight speeds routes brighter
      const vh = useCarrierStore.getState().voiceHighlight;
      if (vh && vh.type === 'best' && vh.ids.includes(startId) && vh.ids.includes(endId)) {
        p.speed *= 3;
      }
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;
      const pt = curve.getPoint(p.progress);
      positions.push(pt.x, pt.y, pt.z);
    });
    if (pointsRef.current) {
      pointsRef.current.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
    }
  });

  let color = new THREE.Color(COLORS.neon);
  if (mode === 'risk' && (startRisk === 'H' || endRisk === 'H')) {
    color = new THREE.Color(COLORS.plasma);
  }
  if (mode === 'pulse') {
    color = new THREE.Color(COLORS.life);
  }
  const vh = useCarrierStore.getState().voiceHighlight;
  if (vh && vh.type === 'best' && vh.ids.includes(startId) && vh.ids.includes(endId)) {
    color = new THREE.Color(COLORS.life);
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial size={0.05} color={color} />
    </points>
  );
}

function OrganismGroup({ mode, selectedId, onNodeClick }) {
  const glowTexture = useGlowTexture();
  const groupRef = useRef();
  const { camera, mouse } = useThree();

  useFrame(() => {
    // camera parallax
    camera.position.x += ((mouse.x * 0.8) - camera.position.x) * 0.05;
    camera.position.y += ((mouse.y * -0.4 + 1.8) - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      {CITIES.map((c, i) => (
        <Node
          key={c.id}
          city={c}
          mode={mode}
          selected={selectedId === c.id}
          onClick={onNodeClick}
          index={i}
          glowTexture={glowTexture}
        />
      ))}
      {ROUTES.map(([a, b], i) => {
        const start = CITIES[a];
        const end = CITIES[b];
        return (
          <Route
            key={i}
            startPos={start.pos}
            endPos={end.pos}
            mode={mode}
            startRisk={start.risk}
            endRisk={end.risk}
            startId={start.id}
            endId={end.id}
          />
        );
      })}
    </group>
  );
}

function BackgroundParticles() {
  const groupRef = useRef();
  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 300; i++) {
      arr.push((Math.random() - 0.5) * 30);
      arr.push((Math.random() - 0.5) * 30);
      arr.push((Math.random() - 0.5) * 30);
    }
    return new Float32Array(arr);
  }, []);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0002;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attachObject={["attributes", "position"]}
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color={new THREE.Color(COLORS.neon)}
          blending={THREE.AdditiveBlending}
          transparent
        />
      </points>
    </group>
  );
}

function GridFloor() {
  return (
    <gridHelper
      args={[20, 20, '#0d0d2a', '#0d0d2a']}
      position={[0, -4, 0]}
    />
  );
}

const OrganismScene = ({ mode = 'normal', selectedId = null, onNodeClick = () => {} }) => {
  return (
    <Canvas
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      camera={{ position: [0, 2, 14], fov: 60 }}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    >
      <color attach="background" args={["#020207"]} />
      <fog attach="fog" args={["#020207", 15, 50]} />
      <PostProcessing />
      <OrganismGroup mode={mode} selectedId={selectedId} onNodeClick={onNodeClick} />
      <BackgroundParticles />
      <GridFloor />
    </Canvas>
  );
};

export default OrganismScene;
