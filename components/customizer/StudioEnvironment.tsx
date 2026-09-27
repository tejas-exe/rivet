"use client";
/**
 * WebGL garage backdrop: reflective turntable, floor grid, drifting dust.
 * The turntable follows the garment's rotation via `studioSignals`.
 * A GLB garment model could be mounted inside this same <Canvas> later.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { studioSignals } from "./TurntableGarment";

function Turntable() {
  const group = useRef<THREE.Group>(null);
  const ticks = useMemo(() => Array.from({ length: 48 }, (_, i) => (i / 48) * Math.PI * 2), []);
  useFrame(() => {
    if (!group.current) return;
    const target = THREE.MathUtils.degToRad(studioSignals.rotY);
    group.current.rotation.y += (target - group.current.rotation.y) * 0.25;
  });
  return (
    <group position={[0, -2.25, 0]}>
      <group ref={group}>
        <mesh receiveShadow>
          <cylinderGeometry args={[2.6, 2.7, 0.12, 96]} />
          <meshStandardMaterial color="#141414" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 2.24, 96]} />
          <meshBasicMaterial color="#c8ff2e" transparent opacity={0.55} />
        </mesh>
        {ticks.map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 2.42, 0.064, Math.sin(a) * 2.42]} rotation={[-Math.PI / 2, 0, -a]}>
            <planeGeometry args={[i % 4 === 0 ? 0.22 : 0.1, 0.02]} />
            <meshBasicMaterial color={i === 0 ? "#c8ff2e" : "#eeebe3"} transparent opacity={i % 4 === 0 ? 0.6 : 0.25} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.72, 2.76, 96]} />
        <meshBasicMaterial color="#eeebe3" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function Dust({ count = 260 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1 + Math.random() * 6;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = -2 + Math.random() * 7;
      arr[i * 3 + 2] = Math.sin(a) * r - 1;
    }
    return arr;
  }, [count]);
  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = attr.getY(i) + dt * 0.12;
      if (y > 5) y = -2;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
    pts.rotation.y += dt * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#eeebe3" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Scene() {
  return (
    <>
      <fog attach="fog" args={["#0a0a0a", 7, 22]} />
      <ambientLight intensity={0.25} />
      <spotLight position={[0, 9, 2]} angle={0.45} penumbra={0.9} intensity={60} color="#fffaf0" />
      <pointLight position={[-5, 1, 3]} intensity={6} color="#c8ff2e" distance={12} />
      <pointLight position={[5, 1, -2]} intensity={4} color="#9fb4ff" distance={12} />
      <Turntable />
      <gridHelper args={[60, 60, "#262626", "#1a1a1a"]} position={[0, -2.32, 0]} />
      <Dust />
    </>
  );
}

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function StudioEnvironment() {
  return (
    <GLBoundary>
      <Canvas
        className="!absolute inset-0"
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.9, 9], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ camera }) => camera.lookAt(0, -0.7, 0)}
      >
        <Scene />
      </Canvas>
    </GLBoundary>
  );
}
