import { encapsulateRequires, operationById, operationsFor } from "@/data/operations";
import type { OperationDef, OperationId, Recipe, RouteId } from "@/types/process";

export type OpStatus = "done" | "available" | "blocked";

export type GraphContext = {
  route: RouteId;
  recipe: Recipe;
  completed: OperationId[];
  weighedLineIds: string[];
  hasReleasedMaterials: boolean;
};

function requiresOf(op: OperationDef, route: RouteId): OperationId[] {
  if (op.id === "encapsulate") {
    return encapsulateRequires(route);
  }
  return op.requires;
}

export function isSatisfied(required: OperationId[], completed: OperationId[]) {
  return required.every((id) => completed.includes(id));
}

export function operationStatus(op: OperationDef, ctx: GraphContext): OpStatus {
  if (!op.routes.includes(ctx.route)) {
    return "blocked";
  }
  if (ctx.completed.includes(op.id)) {
    return "done";
  }
  const required = requiresOf(op, ctx.route);
  if (!isSatisfied(required, ctx.completed)) {
    return "blocked";
  }
  if (op.id === "weigh") {
    const fillLines = ctx.recipe.lines.filter((line) => line.role !== "wetting");
    if (fillLines.length > 0 && ctx.weighedLineIds.length < fillLines.length) {
      return "available";
    }
  }
  return "available";
}

export function blockedReason(op: OperationDef, ctx: GraphContext): string | null {
  if (!op.routes.includes(ctx.route)) {
    return "wrong_route";
  }
  if (ctx.completed.includes(op.id)) {
    return null;
  }
  const missing = requiresOf(op, ctx.route).filter((id) => !ctx.completed.includes(id));
  if (missing.length > 0) {
    return `requires:${missing.join(",")}`;
  }
  return null;
}

export function availableOperations(ctx: GraphContext) {
  return operationsFor(ctx.route).filter((op) => operationStatus(op, ctx) === "available");
}

export function canStartOperation(id: OperationId, ctx: GraphContext) {
  const op = operationById(id);
  if (!op) {
    return { ok: false as const, reason: "unknown_operation" };
  }
  const status = operationStatus(op, ctx);
  if (status === "done" && !op.optional) {
    return { ok: false as const, reason: "already_done" };
  }
  if (status === "blocked") {
    return { ok: false as const, reason: blockedReason(op, ctx) ?? "blocked" };
  }
  return { ok: true as const, operation: op };
}

export function nextRequired(ctx: GraphContext) {
  return operationsFor(ctx.route).find(
    (op) => !op.optional && operationStatus(op, ctx) === "available",
  );
}

export function wallSecondsForProcess(processMinutes: number | undefined, hintSec: number) {
  if (processMinutes && processMinutes > 0) {
    return Math.max(10, Math.round(processMinutes * 5));
  }
  return Math.max(8, hintSec);
}

export function explainBlock(reason: string, locale: "ru" | "en" | "kk" = "ru") {
  if (reason.startsWith("requires:")) {
    const ids = reason.slice(9).split(",") as OperationId[];
    const titles = ids.map((id) => operationById(id)?.title[locale] ?? id).join(", ");
    const text = {
      ru: `Сначала выполните: ${titles}. Перемещение в зону не обходит обязательные стадии.`,
      en: `Complete first: ${titles}. Moving a sample into a zone does not skip required steps.`,
      kk: `Алдымен орындаңыз: ${titles}. Аймаққа жылжу міндетті сатыларды айналып өтпейді.`,
    };
    return text[locale];
  }
  const map = {
    wrong_route: {
      ru: "Операция относится к другому технологическому маршруту.",
      en: "This operation belongs to the other manufacturing route.",
      kk: "Операция басқа технологиялық маршрутқа жатады.",
    },
    already_done: {
      ru: "Операция уже выполнена.",
      en: "This operation is already complete.",
      kk: "Операция орындалған.",
    },
    unknown_operation: {
      ru: "Неизвестная операция.",
      en: "Unknown operation.",
      kk: "Белгісіз операция.",
    },
  } as const;
  const known = map[reason as keyof typeof map];
  return known ? known[locale] : reason;
}
