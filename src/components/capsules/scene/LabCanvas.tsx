"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { InteractiveScene } from "@/components/capsules/scene/InteractiveScene";
import { useLabStore } from "@/store/useLabStore";
import type { ZoneId } from "@/types/process";

export function LabCanvas({ zone }: { zone: ZoneId }) {
  const graphics = useLabStore((state) => state.graphics);

  return (
    <Canvas
      shadows={graphics === "high"}
      camera={{ position: [4.2, 2.8, 4.8], fov: 40 }}
      dpr={graphics === "high" ? [1, 1.6] : [1, 1.1]}
      gl={{ antialias: graphics === "high" }}
    >
      <color attach="background" args={["#e8eef2"]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#f7fbff", "#b7c2c9", 0.4]} />
      <directionalLight position={[4, 7, 3]} intensity={1.15} castShadow={graphics === "high"} />
      <InteractiveScene zone={zone} />
      {graphics === "high" ? (
        <ContactShadows position={[0, 0.01, 0]} opacity={0.3} scale={10} blur={2.4} far={5} />
      ) : null}
      <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={9} maxPolarAngle={Math.PI / 2.08} />
    </Canvas>
  );
}
