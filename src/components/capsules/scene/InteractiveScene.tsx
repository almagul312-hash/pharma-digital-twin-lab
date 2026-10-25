"use client";

import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Plane, Vector3, type Group, type Mesh } from "three";
import { tools as toolCatalog } from "@/data/tools";
import { equipmentById } from "@/data/equipmentCatalog";
import { nearestEquipmentSlot, zoneSlots } from "@/lib/sceneSlots";
import { useLabStore } from "@/store/useLabStore";
import type { MaterialLot, ToolId, ZoneId } from "@/types/process";
import { EquipLabel } from "@/components/capsules/scene/EquipmentModel";

const metal = "#cfd6de";
const navy = "#0b3a6a";
const teal = "#0e7c74";

function HoverFrame({
  id,
  label,
  labelY,
  position,
  children,
}: {
  id: string;
  label: string;
  labelY: number;
  position: [number, number, number];
  children: ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const selected = useLabStore((state) => state.selectedEquipmentId === id);
  const selectEquipment = useLabStore((state) => state.selectEquipment);
  const running = useLabStore((state) => state.machines[id]?.phase === "running");
  return (
    <group
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHover(true);
        document.body.style.cursor = running ? "not-allowed" : "pointer";
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHover(false);
        document.body.style.cursor = "auto";
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        selectEquipment(id);
      }}
    >
      {children}
      <EquipLabel label={`${label} · прототип`} y={labelY} visible={hover || selected} />
    </group>
  );
}

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
      <RigidBody type="fixed" colliders={false} position={[0, 0.46, 0]}>
        <CuboidCollider args={[2.3, 0.04, 1.1]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[0, 0.78, -1.12]}>
        <CuboidCollider args={[2.35, 0.38, 0.05]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[-2.34, 0.78, 0]}>
        <CuboidCollider args={[0.05, 0.38, 1.15]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[2.34, 0.78, 0]}>
        <CuboidCollider args={[0.05, 0.38, 1.15]} />
      </RigidBody>
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
  return (
    <group>
      <EquipmentColliders zone={zone} />
      {zone === "warehouse" ? (
        <>
          <ScaleRig id={choice.scale} position={[-1.3, 0.5, 0.1]} />
          <MillRig id={choice.mill} position={[0.2, 0.5, 0.55]} />
          <SieveRig id={choice.sieve} position={[1.2, 0.5, 0.55]} />
        </>
      ) : null}
      {zone === "process" ? (
        <>
          <MixerRig id={choice.mixer} position={[-0.9, 0.5, 0]} />
          <GranulatorRig id={choice.granulator} position={[1.1, 0.5, 0]} />
        </>
      ) : null}
      {zone === "drying" ? <DryerRig id={choice.dryer} position={[0, 0.5, 0]} /> : null}
      {zone === "encapsulation" ? (
        <>
          <EncapsulatorRig id={choice.encapsulator} position={[-0.8, 0.5, 0]} />
          <DedusterRig id={choice.deduster} position={[1.1, 0.5, 0]} />
        </>
      ) : null}
      {zone === "qc" || zone === "audit" ? <QcRig id={choice.qc} /> : null}
    </group>
  );
}

function EquipmentColliders({ zone }: { zone: ZoneId }) {
  return (
    <group>
      {zoneSlots[zone].map((slot) => (
        <RigidBody key={slot.category} type="fixed" colliders={false} position={[slot.x, 0.78, slot.z]}>
          <CuboidCollider
            args={slot.category === "dryer" ? [0.55, 0.55, 0.38] : slot.category === "scale" ? [0.32, 0.28, 0.28] : [0.36, 0.36, 0.3]}
          />
        </RigidBody>
      ))}
    </group>
  );
}

const benchPlane = new Plane(new Vector3(0, 1, 0), -0.51);
const hitPoint = new Vector3();

function Lots() {
  const lots = useLabStore((state) => state.lots);
  const zone = useLabStore((state) => state.zone);
  return (
    <group>
      {lots
        .filter((lot) => lot.place.kind === "table" && lot.place.zone === zone)
        .map((lot) => (
          <PhysicalLot key={lot.id} lot={lot} />
        ))}
    </group>
  );
}

function PhysicalLot({ lot }: { lot: MaterialLot }) {
  const body = useRef<RapierRigidBody>(null);
  const heldId = useLabStore((state) => state.heldId);
  const selectedLotId = useLabStore((state) => state.selectedLotId);
  const grab = useLabStore((state) => state.grab);
  const moveHeld = useLabStore((state) => state.moveHeld);
  const dropHeld = useLabStore((state) => state.dropHeld);
  const zone = useLabStore((state) => state.zone);
  const choice = useLabStore((state) => state.equipmentChoice);
  const [hover, setHover] = useState(false);
  const held = heldId === lot.id;
  const place = lot.place.kind === "table" ? lot.place : null;
  const [origin] = useState<[number, number, number]>(() => [place?.x ?? 0, 0.66, place?.z ?? 0]);

  useFrame(() => {
    if (!held || !place || !body.current) {
      return;
    }
    body.current.setNextKinematicTranslation({ x: place.x, y: 0.66, z: place.z });
  });

  useEffect(() => {
    if (held || !place || !body.current) {
      return;
    }
    body.current.setTranslation({ x: place.x, y: 0.66, z: place.z }, true);
    body.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
  }, [held, place]);

  if (!place) {
    return null;
  }

  const selected = lot.id === selectedLotId || held;
  return (
    <RigidBody
      ref={body}
      type={held ? "kinematicPosition" : "dynamic"}
      position={origin}
      colliders={false}
      lockRotations
      linearDamping={8}
      friction={1}
      restitution={0}
      ccd
    >
      <CuboidCollider args={[0.13, 0.14, 0.13]} />
      <mesh
        castShadow
        onPointerOver={(event) => {
          event.stopPropagation();
          setHover(true);
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          setHover(false);
          if (!held) {
            document.body.style.cursor = "auto";
          }
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          const canvas = event.nativeEvent.target;
          if (canvas instanceof Element) {
            canvas.setPointerCapture(event.pointerId);
          }
          grab(lot.id);
          document.body.style.cursor = "grabbing";
        }}
        onPointerMove={(event) => {
          if (useLabStore.getState().heldId !== lot.id) {
            return;
          }
          event.stopPropagation();
          if (!event.ray.intersectPlane(benchPlane, hitPoint)) {
            return;
          }
          moveHeld(hitPoint.x, hitPoint.z);
        }}
        onPointerUp={(event) => {
          if (useLabStore.getState().heldId !== lot.id) {
            return;
          }
          event.stopPropagation();
          document.body.style.cursor = "auto";
          const equipmentId = event.ray.intersectPlane(benchPlane, hitPoint)
            ? nearestEquipmentSlot(zone, hitPoint.x, hitPoint.z, choice)
            : null;
          const current = useLabStore.getState().lots.find((item) => item.id === lot.id);
          const table = current?.place.kind === "table" ? current.place : place;
          dropHeld(equipmentId ? { kind: "equipment", equipmentId } : { kind: "table", zone, x: table.x, z: table.z });
        }}
      >
        <cylinderGeometry args={[selected ? 0.14 : 0.12, 0.13, 0.28, 18]} />
        <meshStandardMaterial
          color={selected ? teal : lot.kind === "capsules" ? "#d7c4a3" : lotColor(lot.kind)}
          emissive={hover || selected ? teal : "#000"}
          emissiveIntensity={hover || selected ? 0.2 : 0}
        />
      </mesh>
      <EquipLabel label={`${lot.name} · прототип`} y={0.28} visible={hover || selected} />
    </RigidBody>
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
  const body = useRef<RapierRigidBody>(null);
  const heldId = useLabStore((state) => state.heldId);
  const moveHeld = useLabStore((state) => state.moveHeld);
  const dropHeld = useLabStore((state) => state.dropHeld);
  const zone = useLabStore((state) => state.zone);
  const held = heldId === `tool:${id}`;
  const [hover, setHover] = useState(false);
  const [origin] = useState<[number, number, number]>(() => [x, 0.62, z]);
  const color = selected || held ? teal : "#d8c4a2";
  const title = toolCatalog.find((tool) => tool.id === id)?.title.ru ?? id;

  useFrame(() => {
    if (!held || !body.current) {
      return;
    }
    const tool = useLabStore.getState().tools.find((item) => item.id === id);
    if (!tool) {
      return;
    }
    body.current.setNextKinematicTranslation({ x: tool.x, y: 0.62, z: tool.z });
  });

  return (
    <RigidBody
      ref={body}
      type={held ? "kinematicPosition" : "dynamic"}
      position={origin}
      colliders={false}
      lockRotations
      linearDamping={8}
      friction={1}
      restitution={0}
    >
      <CuboidCollider args={[0.08, 0.06, 0.08]} />
      <group
        onPointerOver={(event) => {
          event.stopPropagation();
          setHover(true);
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          setHover(false);
          if (!held) {
            document.body.style.cursor = "auto";
          }
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          const canvas = event.nativeEvent.target;
          if (canvas instanceof Element) {
            canvas.setPointerCapture(event.pointerId);
          }
          onGrab();
        }}
        onPointerMove={(event) => {
          if (useLabStore.getState().heldId !== `tool:${id}`) {
            return;
          }
          event.stopPropagation();
          if (!event.ray.intersectPlane(benchPlane, hitPoint)) {
            return;
          }
          moveHeld(hitPoint.x, hitPoint.z);
        }}
        onPointerUp={(event) => {
          if (useLabStore.getState().heldId !== `tool:${id}`) {
            return;
          }
          event.stopPropagation();
          document.body.style.cursor = "auto";
          if (!event.ray.intersectPlane(benchPlane, hitPoint)) {
            dropHeld();
            return;
          }
          dropHeld({ kind: "table", zone, x: hitPoint.x, z: hitPoint.z });
        }}
      >
        {id === "pestle_mortar" ? (
          <>
            <mesh>
              <sphereGeometry args={[0.08, 12, 10]} />
              <meshStandardMaterial color="#f4efe6" roughness={0.45} />
            </mesh>
            <mesh position={[0.07, 0.08, 0]} rotation={[0, 0, 0.6]}>
              <cylinderGeometry args={[0.015, 0.02, 0.16, 8]} />
              <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
          </>
        ) : id === "beaker_100" || id === "beaker_250" ? (
          <mesh>
            <cylinderGeometry args={[id === "beaker_250" ? 0.07 : 0.05, 0.055, 0.12, 16]} />
            <meshStandardMaterial color="#d7eef5" transparent opacity={0.45} roughness={0.05} />
          </mesh>
        ) : id === "cylinder_50" ? (
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.16, 12]} />
            <meshStandardMaterial color="#d7eef5" transparent opacity={0.45} roughness={0.05} />
          </mesh>
        ) : id === "funnel" ? (
          <mesh>
            <coneGeometry args={[0.06, 0.1, 12]} />
            <meshStandardMaterial color="#d7eef5" transparent opacity={0.5} roughness={0.05} />
          </mesh>
        ) : (
          <mesh rotation={[0.4, 0, 0.2]}>
            <boxGeometry args={[id === "scoop" ? 0.12 : 0.1, 0.015, 0.03]} />
            <meshStandardMaterial color={color} metalness={0.55} roughness={0.35} />
          </mesh>
        )}
        <EquipLabel label={`${title} · прототип`} y={0.2} visible={hover || selected || held} />
      </group>
    </RigidBody>
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
    <HoverFrame id={id} position={position} labelY={0.85} label={`${model?.modelName ?? "Весы"} ${mass.toFixed(3)} г`}>
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
    </HoverFrame>
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
    <HoverFrame id={id} position={position} labelY={1.35} label={model?.modelName ?? "Смеситель"}>
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
    </HoverFrame>
  );
}

function GranulatorRig({ id, position }: { id: string; position: [number, number, number] }) {
  const running = useLabStore((state) => state.machines[id]?.phase === "running");
  const model = equipmentById(id);
  const impeller = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (running && impeller.current) {
      impeller.current.rotation.y += delta * 6;
    }
  });
  return (
    <HoverFrame id={id} position={position} labelY={1.1} label={model?.modelName ?? "Гранулятор"}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.42, 0.45, 0.5, 24]} />
        <meshStandardMaterial color={metal} metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh ref={impeller} position={[0, 0.35, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.08]} />
        <meshStandardMaterial color={running ? teal : navy} />
      </mesh>
    </HoverFrame>
  );
}

function DryerRig({ id, position }: { id: string; position: [number, number, number] }) {
  const machine = useLabStore((state) => state.machines[id]);
  const selectEquipment = useLabStore((state) => state.selectEquipment);
  const setMachineParam = useLabStore((state) => state.setMachineParam);
  const open = machine?.params.door === 1 && machine.phase !== "running";
  const temp = machine?.actual.temperature ?? 25;
  const setpoint = machine?.params.temperature ?? 50;
  const vacuum = id.includes("vacuum");
  const model = equipmentById(id);
  return (
    <HoverFrame
      id={id}
      position={position}
      labelY={1.55}
      label={`${model?.modelName ?? "Сушильный шкаф"} ${temp.toFixed(1)} / ${setpoint} °C`}
    >
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.3, 1.2, 0.8]} />
        <meshStandardMaterial color={vacuum ? "#c5d0dc" : "#d9e1e8"} metalness={0.35} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.55, 0.01]}>
        <boxGeometry args={[1.05, 0.9, 0.02]} />
        <meshStandardMaterial color="#9fd4de" transparent opacity={0.35} roughness={0.05} />
      </mesh>
      <mesh
        position={[0.55, 0.7, 0.42]}
        rotation={[0, open ? -0.9 : 0, 0]}
        onPointerDown={(event) => {
          event.stopPropagation();
          selectEquipment(id);
          if (machine?.phase === "running") {
            return;
          }
          setMachineParam("door", machine?.params.door === 1 ? 0 : 1);
        }}
      >
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
    </HoverFrame>
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
    <HoverFrame id={id} position={position} labelY={1.25} label={model?.modelName ?? "Капсулятор"}>
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
    </HoverFrame>
  );
}

function DedusterRig({ id, position }: { id: string; position: [number, number, number] }) {
  const model = equipmentById(id);
  return (
    <HoverFrame id={id} position={position} labelY={1.15} label={model?.modelName ?? "Обеспыливатель"}>
      <mesh position={[0, 0.45, 0]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.9, 16]} />
        <meshStandardMaterial color={metal} metalness={0.45} roughness={0.35} />
      </mesh>
    </HoverFrame>
  );
}

function MillRig({ id, position }: { id: string; position: [number, number, number] }) {
  const model = equipmentById(id);
  const running = useLabStore((state) => state.machines[id]?.phase === "running");
  const rotor = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (running && rotor.current) {
      rotor.current.rotation.y += delta * 4;
    }
  });
  return (
    <HoverFrame id={id} position={position} labelY={0.95} label={model?.modelName ?? "Мельница"}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.55, 0.28, 0.45]} />
        <meshStandardMaterial color={metal} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh ref={rotor} position={[0, 0.48, 0]}>
        <coneGeometry args={[0.16, 0.22, 14]} />
        <meshStandardMaterial color={running ? teal : "#8aa0b0"} />
      </mesh>
    </HoverFrame>
  );
}

function SieveRig({ id, position }: { id: string; position: [number, number, number] }) {
  const model = equipmentById(id);
  const running = useLabStore((state) => state.machines[id]?.phase === "running");
  const deck = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (running && deck.current) {
      deck.current.position.y = 0.12 + Math.sin(clock.elapsedTime * 18) * 0.008;
    }
  });
  return (
    <HoverFrame id={id} position={position} labelY={0.55} label={model?.modelName ?? "Сито"}>
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 20]} />
        <meshStandardMaterial color={metal} metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh ref={deck} position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.02, 20]} />
        <meshStandardMaterial color="#dfe7ee" />
      </mesh>
    </HoverFrame>
  );
}

function QcRig({ id }: { id: string }) {
  const model = equipmentById(id);
  return (
    <HoverFrame id={id} position={[0, 0, 0]} labelY={1.35} label={`${model?.modelName ?? "КК"} · модельные данные`}>
      <mesh position={[-0.7, 0.7, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.45]} />
        <meshStandardMaterial color="#eef3f6" />
      </mesh>
      <mesh position={[0.7, 0.55, 0]}>
        <boxGeometry args={[0.85, 0.5, 0.5]} />
        <meshStandardMaterial color={navy} />
      </mesh>
    </HoverFrame>
  );
}
