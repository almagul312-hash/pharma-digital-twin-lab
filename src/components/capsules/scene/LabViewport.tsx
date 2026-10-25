"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import type { LabCanvas } from "@/components/capsules/scene/LabCanvas";
import type { LabSceneProps } from "@/components/capsules/scene/types";

type CanvasComponent = typeof LabCanvas;

export function LabViewport({
  hint,
  loading,
  error,
  ...scene
}: LabSceneProps & {
  hint: string;
  loading: string;
  error: string;
}) {
  const [CanvasImpl, setCanvasImpl] = useState<CanvasComponent | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    import("@/components/capsules/scene/LabCanvas")
      .then((mod) => {
        if (active) {
          setCanvasImpl(() => mod.LabCanvas);
        }
      })
      .catch(() => {
        if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="relative h-[300px] overflow-hidden rounded-2xl border border-line bg-[#eef6f8] sm:h-[420px]">
        <CanvasBoundary fallback={error}>
          {failed || !CanvasImpl ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
              {failed ? error : loading}
            </div>
          ) : (
            <CanvasImpl {...scene} />
          )}
        </CanvasBoundary>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">{hint}</p>
    </div>
  );
}

class CanvasBoundary extends Component<
  { children: ReactNode; fallback: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
          {this.props.fallback}
        </div>
      );
    }

    return this.props.children;
  }
}
