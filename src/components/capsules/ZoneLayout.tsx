"use client";

import type { ReactNode } from "react";
import { LabViewport } from "@/components/capsules/scene/LabViewport";
import type { ZoneId } from "@/types/process";

export function ZoneLayout({
  zone,
  hint,
  loading,
  error,
  children,
}: {
  zone: ZoneId;
  hint: string;
  loading: string;
  error: string;
  children: ReactNode;
}) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
      <div className="min-w-0 space-y-4">{children}</div>
      <LabViewport zone={zone} hint={hint} loading={loading} error={error} />
    </div>
  );
}
