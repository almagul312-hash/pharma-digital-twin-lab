import { remoteDatabaseStatus } from "@/lib/storage/repository";
import type { SeriesReport, TabletSession } from "@/tableting/types";

const archiveKey = "pharma-tableting-archive-v1";

export type TabletArchiveEntry = {
  savedAt: string;
  report: SeriesReport;
};

export function tabletingStorage() {
  const remote = remoteDatabaseStatus();
  return {
    mode: "local" as const,
    remoteConnected: remote.connected,
    note: remote.reason,
  };
}

export function archiveReport(session: TabletSession) {
  if (typeof window === "undefined" || !session.report) {
    return;
  }
  let previous: TabletArchiveEntry[] = [];
  try {
    const raw = localStorage.getItem(archiveKey);
    if (raw) {
      const parsed = JSON.parse(raw) as TabletArchiveEntry[];
      if (Array.isArray(parsed)) {
        previous = parsed.filter((item) => item && item.report && item.report.seriesId);
      }
    }
  } catch {
    previous = [];
  }
  const next = [{ savedAt: new Date().toISOString(), report: session.report }, ...previous].slice(0, 20);
  localStorage.setItem(archiveKey, JSON.stringify(next));
}

export function readArchive(): TabletArchiveEntry[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(archiveKey);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as TabletArchiveEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
