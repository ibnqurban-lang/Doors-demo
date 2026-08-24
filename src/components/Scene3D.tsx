import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { GlassType, ProductConfig, Section } from '../types';

export type ViewPreset = 'front' | 'side' | 'top' | 'iso';
export type DisplayMode = 'technical' | 'presentation';
export type InteriorPreset = 'living' | 'kitchen' | 'office' | 'meeting' | 'bedroom' | 'closet';

export const INTERIOR_PRESETS: { id: InteriorPreset; label: string; wall: string; floor: string; sky: string }[] = [
  { id: 'living', label: 'Современная гостиная', wall: '#e7e1d6', floor: '#8a6a4a', sky: '#f4efe6' },
  { id: 'kitchen', label: 'Кухня', wall: '#eef2f1', floor: '#c9beae', sky: '#f7fbfa' },
  { id: 'office', label: 'Офис', wall: '#dde3ea', floor: '#6b6f76', sky: '#eef1f5' },
  { id: 'meeting', label: 'Переговорная', wall: '#e3ded5', floor: '#4a4038', sky: '#efece6' },
  { id: 'bedroom', label: 'Спальня', wall: '#efe3df', floor: '#a6835f', sky: '#f7efe9' },
  { id: 'closet', label: 'Гардеробная', wall: '#f0ede6', floor: '#c7ad86', sky: '#f8f6f0' },
];

function isDoor(o: Section['opening']) {
  return o !== 'fixed';
}

const FACE_M = 0.06;
const IMPOST_FACE_M = 0.046;
const LEAF_FACE_M = 0.042;
const DEPTH_M = 0.05;

interface SceneProps {
  product: ProductConfig;
  glassTypes: GlassType[];
  profileColorHex: string;
  mode: DisplayMode;
  interior: InteriorPreset;
  open: boolean;
}

function ProfileBox({ x, y, z, w, h, d, color }: { x: number; y: number; z: number; w: number; h: number; d: number; color: string }) {
  return (
    <mesh position={[x, y, z]} castShadow receiveShadow>
      <boxGeometry args={[Math.max(w, 0.001), Math.max(h, 0.001), d]} />
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.35} />
    </mesh>
  );
}

function GlassPane({ x, y, w, h, glass, mode }: { x: number; y: number; w: number; h: number; glass: GlassType; mode: DisplayMode }) {
  return (
    <mesh position={[x, y, 0]} castShadow={false}>
      <boxGeometry args={[Math.max(w, 0.001), Math.max(h, 0.001), 0.008]} />
      {mode === 'presentation' ? (
        <meshPhysicalMaterial
          color={glass.colorHex}
          transparent
          opacity={Math.min(0.35 + glass.opacity * 0.4, 0.9)}
          transmission={0.65}
          roughness={0.08}
          thickness={0.02}
          ior={1.45}
        />
      ) : (
        <meshStandardMaterial color={glass.colorHex} transparent opacity={0.25 + glass.opacity * 0.5} roughness={0.2} />
      )}
    </mesh>
  );
}

function FixedCell({ x, y, w, h, rows, color, glass, mode }: { x: number; y: number; w: number; h: number; rows: number; color: string; glass: GlassType; mode: DisplayMode }) {
  const cellH = h / rows;
  return (
    <group>
      {Array.from({ length: rows }).map((_, r) => (
        <GlassPane key={r} x={x} y={y - h / 2 + r * cellH + cellH / 2} w={w - 0.02} h={cellH - 0.02} glass={glass} mode={mode} />
      ))}
      {Array.from({ length: rows - 1 }).map((_, r) => (
        <ProfileBox key={`hi-${r}`} x={x} y={y - h / 2 + (r + 1) * cellH} z={0} w={w} h={IMPOST_FACE_M} d={DEPTH_M} color={color} />
      ))}
    </group>
  );
}

function DoorLeaf({
  x,
  y,
  w,
  h,
  opening,
  color,
  glass,
  mode,
  open,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  opening: Section['opening'];
  color: string;
  glass: GlassType;
  mode: DisplayMode;
  open: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const isSlide = opening === 'slideLeft' || opening === 'slideRight';
  const dir = opening === 'slideLeft' || opening === 'swingLeft' ? -1 : 1;

  useFrame((_, delta) => {
    const target = open ? 1 : 0;
    progress.current += (target - progress.current) * Math.min(delta * 4, 1);
    if (!group.current) return;
    if (isSlide) {
      group.current.position.x = x + dir * w * 0.94 * progress.current;
      group.current.rotation.y = 0;
    } else {
      group.current.position.x = x;
      const hinge = dir === 1 ? -w / 2 : w / 2;
      group.current.position.x = x + hinge;
      group.current.rotation.y = -dir * (Math.PI / 2.1) * progress.current;
    }
  });

  const gap = 0.008;
  const fw = w - gap * 2;
  const fh = h - gap * 2;
  const hinge = !isSlide ? (dir === 1 ? -w / 2 : w / 2) : 0;
  const localX = !isSlide ? -hinge : 0;

  return (
    <group ref={group} position={[x, y, 0]}>
      <group position={[isSlide ? 0 : localX, 0, 0]}>
        <ProfileBox x={0} y={fh / 2 - LEAF_FACE_M / 2} z={0} w={fw} h={LEAF_FACE_M} d={DEPTH_M} color={color} />
        <ProfileBox x={0} y={-fh / 2 + LEAF_FACE_M / 2} z={0} w={fw} h={LEAF_FACE_M} d={DEPTH_M} color={color} />
        <ProfileBox x={-fw / 2 + LEAF_FACE_M / 2} y={0} z={0} w={LEAF_FACE_M} h={fh} d={DEPTH_M} color={color} />
        <ProfileBox x={fw / 2 - LEAF_FACE_M / 2} y={0} z={0} w={LEAF_FACE_M} h={fh} d={DEPTH_M} color={color} />
        <GlassPane x={0} y={0} w={fw - LEAF_FACE_M * 2} h={fh - LEAF_FACE_M * 2} glass={glass} mode={mode} />
        <mesh position={[dir === 1 ? fw / 2 - LEAF_FACE_M - 0.02 : -fw / 2 + LEAF_FACE_M + 0.02, 0, 0.03]}>
          <boxGeometry args={[0.012, 0.22, 0.012]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function Model({ product, glassTypes, profileColorHex, mode, open }: SceneProps) {
  const W = product.widthMm / 1000;
  const H = product.heightMm / 1000;

  const sections = useMemo(() => {
    const rawSum = product.sections.reduce((s, sec) => s + sec.widthMm, 0) || 1;
    let cursor = -W / 2;
    return product.sections.map((sec) => {
      const w = (sec.widthMm / rawSum) * W;
      const box = { sec, x: cursor + w / 2, w };
      cursor += w;
      return box;
    });
  }, [product.sections, W]);

  const glassOf = (id: string) => glassTypes.find((g) => g.id === id) ?? glassTypes[0];

  return (
    <group position={[0, H / 2, 0]}>
      {/* коробка */}
      <ProfileBox x={0} y={H / 2 - FACE_M / 2} z={0} w={W} h={FACE_M} d={DEPTH_M} color={profileColorHex} />
      <ProfileBox x={0} y={-H / 2 + FACE_M / 2} z={0} w={W} h={FACE_M} d={DEPTH_M} color={profileColorHex} />
      <ProfileBox x={-W / 2 + FACE_M / 2} y={0} z={0} w={FACE_M} h={H} d={DEPTH_M} color={profileColorHex} />
      <ProfileBox x={W / 2 - FACE_M / 2} y={0} z={0} w={FACE_M} h={H} d={DEPTH_M} color={profileColorHex} />

      {sections.slice(0, -1).map((b, i) => (
        <ProfileBox key={`vi-${i}`} x={b.x + b.w / 2} y={0} z={0} w={IMPOST_FACE_M} h={H - FACE_M * 2} d={DEPTH_M} color={profileColorHex} />
      ))}

      {sections.map((b, idx) => {
        const innerW = b.w - (idx === 0 || idx === sections.length - 1 ? FACE_M * 1.2 : IMPOST_FACE_M);
        const glass = glassOf(b.sec.glassTypeId);
        if (isDoor(b.sec.opening)) {
          return (
            <DoorLeaf
              key={b.sec.id}
              x={b.x}
              y={0}
              w={innerW}
              h={H - FACE_M * 2}
              opening={b.sec.opening}
              color={profileColorHex}
              glass={glass}
              mode={mode}
              open={open}
            />
          );
        }
        return (
          <FixedCell
            key={b.sec.id}
            x={b.x}
            y={0}
            w={innerW}
            h={H - FACE_M * 2}
            rows={b.sec.horizontalImposts + 1}
            color={profileColorHex}
            glass={glass}
            mode={mode}
          />
        );
      })}
    </group>
  );
}

function CameraRig({ view, widthM, heightM }: { view: ViewPreset; widthM: number; heightM: number }) {
  const { camera, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3; update: () => void } | null };
  useEffect(() => {
    const dist = Math.max(widthM, heightM) * 1.6 + 1.2;
    const targetY = heightM / 2;
    const positions: Record<ViewPreset, [number, number, number]> = {
      front: [0, targetY, dist],
      side: [dist, targetY, 0],
      top: [0, dist + heightM, 0.01],
      iso: [dist * 0.75, targetY + heightM * 0.4, dist * 0.75],
    };
    const [x, y, z] = positions[view];
    camera.position.set(x, y, z);
    camera.lookAt(0, targetY, 0);
    if (controls) {
      controls.target.set(0, targetY, 0);
      controls.update();
    }
  }, [view, widthM, heightM, camera, controls]);
  return null;
}

export interface Scene3DHandle {
  snapshot: () => string | null;
}

export default function Scene3D({
  product,
  glassTypes,
  profileColorHex,
  mode,
  interior,
  open,
  view,
  onReady,
}: SceneProps & { view: ViewPreset; onReady?: (handle: Scene3DHandle) => void }) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const preset = INTERIOR_PRESETS.find((p) => p.id === interior) ?? INTERIOR_PRESETS[0];
  const widthM = product.widthMm / 1000;
  const heightM = product.heightMm / 1000;

  useEffect(() => {
    if (!onReady) return;
    onReady({
      snapshot: () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL('image/png');
      },
    });
  }, [onReady]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
      onCreated={({ gl, scene, camera }) => {
        rendererRef.current = gl;
        sceneRef.current = scene;
        cameraRef.current = camera;
      }}
      camera={{ fov: 40 }}
    >
      <color attach="background" args={[mode === 'presentation' ? preset.sky : '#f1f5f9']} />
      <ambientLight intensity={mode === 'presentation' ? 0.55 : 0.7} />
      <directionalLight position={[3, 5, 4]} intensity={mode === 'presentation' ? 1.2 : 0.9} castShadow />
      <directionalLight position={[-3, 2, -4]} intensity={0.35} />

      {mode === 'presentation' && (
        <>
          <mesh position={[0, -0.001, -1.5]} rotation={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[widthM * 3, heightM * 2.4]} />
            <meshStandardMaterial color={preset.wall} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.001, 0.9]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[widthM * 3.2, 3]} />
            <meshStandardMaterial color={preset.floor} roughness={0.75} />
          </mesh>
        </>
      )}
      {mode === 'technical' && (
        <gridHelper args={[Math.max(widthM, heightM) * 3, 20, '#cbd5e1', '#e2e8f0']} position={[0, 0, 0]} />
      )}

      <Model product={product} glassTypes={glassTypes} profileColorHex={profileColorHex} mode={mode} interior={interior} open={open} />
      <CameraRig view={view} widthM={widthM} heightM={heightM} />
      <OrbitControls makeDefault enablePan={mode === 'technical'} minDistance={0.5} maxDistance={20} target={[0, heightM / 2, 0]} />
    </Canvas>
  );
}
