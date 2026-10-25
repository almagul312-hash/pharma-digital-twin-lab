"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { LabScene } from "@/components/capsules/scene/ProceduralModels";
import type { LabSceneProps } from "@/components/capsules/scene/types";

export function LabCanvas(props: LabSceneProps) {
  return (
    <Canvas
      camera={{ position: [4.4, 2.5, 4.6], fov: 40 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#eef6f8"]} />
      <ambientLight intensity={0.75} />
      <hemisphereLight args={["#f4fbff", "#c5d0d6", 0.45]} />
      <directionalLight position={[4, 7, 3]} intensity={1.25} />
      <LabScene {...props} />
      <ContactShadows position={[0, 0, 0]} opacity={0.28} scale={9} blur={2.2} far={4} />
      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={8.5}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
