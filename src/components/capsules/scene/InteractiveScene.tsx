"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { Group, Mesh } from "three";
import { equipmentById } from "@/data/equipmentCatalog";
import { nearestEquipmentSlot, zoneSlots } from "@/lib/sceneSlots";
import { useLabStore } from "@/store/useLabStore";
import type { ToolId, ZoneId } from "@/types/process";
import { EquipLabel } from "@/components/capsules/scene/EquipmentModel";

const metal = "#cfd6de";
const navy = "#0b3a6a";
const teal = "#0e7c74";

export function InteractiveScene({ zone }: { zone: ZoneId }) {
  const graphics = useLabStore((state) => state.graphics);
  return (
    <group>
      <Bench />
      {graphics === "high" ? <Cabinets /> : null}
      <ZoneMachines zone={zone} />
      <DropHighlights zone={zone} />
      <Lots />
      <Tools />
      <DropPlane zone={zone} />
    </group>
  );
}

function Bench() {
  return (
    <group>
      <mesh position={[0, 0.46, 0]} receiveShadow>
        <boxGeometry args={[4.6, 0.08, 2.2]} />
        <meshStandardMaterial color="#e8eef2" metalness={0.35} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[4.4, 0.4, 2]} />
        <meshStandardMaterial color="#9aa7b4" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#dfe7ec" />
      </mesh>
    </group>
  );
}

function Cabinets() {
  return (
    <group>
      <mesh position={[-2.4, 1.3, -1.15]}>
        <boxGeometry args={[1.4, 1.6, 0.4]} />
        <meshStandardMaterial color="#f4f7f8" />
      </mesh>
      <mesh position={[2.4, 1.3, -1.15]}>
        <boxGeometry args={[1.4, 1.6, 0.4]} />
        <meshStandardMaterial color="#f4f7f8" />
      </mesh>
    </group>
  );
}

function ZoneMachines({ zone }: { zone: ZoneId }) {
  const choice = useLabStore((state) => state.equipmentChoice);
  if (zone === "warehouse") {
    return (
      <>
        <ScaleRig id={choice.scale} position={[-1.3, 0.5, 0.1]} />
        <MillRig position={[0.2, 0.5, 0.55]} />
        <SieveRig position={[1.2, 0.5, 0.55]} />
      </>
    );
  }
  if (zone === "process") {
    return (
      <>
        <MixerRig id={choice.mixer} position={[-0.9, 0.5, 0]} />
        <GranulatorRig position={[1.1, 0.5, 0]} />
      </>
    );
  }
  if (zone === "drying") {
    return <DryerRig id={choice.dryer} position={[0, 0.5, 0]} />;
  }
  if (zone === "encapsulation") {
    return (
      <>
        <EncapsulatorRig id={choice.encapsulator} position={[-0.8, 0.5, 0]} />
        <DedusterRig position={[1.1, 0.5, 0]} />
      </>
    );
  }
  return <QcRig />;
}

function Lots() {
  const lots = useLabStore((state) => state.lots);
  const zone = useLabStore((state) => state.zone);
  const selectedLotId = useLabStore((state) => state.selectedLotId);
  const grab = useLabStore((state) => state.grab);
  const dropHeld = useLabStore((state) => state.dropHeld);
  const heldId = useLabStore((state) => state.heldId);
  const choice = useLabStore((state) => state.equipmentChoice);
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <group>
      {lots
        .filter((lot) => lot.place.kind === "table" && lot.place.zone === zone)
        .map((lot) => {
          const x = lot.place.kind === "table" ? lot.place.x : 0;
          const z = lot.place.kind === "table" ? lot.place.z : 0;
          const selected = lot.id === selectedLotId || lot.id === heldId || lot.id === hoverId;
          return (
            <mesh
              key={lot.id}
              position={[x, 0.68, z]}
              castShadow
              onPointerOver={(event) => {
                event.stopPropagation();
                setHoverId(lot.id);
              }}
              onPointerOut={() => setHoverId(null)}
              onPointerDown={(event) => {
                event.stopPropagation();
                grab(lot.id);
              }}
              onPointerUp={(event) => {
                if (!heldId) {
                  return;
                }
                event.stopPropagation();
                const equipmentId = nearestEquipmentSlot(zone, event.point.x, event.point.z, choice);
                dropHeld(
                  equipmentId
                    ? { kind: "equipment", equipmentId }
                    : { kind: "table", zone, x: event.point.x, z: event.point.z },
                );
              }}
            >
              <cylinderGeometry args={[selected ? 0.14 : 0.12, 0.13, 0.28, 18]} />
              <meshStandardMaterial
                color={selected ? teal : lot.kind === "capsules" ? "#d7c4a3" : lotColor(lot.kind)}
                emissive={selected ? teal : "#000"}
                emissiveIntensity={selected ? 0.18 : 0}
              />
            </mesh>
          );
        })}
    </group>
  );
}

function lotColor(kind: string) {
  if (kind === "milled" || kind === "sieved") {
    return "#6f8aa3";
  }
  if (kind === "blend" || kind === "preblend" || kind === "final_blend") {
    return "#7a9e8a";
  }
  if (kind === "wet_mass" || kind === "granules_wet") {
    return "#8b6f4e";
  }
  if (kind === "granules_dry" || kind === "granules_sized") {
    return "#c4a574";
  }
  return "#8fa4b8";
}

function Tools() {
  const tools = useLabStore((state) => state.tools);
  const zone = useLabStore((state) => state.zone);
  const selectedToolId = useLabStore((state) => state.selectedToolId);
  const grabTool = useLabStore((state) => state.grabTool);
  return (
    <group>
      {tools
        .filter((tool) => tool.zone === zone)
        .map((tool) => (
          <ToolMesh
            key={tool.id}
            id={tool.id}
            x={tool.x}
            z={tool.z}
            selected={selectedToolId === tool.id}
            onGrab={() => grabTool(tool.id)}
          />
        ))}
    </group>
  );
}

function ToolMesh({
  id,
  x,
  z,
  selected,
  onGrab,
}: {
  id: ToolId;
  x: number;
  z: number;
  selected: boolean;
  onGrab: () => void;
}) {
  const color = selected ? teal : "#d8c4a2";
  return (
    <group
      position={[x, 0.58, z]}
      onPointerDown={(event) => {
        event.stopPropagation();
        onGrab();
      }}
    >
      {id === "pestle_mortar" ? (
        <>
          <mesh>
            <sphereGeometry args={[0.08, 12, 10]} />
            <meshStandardMaterial color="#e8e0d4" />
          </mesh>
          <mesh position={[0.07, 0.08, 0]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.015, 0.02, 0.16, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </>
      ) : id === "beaker_100" || id === "beaker_250" ? (
        <mesh>
          <cylinderGeometry args={[id === "beaker_250" ? 0.07 : 0.05, 0.055, 0.12, 16]} />
          <meshStandardMaterial color="#c5e4ee" transparent opacity={0.55} />
        </mesh>
      ) : id === "cylinder_50" ? (
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.16, 12]} />
          <meshStandardMaterial color="#c5e4ee" transparent opacity={0.5} />
        </mesh>
      ) : id === "funnel" ? (
        <mesh rotation={[0, 0, 0]}>
          <coneGeometry args={[0.06, 0.1, 12]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ) : (
        <mesh rotation={[0.4, 0, 0.2]}>
          <boxGeometry args={[id === "scoop" ? 0.12 : 0.1, 0.015, 0.03]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} />
        </mesh>
      )}
    </group>
  );
}

function DropHighlights({ zone }: { zone: ZoneId }) {
  const heldId = useLabStore((state) => state.heldId);
  if (!heldId) {
    return null;
  }
  return (
    <group>
      {zoneSlots[zone].map((slot) => (
        <mesh key={`${slot.category}-${slot.x}`} rotation={[-Math.PI / 2, 0, 0]} position={[slot.x, 0.505, slot.z]}>
          <circleGeometry args={[0.32, 24]} />
          <meshBasicMaterial color={teal} transparent opacity={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function DropPlane({ zone }: { zone: ZoneId }) {
  const dropHeld = useLabStore((state) => state.dropHeld);
  const moveHeld = useLabStore((state) => state.moveHeld);
  const heldId = useLabStore((state) => state.heldId);
  const choice = useLabStore((state) => state.equipmentChoice);
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.51, 0]}
      onPointerMove={(event) => {
        if (!heldId) {
          return;
        }
        moveHeld(event.point.x, event.point.z);
      }}
      onPointerUp={(event) => {
        if (!heldId) {
          return;
        }
        const equipmentId = nearestEquipmentSlot(zone, event.point.x, event.point.z, choice);
        dropHeld(
          equipmentId
            ? { kind: "equipment", equipmentId }
            : { kind: "table", zone, x: event.point.x, z: event.point.z },
        );
      }}
    >
      <planeGeometry args={[4.6, 2.2]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function ScaleRig({ id, position }: { id: string; position: [number, number, number] }) {
  const model = equipmentById(id);
  const lots = useLabStore((state) => state.lots);
  const loaded = lots.filter((lot) => lot.place.kind === "equipment" && lot.place.equipmentId === id);
  const mass = loaded.reduce((sum, lot) => sum + lot.massG, 0);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.9, 0.08, 0.7]} />
        <meshStandardMaterial color={metal} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
        <meshStandardMaterial color="#f7fbfc" />
      </mesh>
      <mesh position={[0, 0.42, -0.22]}>
        <boxGeometry args={[0.42, 0.28, 0.08]} />
        <meshStandardMaterial color={navy} />
      </mesh>
      <EquipLabel label={`${model?.modelName ?? "Scale"} ${mass.toFixed(3)} g`} y={0.85} />
    </group>
  );
}

function MixerRig({ id, position }: { id: string; position: [number, number, number] }) {
  const machine = useLabStore((state) => state.machines[id]);
  const running = machine?.phase === "running";
  const shell = useRef<Group>(null);
  const powder = useRef<Group>(null);
  const model = equipmentById(id);
  const kind = id.includes("paddle") ? "paddle" : id.includes("drum") ? "drum" : id.includes("double") ? "cone" : "v";
  useFrame((_, delta) => {
    if (!running) {
      return;
    }
    if (shell.current) {
      if (kind === "drum") {
        shell.current.rotation.x += delta * 1.1;
      } else if (kind === "paddle") {
        shell.current.rotation.y += delta * 2.2;
      } else {
        shell.current.rotation.z += delta * (kind === "v" ? 1.4 : 1.1);
      }
    }
    if (powder.current) {
      powder.current.rotation.y += delta * 1.6;
      powder.current.position.y = 0.55 + Math.sin(performance.now() / 220) * 0.04;
    }
  });
  const live = running ? teal : metal;
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.12, 16]} />
        <meshStandardMaterial color={navy} />
      </mesh>
      <group ref={shell} position={[0, 0.55, 0]}>
        {kind === "v" ? (
          <>
            <mesh position={[-0.22, 0.15, 0]} rotation={[0, 0, 0.45]}>
              <cylinderGeometry args={[0.16, 0.2, 0.7, 16]} />
              <meshStandardMaterial color={live} metalness={0.45} roughness={0.28} />
            </mesh>
            <mesh position={[0.22, 0.15, 0]} rotation={[0, 0, -0.45]}>
              <cylinderGeometry args={[0.16, 0.2, 0.7, 16]} />
              <meshStandardMaterial color={live} metalness={0.45} roughness={0.28} />
            </mesh>
          </>
        ) : null}
        {kind === "cone" ? (
          <>
            <mesh position={[0, 0.22, 0]}>
              <coneGeometry args={[0.32, 0.45, 16]} />
              <meshStandardMaterial color={live} metalness={0.45} roughness={0.28} />
            </mesh>
            <mesh position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.32, 0.45, 16]} />
              <meshStandardMaterial color={live} metalness={0.45} roughness={0.28} />
            </mesh>
          </>
        ) : null}
        {kind === "drum" ? (
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.85, 24]} />
            <meshStandardMaterial color={live} metalness={0.45} roughness={0.28} />
          </mesh>
        ) : null}
        {kind === "paddle" ? (
          <>
            <mesh>
              <cylinderGeometry args={[0.38, 0.4, 0.55, 24]} />
              <meshStandardMaterial color={metal} metalness={0.4} roughness={0.32} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.7, 0.04, 0.08]} />
              <meshStandardMaterial color={navy} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.7, 0.04, 0.08]} />
              <meshStandardMaterial color={navy} />
            </mesh>
          </>
        ) : null}
      </group>
      {running ? (
        <group ref={powder} position={[0, 0.55, 0]}>
          <mesh position={[-0.08, 0, 0.05]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#c4b08a" />
          </mesh>
          <mesh position={[0.07, 0.04, -0.04]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#a89070" />
          </mesh>
        </group>
      ) : null}
      <EquipLabel label={model?.modelName ?? "Mixer"} y={1.35} />
    </group>
  );
}

function GranulatorRig({ position }: { position: [number, number, number] }) {
  const running = useLabStore((state) => state.machines[state.equipmentChoice.granulator]?.phase === "running");
  const impeller = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (running && impeller.current) {
      impeller.current.rotation.y += delta * 6;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.42, 0.45, 0.5, 24]} />
        <meshStandardMaterial color={metal} metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh ref={impeller} position={[0, 0.35, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.08]} />
        <meshStandardMaterial color={navy} />
      </mesh>
      <EquipLabel label="HS granulator" y={1.1} />
    </group>
  );
}

function DryerRig({ id, position }: { id: string; position: [number, number, number] }) {
  const machine = useLabStore((state) => state.machines[id]);
  const open = machine?.phase === "ready" || machine?.phase === "idle";
  const temp = machine?.actual.temperature ?? 25;
  const setpoint = machine?.params.temperature ?? 50;
  const vacuum = id.includes("vacuum");
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.3, 1.2, 0.8]} />
        <meshStandardMaterial color={vacuum ? "#c5d0dc" : "#d9e1e8"} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.55, 0.01]}>
        <boxGeometry args={[1.05, 0.9, 0.02]} />
        <meshStandardMaterial color="#9fd4de" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.55, 0.7, 0.42]} rotation={[0, open ? -0.9 : 0, 0]}>
        <boxGeometry args={[0.06, 1.15, 0.78]} />
        <meshStandardMaterial color={navy} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.05, 0.02, 0.6]} />
        <meshStandardMaterial color={metal} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.05, 0.02, 0.6]} />
        <meshStandardMaterial color={metal} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.05, 0.02, 0.6]} />
        <meshStandardMaterial color={metal} />
      </mesh>
      <mesh position={[0.35, 1.22, 0.2]}>
        <boxGeometry args={[0.28, 0.12, 0.08]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {vacuum ? (
        <mesh position={[-0.55, 1.05, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#4a6578" metalness={0.5} />
        </mesh>
      ) : null}
      <EquipLabel label={`${vacuum ? "Vac " : ""}Dryer ${temp.toFixed(1)} / ${setpoint} °C`} y={1.55} />
    </group>
  );
}

function EncapsulatorRig({ id, position }: { id: string; position: [number, number, number] }) {
  const running = useLabStore((state) => state.machines[id]?.phase === "running");
  const turret = useRef<Mesh>(null);
  const model = equipmentById(id);
  const auto = id.includes("auto") || id.includes("semi");
  useFrame((_, delta) => {
    if (running && turret.current) {
      turret.current.rotation.y += delta * (id.includes("auto") ? 2.2 : 1.2);
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[auto ? 1.35 : 1.05, 0.18, 0.7]} />
        <meshStandardMaterial color={navy} />
      </mesh>
      {auto ? (
        <mesh ref={turret} position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.12, 20]} />
          <meshStandardMaterial color={running ? teal : metal} />
        </mesh>
      ) : (
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[0.85, 0.08, 0.5]} />
          <meshStandardMaterial color={metal} />
        </mesh>
      )}
      <mesh position={[auto ? 0.35 : 0, 0.72, -0.12]}>
        <boxGeometry args={[0.32, 0.38, 0.22]} />
        <meshStandardMaterial color="#c5a572" />
      </mesh>
      {id.includes("auto") ? (
        <mesh position={[0.55, 0.35, 0.15]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.5, 0.06, 0.12]} />
          <meshStandardMaterial color={running ? teal : metal} />
        </mesh>
      ) : null}
      <EquipLabel label={model?.modelName ?? "Encapsulator"} y={1.25} />
    </group>
  );
}

function DedusterRig({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.9, 16]} />
        <meshStandardMaterial color={metal} />
      </mesh>
      <EquipLabel label="Deduster" y={1.15} />
    </group>
  );
}

function MillRig({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.55, 0.28, 0.45]} />
        <meshStandardMaterial color={metal} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <coneGeometry args={[0.16, 0.22, 14]} />
        <meshStandardMaterial color={teal} />
      </mesh>
      <EquipLabel label="Mill" y={0.95} />
    </group>
  );
}

function SieveRig({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 20]} />
        <meshStandardMaterial color={metal} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.02, 20]} />
        <meshStandardMaterial color="#dfe7ee" />
      </mesh>
      <EquipLabel label="Sieve 1.0 mm" y={0.55} />
    </group>
  );
}

function QcRig() {
  return (
    <group>
      <mesh position={[-0.7, 0.7, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.45]} />
        <meshStandardMaterial color="#eef3f6" />
      </mesh>
      <mesh position={[0.7, 0.55, 0]}>
        <boxGeometry args={[0.85, 0.5, 0.5]} />
        <meshStandardMaterial color={navy} />
      </mesh>
      <EquipLabel label="QC bench (model data)" y={1.35} />
    </group>
  );
}
