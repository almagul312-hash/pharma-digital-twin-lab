"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Vector3, type Group } from "three";

/**
 * Procedural meshes are the default. Pass `src` (for example `/models/binder-vd.glb`)
 * to render a GLTF/GLB asset in the same place and keep the Html label.
 */
export function EquipmentModel({
  src,
  label,
  labelY = 1.55,
  position = [0, 0, 0],
  children,
}: {
  src?: string;
  label: string;
  labelY?: number;
  position?: [number, number, number];
  children: ReactNode;
}) {
  if (!src) {
    return (
      <group position={position}>
        {children}
        <EquipLabel label={label} y={labelY} />
      </group>
    );
  }

  return (
    <LoadedEquipment src={src} label={label} labelY={labelY} position={position} />
  );
}

function LoadedEquipment({
  src,
  label,
  labelY,
  position,
}: {
  src: string;
  label: string;
  labelY: number;
  position: [number, number, number];
}) {
  const gltf = useGLTF(src);

  return (
    <group position={position}>
      <primitive object={gltf.scene} />
      <EquipLabel label={label} y={labelY} />
    </group>
  );
}

const projected = new Vector3();

/**
 * HTML nameplate anchored to a mesh.
 * drei's <Html> opens a second React root and unmounts it during render on
 * React 19, which tears down the canvas. This label is a plain DOM node in the
 * canvas parent, so a future GLB can keep the same call site.
 */
export function EquipLabel({ label, y = 1.55 }: { label: string; y?: number }) {
  const anchor = useRef<Group>(null);
  const node = useRef<HTMLDivElement | null>(null);
  const { camera, gl, size } = useThree();

  useLayoutEffect(() => {
    const parent = gl.domElement.parentElement;
    if (!parent) {
      return;
    }

    const element = document.createElement("div");
    element.textContent = label;
    element.className =
      "pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap rounded-md bg-navy/90 px-2 py-1 text-[11px] font-semibold text-white shadow";
    parent.appendChild(element);
    node.current = element;

    return () => {
      element.remove();
      node.current = null;
    };
  }, [gl, label]);

  useFrame(() => {
    const element = node.current;
    const group = anchor.current;
    if (!element || !group) {
      return;
    }

    group.getWorldPosition(projected);
    projected.project(camera);
    const x = (projected.x * 0.5 + 0.5) * size.width;
    const yPx = (-projected.y * 0.5 + 0.5) * size.height;
    element.style.transform = `translate(${x}px, ${yPx}px) translate(-50%, -120%)`;
    element.style.visibility = projected.z > 1 ? "hidden" : "visible";
  });

  return <group ref={anchor} position={[0, y, 0]} />;
}
