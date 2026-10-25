"use client";

import type { ReactNode } from "react";
import type { LabCopy } from "@/i18n/types";
import { LabViewport } from "@/components/capsules/scene/LabViewport";
import type { SceneLabels } from "@/components/capsules/scene/types";
import type { ZoneId } from "@/types/lab";

export function ZoneLayout({
  copy,
  zone,
  children,
}: {
  copy: LabCopy;
  zone: ZoneId;
  children: ReactNode;
}) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
      <div className="order-2 min-w-0 space-y-4 lg:order-1">{children}</div>
      <div className="order-1 lg:sticky lg:top-28 lg:order-2">
        <LabViewport
          zone={zone}
          labels={sceneLabels(copy)}
          hint={copy.sceneHint}
          loading={copy.canvasLoading}
          error={copy.canvasError}
        />
      </div>
    </div>
  );
}

function sceneLabels(copy: LabCopy): SceneLabels {
  return {
    scale: copy.equipment.scale,
    miller: copy.equipment.miller,
    mixer: copy.equipment.mixer,
    encapsulator: copy.equipment.encapsulator,
    deduster: copy.equipment.deduster,
    binder: copy.equipment.binder,
    desiccator: copy.equipment.desiccator,
    hplc: copy.equipment.hplc,
    spectrometer: copy.equipment.ftir,
    archive: copy.equipment.archive,
  };
}
