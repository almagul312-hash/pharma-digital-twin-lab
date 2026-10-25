"use client";

import { useState } from "react";
import { exampleRecipes } from "@/data/recipes";
import { substances } from "@/data/substances";
import type { Locale } from "@/i18n/config";
import type { SimCopy } from "@/i18n/simCopy";
import { recipeWarnings, scaleRecipe } from "@/lib/recipeMath";
import { massBalance } from "@/lib/balance";
import { useLabStore } from "@/store/useLabStore";
import type { IngredientRole } from "@/types/process";

const roles: IngredientRole[] = [
  "api",
  "filler",
  "binder",
  "disintegrant",
  "glidant",
  "lubricant",
  "wetting",
  "capsule_shell",
];

export function RecipeEditor({ copy, locale }: { copy: SimCopy; locale: Locale }) {
  const recipe = useLabStore((state) => state.recipe);
  const lots = useLabStore((state) => state.lots);
  const loadRecipe = useLabStore((state) => state.loadRecipe);
  const setCapsuleCount = useLabStore((state) => state.setCapsuleCount);
  const updateLine = useLabStore((state) => state.updateLine);
  const addLine = useLabStore((state) => state.addLine);
  const removeLine = useLabStore((state) => state.removeLine);
  const scaled = scaleRecipe(recipe);
  const { warnings } = recipeWarnings(recipe);
  const balance = massBalance(recipe, lots);
  const [newSubstanceId, setNewSubstanceId] = useState("mannitol");

  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-navy">{recipe.modelDisclaimer[locale]}</p>
      <label className="block text-sm font-semibold text-navy">
        {copy.recipe}
        <select
          value={recipe.id}
          onChange={(event) => loadRecipe(event.target.value)}
          className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm"
        >
          {exampleRecipes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name[locale]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold text-navy">
        Caps
        <input
          type="number"
          min={10}
          max={5000}
          value={recipe.targetCapsules}
          onChange={(event) => setCapsuleCount(Number(event.target.value))}
          className="mt-2 w-full rounded-lg border border-line px-3 py-2"
        />
      </label>
      <p className="text-sm text-muted">
        Fill {scaled.fillMgPerCapsule.toFixed(1)} mg/cap · Σ fill {scaled.fillMassG.toFixed(3)} g · size {recipe.capsuleSize}
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="text-muted">
              <th className="py-1 pr-2">INN</th>
              <th className="py-1 pr-2">{copy.roles.api && "Role"}</th>
              <th className="py-1 pr-2">mg/cap</th>
              <th className="py-1 pr-2">g</th>
              <th className="py-1">%</th>
            </tr>
          </thead>
          <tbody>
            {scaled.lines.map((line) => {
              const substance = substances.find((item) => item.id === line.substanceId);
              return (
                <tr key={line.id} className="border-t border-line">
                  <td className="py-2 pr-2 font-medium text-navy">{substance?.name[locale] ?? line.substanceId}</td>
                  <td className="py-2 pr-2">
                    <select
                      value={line.role}
                      onChange={(event) => updateLine(line.id, { role: event.target.value as IngredientRole })}
                      className="rounded border border-line px-1 py-1"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {copy.roles[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={line.mgPerCapsule}
                      onChange={(event) => updateLine(line.id, { mgPerCapsule: Number(event.target.value) })}
                      className="w-20 rounded border border-line px-1 py-1"
                    />
                  </td>
                  <td className="py-2 pr-2">{line.nominalG.toFixed(3)}</td>
                  <td className="py-2">{line.inFill ? line.fractionPercent.toFixed(1) : "—"}</td>
                  <td>
                    <button type="button" onClick={() => removeLine(line.id)} className="text-muted hover:text-navy">
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs font-semibold text-navy">
          INN
          <select
            value={newSubstanceId}
            onChange={(event) => setNewSubstanceId(event.target.value)}
            className="mt-1 block rounded-lg border border-line px-2 py-2 text-sm"
          >
            {substances.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name[locale]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            const substance = substances.find((item) => item.id === newSubstanceId);
            addLine({
              id: `line-${Date.now()}`,
              substanceId: newSubstanceId,
              role: substance?.role ?? "filler",
              mgPerCapsule: 10,
              unit: "mg",
            });
          }}
          className="rounded-lg border border-navy px-3 py-2 text-sm font-semibold text-navy hover:bg-surface"
        >
          +
        </button>
      </div>
      {warnings.length > 0 ? (
        <ul className="list-disc pl-4 text-xs text-amber-800">
          {warnings.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <div className="rounded-xl bg-surface px-3 py-3 text-sm">
        <p className="font-semibold text-navy">{copy.balance}</p>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-muted">{copy.input}</dt>
            <dd>{balance.recipeInputG} g</dd>
          </div>
          <div>
            <dt className="text-muted">{copy.powder}</dt>
            <dd>{balance.powderG} g</dd>
          </div>
          <div>
            <dt className="text-muted">{copy.capsules}</dt>
            <dd>{balance.capsulesG} g</dd>
          </div>
          <div>
            <dt className="text-muted">{copy.rejected}</dt>
            <dd>{balance.rejectedG} g</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted">{copy.gap}</dt>
            <dd>
              {balance.gapG} g · {balance.explained}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
