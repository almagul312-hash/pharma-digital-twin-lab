export type LabSnapshot = {
  route: string;
  recipe: unknown;
  lots: unknown;
  completed: unknown;
  equipmentChoice: unknown;
  auditLog: unknown;
  qcRuns: unknown;
};

export type SaveResult =
  | { ok: true; mode: "local" }
  | { ok: false; mode: "local" | "remote"; reason: string };

export type Repository = {
  mode: "local" | "remote";
  load: () => Promise<LabSnapshot | null>;
  save: (snapshot: LabSnapshot) => Promise<SaveResult>;
};

export function remoteDatabaseStatus() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return {
      connected: false as const,
      mode: "local" as const,
      reason: "Переменные NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY не заданы. Облачная база не подключена.",
    };
  }
  return {
    connected: false as const,
    mode: "local" as const,
    reason: "Ключи заданы, но подключение не проверялось. Сессия хранится в localStorage браузера.",
  };
}
