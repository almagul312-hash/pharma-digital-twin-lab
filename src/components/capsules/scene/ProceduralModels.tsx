"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { useLabStore } from "@/store/useLabStore";
import { EquipmentModel } from "@/components/capsules/scene/EquipmentModel";
import type { LabSceneProps } from "@/components/capsules/scene/types";

const metal = "#d5dbe3";
const navy = "#0b3a6a";
const teal = "#0e7c74";
const glass = "#b7e0ea";

export function LabScene({ zone, labels, models }: LabSceneProps) {
  return (
    <group>
      <Platform />
      {zone === "warehouse" ? (
        <>
          <ScaleModel label={labels.scale} src={models?.scale} />
          <MillModel label={labels.miller} src={models?.miller} />
          <MixerModel label={labels.mixer} src={models?.mixer} />
        </>
      ) : null}
      {zone === "encapsulation" ? (
        <>
          <EncapsulatorModel label={labels.encapsulator} src={models?.encapsulator} />
          <DedustModel label={labels.deduster} src={models?.deduster} />
        </>
      ) : null}
      {zone === "binder" ? (
        <>
          <BinderModel label={labels.binder} src={models?.binder} />
          <DesiccatorModel label={labels.desiccator} src={models?.desiccator} />
        </>
      ) : null}
      {zone === "qc" ? (
        <>
          <HplcModel label={labels.hplc} src={models?.hplc} />
          <SpectrometerModel label={labels.spectrometer} src={models?.spectrometer} />
        </>
      ) : null}
      {zone === "audit" ? <ArchiveModel label={labels.archive} src={models?.archive} /> : null}
    </group>
  );
}

function Platform() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[3.6, 64]} />
        <meshStandardMaterial color="#f7fbfc" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[3.55, 3.72, 64]} />
        <meshStandardMaterial color={teal} />
      </mesh>
    </group>
  );
}

function ScaleModel({ label, src }: { label: string; src?: string }) {
  return (
    <EquipmentModel src={src} label={label} labelY={1.7} position={[-1.25, 0, 0.15]}>
      <group>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[1.15, 0.12, 0.8]} />
          <meshStandardMaterial color={metal} metalness={0.45} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.7, 0.06, 0.55]} />
          <meshStandardMaterial color="#f4f7f8" />
        </mesh>
        <mesh position={[0, 0.55, -0.28]}>
          <boxGeometry args={[0.12, 0.7, 0.12]} />
          <meshStandardMaterial color={navy} />
        </mesh>
        <mesh position={[0, 0.95, -0.05]}>
          <boxGeometry args={[0.55, 0.28, 0.18]} />
          <meshStandardMaterial color={navy} />
        </mesh>
        <mesh position={[0, 0.95, 0.05]}>
          <boxGeometry args={[0.38, 0.14, 0.02]} />
          <meshStandardMaterial color="#d7fff4" emissive={teal} emissiveIntensity={0.25} />
        </mesh>
      </group>
    </EquipmentModel>
  );
}

function MillModel({ label, src }: { label: string; src?: string }) {
  return (
    <EquipmentModel src={src} label={label} labelY={1.55} position={[0.05, 0, 1.2]}>
      <group>
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.7, 0.4, 0.55]} />
          <meshStandardMaterial color={metal} metalness={0.45} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 20]} />
          <meshStandardMaterial color={navy} />
        </mesh>
        <mesh position={[0, 0.82, 0]}>
          <coneGeometry args={[0.2, 0.28, 16]} />
          <meshStandardMaterial color={teal} />
        </mesh>
      </group>
    </EquipmentModel>
  );
}

function MixerModel({ label, src }: { label: string; src?: string }) {
  const running = useLabStore((state) => state.mixer.running);
  const impeller = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (running && impeller.current) {
      impeller.current.rotation.y += delta * 2.2;
    }
  });

  return (
    <EquipmentModel src={src} label={label} labelY={2.15} position={[1.15, 0, -0.1]}>
      <group>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.55, 0.62, 1.05, 28]} />
          <meshStandardMaterial color={metal} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.12, 0]}>
          <cylinderGeometry args={[0.58, 0.58, 0.08, 28]} />
          <meshStandardMaterial color={navy} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[0.36, 0.42, 0.36]} />
          <meshStandardMaterial color={running ? teal : navy} />
        </mesh>
        <mesh ref={impeller} position={[0, 0.55, 0]}>
          <boxGeometry args={[0.08, 0.7, 0.42]} />
          <meshStandardMaterial color="#8aa0b2" />
        </mesh>
      </group>
    </EquipmentModel>
  );
}

function EncapsulatorModel({ label, src }: { label: string; src?: string }) {
  const running = useLabStore((state) => state.encapsulator.running);
  const turret = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const speed = useLabStore.getState().encapsulator.speed;
    if (running && turret.current) {
      turret.current.rotation.y += delta * (speed / 50);
    }
  });

  return (
    <EquipmentModel src={src} label={label} labelY={1.85} position={[-0.35, 0, 0]}>
      <group>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[2.3, 0.7, 0.85]} />
          <meshStandardMaterial color={metal} metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[-0.7, 1.05, 0]}>
          <cylinderGeometry args={[0.16, 0.32, 0.55, 20]} />
          <meshStandardMaterial color="#9aabb8" />
        </mesh>
        <mesh ref={turret} position={[0.15, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.16, 24]} />
          <meshStandardMaterial color={navy} />
        </mesh>
        <mesh position={[0.95, 0.55, 0.35]}>
          <boxGeometry args={[0.35, 0.22, 0.45]} />
          <meshStandardMaterial color={teal} />
        </mesh>
        <Lamp on={running} position={[1.05, 0.82, 0.2]} />
      </group>
    </EquipmentModel>
  );
}

function DedustModel({ label, src }: { label: string; src?: string }) {
  const on = useLabStore((state) => state.encapsulator.dedusting);

  return (
    <EquipmentModel src={src} label={label} labelY={1.15} position={[1.55, 0, 1.05]}>
      <group>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.9, 0.7, 0.55]} />
          <meshStandardMaterial color="#eef3f6" />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.7, 0.06, 0.4]} />
          <meshStandardMaterial color={on ? teal : "#c5d0d8"} />
        </mesh>
        <Lamp on={on} position={[0.28, 0.7, 0.28]} />
      </group>
    </EquipmentModel>
  );
}

function BinderModel({ label, src }: { label: string; src?: string }) {
  const running = useLabStore((state) => state.binder.running);

  return (
    <EquipmentModel src={src} label={label} labelY={2.15} position={[-1.15, 0, 0]}>
      <group>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[1.25, 1.8, 0.95]} />
          <meshStandardMaterial color={metal} metalness={0.35} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.02, 0.49]}>
          <boxGeometry args={[0.82, 1.15, 0.04]} />
          <meshStandardMaterial
            color={glass}
            transparent
            opacity={0.45}
            roughness={0.05}
          />
        </mesh>
        <mesh position={[0, 1.02, 0.42]}>
          <boxGeometry args={[0.62, 0.9, 0.02]} />
          <meshStandardMaterial
            color={running ? "#f6d98a" : "#d5dee6"}
            emissive={running ? "#e0a106" : "#000000"}
            emissiveIntensity={running ? 0.35 : 0}
          />
        </mesh>
        <mesh position={[0.78, 0.85, 0.15]}>
          <boxGeometry args={[0.22, 0.7, 0.4]} />
          <meshStandardMaterial color={navy} />
        </mesh>
        <Lamp on={running} position={[0.78, 1.35, 0.36]} />
      </group>
    </EquipmentModel>
  );
}

function DesiccatorModel({ label, src }: { label: string; src?: string }) {
  const running = useLabStore((state) => state.desiccator.running);

  return (
    <EquipmentModel src={src} label={label} labelY={1.45} position={[1.25, 0, 0.2]}>
      <group>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.5, 32]} />
          <meshStandardMaterial color={glass} transparent opacity={0.55} roughness={0.05} />
        </mesh>
        <mesh position={[0, 0.62, 0]}>
          <sphereGeometry args={[0.48, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={glass} transparent opacity={0.4} roughness={0.05} />
        </mesh>
        <mesh position={[0, 1.08, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={navy} />
        </mesh>
        <mesh position={[0.48, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.28, 12]} />
          <meshStandardMaterial color={running ? teal : "#8aa0b2"} />
        </mesh>
      </group>
    </EquipmentModel>
  );
}

function HplcModel({ label, src }: { label: string; src?: string }) {
  const modules = [0.28, 0.34, 0.3, 0.36];

  return (
    <EquipmentModel src={src} label={label} labelY={2.05} position={[-1.15, 0, 0]}>
      <group>
        {modules.map((height, index) => {
          const y = modules.slice(0, index).reduce((sum, item) => sum + item, 0) + height / 2;
          return (
            <mesh key={index} position={[0, y, 0]}>
              <boxGeometry args={[0.95, height - 0.03, 0.7]} />
              <meshStandardMaterial color={index % 2 === 0 ? "#f4f7f8" : metal} />
            </mesh>
          );
        })}
        <mesh position={[0.62, 0.85, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.7, 12]} />
          <meshStandardMaterial color={teal} />
        </mesh>
        <mesh position={[0, 0.55, 0.36]}>
          <boxGeometry args={[0.45, 0.08, 0.02]} />
          <meshStandardMaterial color="#b7f3df" emissive={teal} emissiveIntensity={0.2} />
        </mesh>
      </group>
    </EquipmentModel>
  );
}

function SpectrometerModel({ label, src }: { label: string; src?: string }) {
  return (
    <EquipmentModel src={src} label={label} labelY={1.35} position={[1.2, 0, 0.1]}>
      <group>
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[1.25, 0.7, 0.75]} />
          <meshStandardMaterial color={metal} metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0.15, 0.38, 0.39]}>
          <boxGeometry args={[0.55, 0.28, 0.04]} />
          <meshStandardMaterial color={navy} />
        </mesh>
        <mesh position={[-0.45, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.08, 20]} />
          <meshStandardMaterial color={glass} />
        </mesh>
      </group>
    </EquipmentModel>
  );
}

function ArchiveModel({ label, src }: { label: string; src?: string }) {
  return (
    <EquipmentModel src={src} label={label} labelY={1.7}>
      <group>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[1.8, 1.3, 0.45]} />
          <meshStandardMaterial color="#e7eef3" />
        </mesh>
        {[-0.55, -0.18, 0.18, 0.55].map((x, index) => (
          <mesh key={x} position={[x, 0.75, 0.18]}>
            <boxGeometry args={[0.22, 0.85, 0.12]} />
            <meshStandardMaterial color={index % 2 === 0 ? navy : teal} />
          </mesh>
        ))}
      </group>
    </EquipmentModel>
  );
}

function Lamp({ on, position }: { on: boolean; position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial
        color={on ? "#3dd68c" : "#9aabba"}
        emissive={on ? "#1faa6a" : "#000000"}
        emissiveIntensity={on ? 0.8 : 0}
      />
    </mesh>
  );
}
