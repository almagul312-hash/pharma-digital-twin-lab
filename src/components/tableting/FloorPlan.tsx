"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { equipmentForZone, stagesFor, zoneLayout } from "@/tableting/catalog";
import { PressFigure, pressCycle } from "@/components/tableting/PressFigure";
import { ActionButton } from "@/components/tableting/ui";
import { activeLots, moveLot, selectUi } from "@/tableting/engine";
import { useTabletStore } from "@/tableting/store";
import { locationLabel, stageLabel, tx } from "@/tableting/text";
import type { Locale } from "@/i18n/config";
import type { LocationId } from "@/tableting/types";
import { lotTitle, massText } from "@/components/tableting/format";

export function FloorPlan({ locale }: { locale: Locale }) {
  const session = useTabletStore((state) => state.session);
  const act = useTabletStore((state) => state.act);
  const patch = useTabletStore((state) => state.patch);
  const scroller = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const applicable = session.route ? stagesFor(session.route) : [];

  useEffect(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();
      const current = useTabletStore.getState().session.floor.scale;
      const scale = Math.min(1.8, Math.max(0.65, current + (event.deltaY > 0 ? -0.08 : 0.08)));
      useTabletStore.getState().patch((item) => selectUi(item, { floor: { ...item.floor, scale } }));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  function zoom(direction: number) {
    patch((item) => {
      const scale = Math.min(1.8, Math.max(0.65, item.floor.scale + direction));
      return selectUi(item, { floor: { ...item.floor, scale } });
    });
  }

  function reset() {
    patch((item) => selectUi(item, { floor: { x: 0, y: 0, scale: 1 } }));
    scroller.current?.scrollTo({ left: 0, top: 0 });
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>, lotId: string) {
    const stack = document.elementsFromPoint(event.clientX, event.clientY);
    const zone = stack.find((node) => node instanceof HTMLElement && node.dataset.zone);
    setDrag(null);
    if (zone instanceof HTMLElement && zone.dataset.zone) {
      act((current, now) => moveLot(current, lotId, zone.dataset.zone as LocationId, now));
    }
  }

  const scale = session.floor.scale;

  return (
    <div className="flex h-full min-h-[28rem] flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ActionButton type="button" tone="secondary" onClick={() => zoom(0.1)} aria-label={tx(locale, zoomIn)}>
          +
        </ActionButton>
        <ActionButton type="button" tone="secondary" onClick={() => zoom(-0.1)} aria-label={tx(locale, zoomOut)}>
          −
        </ActionButton>
        <ActionButton type="button" tone="quiet" onClick={reset}>
          {tx(locale, resetView)}
        </ActionButton>
        <p className="text-xs text-muted">{tx(locale, dragHint)}</p>
      </div>
      <div ref={scroller} className="min-h-0 flex-1 overflow-auto rounded-2xl border border-line bg-[#e7f4fb]">
        <div style={{ width: 1100 * scale, height: 690 * scale }}>
          <div className="relative" style={{ width: 1100, height: 690, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <svg className="pointer-events-none absolute inset-0" viewBox="0 0 1100 690" aria-hidden="true">
              <path d="M270 110H286M536 110H552M802 110H818M145 206V222M411 206V222M677 206V222M943 206V390M270 470H286" fill="none" stroke="#0b3a6a" strokeWidth="2" opacity="0.35" />
            </svg>
            {zoneLayout.map((zone) => {
              const enabled = !session.route || applicable.includes(zone.stage) || zone.id === "warehouse";
              const lots = activeLots(session).filter((lot) => lot.location === zone.id).slice(0, 6);
              return (
                <button
                  key={zone.id}
                  type="button"
                  data-zone={zone.id}
                  onClick={() =>
                    patch((item) =>
                      selectUi(item, {
                        selectedStage: zone.stage,
                        selectedEquipmentId: zone.id === "press" ? (item.press.kind === "rotary" ? "rotary_press" : "single_punch") : equipmentForZone(zone.id),
                      }),
                    )
                  }
                  className={`absolute rounded-2xl border text-left ${enabled ? "border-navy/20 bg-white/90" : "border-dashed border-line bg-white/45"} ${session.selectedStage === zone.stage ? "ring-2 ring-teal" : ""}`}
                  style={{ left: zone.x, top: zone.y, width: zone.w, height: zone.h }}
                >
                  <span className="block px-3 pt-2 text-sm font-semibold text-navy">{tx(locale, locationLabel[zone.id])}</span>
                  <span className="block px-3 text-xs text-muted">{enabled ? tx(locale, stageLabel[zone.stage]) : tx(locale, notInRoute)}</span>
                  {zone.id === "press" ? (
                    <span className="pointer-events-none mt-1 block px-2">
                      <PressFigure
                        phase={pressCycle(session.job?.elapsedMs ?? 0, session.job?.stage === "compression", session.reducedMotion)}
                        kind={session.press.kind}
                        reduced={session.reducedMotion}
                        caption={session.press.kind === "rotary" ? tx(locale, rotaryCaption) : tx(locale, punchCaption)}
                      />
                    </span>
                  ) : (
                    <span className="block px-3 text-xs text-muted">{lots.length}</span>
                  )}
                </button>
              );
            })}
            {activeLots(session)
              .filter((lot) => lot.location !== "waste")
              .slice(0, 24)
              .map((lot) => {
                const zone = zoneLayout.find((item) => item.id === lot.location);
                if (!zone) {
                  return null;
                }
                const localIndex = activeLots(session).filter((item) => item.location === lot.location).findIndex((item) => item.id === lot.id);
                const left = zone.x + 10 + (localIndex % 2) * Math.min(118, zone.w / 2 - 8);
                const top = zone.y + 52 + Math.floor(localIndex / 2) * 28;
                return (
                  <button
                    key={lot.id}
                    type="button"
                    aria-label={`${lotTitle(locale, lot)}, ${massText(locale, lot.massG)}`}
                    className={`absolute z-10 max-w-40 rounded-full border border-teal bg-white px-2 py-1 text-left text-[11px] font-semibold text-navy shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${drag?.id === lot.id ? "opacity-70" : ""}`}
                    style={drag?.id === lot.id ? { position: "fixed", left: drag.x, top: drag.y, width: 150 } : { left, top }}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId);
                      setDrag({ id: lot.id, x: event.clientX, y: event.clientY });
                      patch((item) => selectUi(item, { selectedLotId: lot.id }));
                    }}
                    onPointerMove={(event) => {
                      if (drag?.id === lot.id) {
                        setDrag({ id: lot.id, x: event.clientX - 40, y: event.clientY - 16 });
                      }
                    }}
                    onPointerUp={(event) => finishDrag(event, lot.id)}
                  >
                    {lotTitle(locale, lot)}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

const zoomIn: { ru: string; en: string; kk: string } = { ru: "Увеличить схему", en: "Zoom in", kk: "Схеманы үлкейту" };
const zoomOut: { ru: string; en: string; kk: string } = { ru: "Уменьшить схему", en: "Zoom out", kk: "Схеманы кішірейту" };
const resetView: { ru: string; en: string; kk: string } = { ru: "Сбросить масштаб", en: "Reset zoom", kk: "Масштабты қалпына келтіру" };
const dragHint: { ru: string; en: string; kk: string } = {
  ru: "Перетащите навеску в допустимую зону. Тот же перенос есть в карточке материала.",
  en: "Drag a portion to an allowed station. The same move is in the material card.",
  kk: "Өлшендіні рұқсат етілген аймаққа сүйреңіз. Дәл сол көшіру материал картасында бар.",
};
const notInRoute: { ru: string; en: string; kk: string } = {
  ru: "Не используется в этом маршруте",
  en: "Not used on this route",
  kk: "Бұл маршрутта қолданылмайды",
};
const punchCaption: { ru: string; en: string; kk: string } = { ru: "Заполнение → прессование → выталкивание", en: "Fill → compress → eject", kk: "Толтыру → престеу → шығару" };
const rotaryCaption: { ru: string; en: string; kk: string } = { ru: "Ротор: 8 учебных станций", en: "Rotor: 8 teaching stations", kk: "Ротор: 8 оқу станциясы" };
