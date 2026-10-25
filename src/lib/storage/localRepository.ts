import type { LabSnapshot, Repository, SaveResult } from "@/lib/storage/repository";

const KEY = "pharma-lab-snapshot-v1";

function memory(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export const localRepository: Repository = {
  mode: "local",
  async load() {
    const storage = memory();
    if (!storage) {
      return null;
    }
    const raw = storage.getItem(KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as LabSnapshot;
    } catch {
      return null;
    }
  },
  async save(snapshot: LabSnapshot): Promise<SaveResult> {
    const storage = memory();
    if (!storage) {
      return { ok: false, mode: "local", reason: "localStorage недоступен" };
    }
    storage.setItem(KEY, JSON.stringify(snapshot));
    return { ok: true, mode: "local" };
  },
};
