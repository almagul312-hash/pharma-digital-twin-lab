import { kk } from "@/i18n/locales/kk";
import { ru } from "@/i18n/locales/ru";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

const dictionaries: Record<Locale, Dictionary> = {
  ru,
  kk,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
