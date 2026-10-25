"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import { InteractiveScene } from "@/components/capsules/scene/InteractiveScene";
import { useLabStore } from "@/store/useLabStore";
import type { ZoneId } from "@/types/process";

export function LabCanvas({ zone }: { zone: ZoneId }) {
  const graphics = useLabStore((state) => state.graphics);
  const physicsDebug = useLabStore((state) => state.physicsDebug);
  const shadows = graphics === "high";

  return (
    <Canvas
      shadows={shadows}
      camera={{ position: [4.2, 2.8, 4.8], fov: 40 }}
      dpr={graphics === "high" ? [1, 1.6] : graphics === "balanced" ? [1, 1.25] : [1, 1]}
      gl={{ antialias: graphics !== "low", powerPreference: graphics === "low" ? "low-power" : "high-performance" }}
    >
      <color attach="background" args={["#e7eef2"]} />
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#f7fbff", "#c5ced6", 0.45]} />
      <directionalLight
        position={[4, 7, 3]}
        intensity={1.2}
        castShadow={shadows}
        shadow-mapSize-width={shadows ? 1024 : 256}
        shadow-mapSize-height={shadows ? 1024 : 256}
      />
      <Suspense fallback={null}>
        <Physics debug={physicsDebug} gravity={[0, -9.81, 0]} numSolverIterations={graphics === "low" ? 2 : 4}>
          <InteractiveScene zone={zone} />
        </Physics>
      </Suspense>
      {graphics === "high" ? <ContactShadows position={[0, 0.01, 0]} opacity={0.28} scale={10} blur={2.2} far={4} /> : null}
      <OrbitControls makeDefault enablePan={false} minDistance={3} maxDistance={9} maxPolarAngle={Math.PI / 2.08} />
    </Canvas>
  );
}
