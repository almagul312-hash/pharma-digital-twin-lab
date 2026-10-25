"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { archiveReport } from "@/tableting/archive";
import { createSession, dismissNotice, selectUi, tick } from "@/tableting/engine";
import type { ActionResult, TabletSession } from "@/tableting/types";

type TabletStore = {
  session: TabletSession;
  act: (run: (session: TabletSession, now: string) => ActionResult) => void;
  tick: (dtMs: number) => void;
  patch: (run: (session: TabletSession) => TabletSession) => void;
  dismiss: (id: string) => void;
  reset: () => void;
};

let locked = false;

export const useTabletStore = create<TabletStore>()(
  persist(
    (set, get) => ({
      session: createSession(),
      act: (run) => {
        if (locked) {
          return;
        }
        locked = true;
        try {
          const now = new Date().toISOString();
          const result = run(get().session, now);
          if (result.session.report && !get().session.report) {
            archiveReport(result.session);
          }
          set({ session: result.session });
        } finally {
          locked = false;
        }
      },
      tick: (dtMs) => {
        const now = new Date().toISOString();
        const session = tick(get().session, dtMs, now);
        if (session !== get().session) {
          set({ session });
        }
      },
      patch: (run) => set({ session: run(get().session) }),
      dismiss: (id) => set({ session: dismissNotice(get().session, id) }),
      reset: () => set({ session: createSession() }),
    }),
    {
      name: "pharma-tableting-session-v1",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session }),
    },
  ),
);

export function patchTablet(run: (session: TabletSession) => TabletSession) {
  useTabletStore.getState().patch(run);
}

export function setTabletView(view: TabletSession["view"]) {
  patchTablet((session) => selectUi(session, { view }));
}
