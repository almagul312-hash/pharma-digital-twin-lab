"use client";

import { useEffect } from "react";
import { equipmentById } from "@/data/equipmentCatalog";
import { nearestEquipmentSlot, zoneSlots } from "@/lib/sceneSlots";
import { useLabStore } from "@/store/useLabStore";

export function useKeyboardMove() {
  const moveHeld = useLabStore((state) => state.moveHeld);
  const dropHeld = useLabStore((state) => state.dropHeld);
  const grab = useLabStore((state) => state.grab);
  const selectedLotId = useLabStore((state) => state.selectedLotId);
  const lots = useLabStore((state) => state.lots);
  const zone = useLabStore((state) => state.zone);
  const choice = useLabStore((state) => state.equipmentChoice);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const lot = lots.find((item) => item.id === selectedLotId);
      if (!lot || lot.place.kind !== "table") {
        return;
      }
      const step = 0.12;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const equipmentId = nearestEquipmentSlot(zone, lot.place.x, lot.place.z, choice);
        dropHeld(
          equipmentId
            ? { kind: "equipment", equipmentId }
            : { kind: "table", zone, x: lot.place.x, z: lot.place.z },
        );
        return;
      }
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        return;
      }
      event.preventDefault();
      grab(lot.id);
      const x = lot.place.x + (event.key === "ArrowRight" ? step : event.key === "ArrowLeft" ? -step : 0);
      const z = lot.place.z + (event.key === "ArrowDown" ? step : event.key === "ArrowUp" ? -step : 0);
      moveHeld(x, z);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choice, dropHeld, grab, lots, moveHeld, selectedLotId, zone]);
}

export function DropZoneButtons() {
  const choice = useLabStore((state) => state.equipmentChoice);
  const selectedLotId = useLabStore((state) => state.selectedLotId);
  const loadOntoEquipment = useLabStore((state) => state.loadOntoEquipment);
  const zone = useLabStore((state) => state.zone);
  if (!selectedLotId) {
    return null;
  }
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {zoneSlots[zone].map((slot) => {
        const id = choice[slot.category];
        return (
          <button
            key={id}
            type="button"
            onClick={() => loadOntoEquipment(selectedLotId, id)}
            className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-navy ring-1 ring-line transition hover:bg-teal-soft active:scale-[0.98]"
          >
            → {equipmentById(id)?.modelName ?? id}
          </button>
        );
      })}
    </div>
  );
}
