import * as React from "react";
import type { Group } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Environment,
  Lightformer,
  useGLTF,
} from "@react-three/drei";

const MODEL_URL = "/hero-bike.glb";

function Bike({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF(MODEL_URL);
  const group = React.useRef<Group>(null);

  React.useEffect(() => onReady(), [onReady]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.22;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.07;
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} scale={0.55} />
      </Center>
    </group>
  );
}

/**
 * Full-bleed rotating bike. Lighting comes from in-scene Lightformers
 * (no HDR fetched from a CDN) so the metallic parts read correctly.
 * `onReady` fires once the GLB is parsed, letting the parent cross-fade
 * from the static poster image.
 */
export function HeroModel({ onReady }: { onReady: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 9.5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      {/* Directional lights: spot/point intensities decay physically with
          distance in current three.js, so they'd barely reach the model. */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 7]} intensity={2.2} />
      <directionalLight position={[-6, 3, -4]} intensity={0.9} />
      <React.Suspense fallback={null}>
        <Bike onReady={onReady} />
        <ContactShadows position={[0, -2.2, 0]} opacity={0.5} scale={16} blur={2.4} far={4.5} />
        <Environment resolution={256}>
          <Lightformer
            form="rect"
            intensity={4}
            position={[0, 6, 0]}
            rotation-x={Math.PI / 2}
            scale={[12, 12, 1]}
          />
          <Lightformer
            form="rect"
            intensity={3}
            position={[-7, 2, 6]}
            rotation-y={Math.PI / 4}
            scale={[7, 4, 1]}
          />
          <Lightformer
            form="rect"
            intensity={2.5}
            position={[7, 2, -6]}
            rotation-y={-Math.PI / 3}
            scale={[7, 4, 1]}
          />
        </Environment>
      </React.Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
