import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ItemModel } from './Models';
import type { PileItem } from './level';

function Table() {
  return (
    <group>
      {/* Tabletop */}
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[4.2, 4.2, 0.2, 48]} />
        <meshStandardMaterial color="#a06c3a" roughness={0.75} metalness={0.05} />
      </mesh>
      {/* darker rim */}
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[4.2, 0.06, 8, 48]} />
        <meshStandardMaterial color="#7a4d22" roughness={0.8} />
      </mesh>
      {/* wood grain rings (subtle) */}
      {[1.2, 2.2, 3.2].map((r, i) => (
        <mesh key={i} position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.02, r, 64]} />
          <meshBasicMaterial color="#7a4d22" transparent opacity={0.18} />
        </mesh>
      ))}
    </group>
  );
}

interface PileItemMeshProps {
  item: PileItem;
  free: boolean;
  removing: boolean;
  onTap: (id: number) => void;
}

function PileItemMesh({ item, free, removing, onTap }: PileItemMeshProps) {
  const ref = useRef<THREE.Group>(null);
  const targetY = item.y;
  const spawn = useRef(0);
  const removeProg = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    spawn.current = Math.min(1, spawn.current + delta * 3);
    const s = spawn.current;
    const scaleBase = 0.5 + 0.5 * s;
    if (removing) {
      removeProg.current = Math.min(1, removeProg.current + delta * 2.6);
      const p = removeProg.current;
      const sc = scaleBase * (1 - p);
      ref.current.scale.setScalar(Math.max(0.001, sc));
      ref.current.position.y = targetY + p * 2.2;
      ref.current.rotation.y += delta * 6;
    } else {
      ref.current.scale.setScalar(scaleBase);
      ref.current.position.y = targetY + (1 - s) * 1.5;
      // gentle hover when free
      const hover = free ? Math.sin(performance.now() * 0.003 + item.id) * 0.02 : 0;
      ref.current.position.y += hover;
    }
  });

  return (
    <group
      ref={ref}
      position={[item.x, item.y, item.z]}
      rotation={[0, item.rot, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (free && !removing) onTap(item.id);
      }}
    >
      <ItemModel type={item.type} />
      {/* Dim cover for blocked items */}
      {!free && (
        <mesh position={[0, 0.4, 0]}>
          <sphereGeometry args={[0.55, 12, 10]} />
          <meshBasicMaterial color="#000" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

interface SceneProps {
  items: PileItem[];
  freeMap: Record<number, boolean>;
  removingIds: Set<number>;
  onTap: (id: number) => void;
}

export function PileScene({ items, freeMap, removingIds, onTap }: SceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <pointLight position={[-4, 5, -3]} intensity={0.35} color="#ffd699" />
      <pointLight position={[0, 6, 4]} intensity={0.3} color="#a0d8ff" />

      <Table />

      {items.map((item) => (
        <PileItemMesh
          key={item.id}
          item={item}
          free={!!freeMap[item.id]}
          removing={removingIds.has(item.id)}
          onTap={onTap}
        />
      ))}
    </>
  );
}

/* ----------- Tray Item (for the bottom 2D tray we use a small 3D preview) ------- */
export function TrayItemPreview({ type }: { type: import('./items').ItemType }) {
  const ref = useRef<THREE.Group>(null);
  const [appear, setAppear] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / 250);
      setAppear(t);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.6;
  });
  const scale = useMemo(() => 1.05 * (0.4 + 0.6 * appear), [appear]);
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 2]} intensity={1} />
      <group ref={ref} scale={scale} position={[0, -0.2, 0]}>
        <ItemModel type={type} />
      </group>
    </>
  );
}
