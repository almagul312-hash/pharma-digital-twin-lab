"use client";

import { Play } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectView } from "@/components/ProjectView";
import { DigitalTwinWorkspace } from "@/components/capsules/DigitalTwinWorkspace";
import type { Locale } from "@/i18n/config";
import type { LabCopy, ProjectCopy } from "@/i18n/types";
import type { ScreenMode } from "@/types/lab";

export function CapsulesExperience({
  initialWorkspace,
  locale,
  project,
  status,
  backLabel,
  stagesTitle,
  lab,
}: {
  initialWorkspace: boolean;
  locale: Locale;
  project: ProjectCopy;
  status: string;
  backLabel: string;
  stagesTitle: string;
  lab: LabCopy;
}) {
  const [pending, setPending] = useState<ScreenMode | null>(null);
  const [trackedStart, setTrackedStart] = useState(initialWorkspace);
  const router = useRouter();
  const pathname = usePathname();

  if (trackedStart !== initialWorkspace) {
    setTrackedStart(initialWorkspace);
    setPending(null);
  }

  const screen: ScreenMode = pending ?? (initialWorkspace ? "workspace" : "menu");

  function openWorkspace() {
    setPending("workspace");
    router.replace(`${pathname}?start=1`, { scroll: false });
  }

  function returnToMenu() {
    setPending("menu");
    router.replace(pathname, { scroll: false });
  }

  if (screen === "workspace") {
    return <DigitalTwinWorkspace copy={lab} locale={locale} onBack={returnToMenu} />;
  }

  return (
    <ProjectView
      locale={locale}
      project={project}
      status={status}
      backLabel={backLabel}
      structureTitle={lab.structureTitle}
      structureText={lab.structureText}
      stagesTitle={stagesTitle}
      comingSoon={lab.stagesNote}
      action={
        <div className="flex flex-col gap-4 rounded-2xl border border-teal/30 bg-teal-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-navy">{lab.startTitle}</h2>
            <p className="mt-2 leading-relaxed">{lab.startText}</p>
          </div>
          <button
            type="button"
            onClick={openWorkspace}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <Play className="h-5 w-5" aria-hidden="true" />
            {lab.start}
          </button>
        </div>
      }
    />
  );
}
