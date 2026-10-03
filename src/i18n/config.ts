export const locales = ["ru", "kk"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export const localeCookieName = "locale";

export const localeHeaderName = "x-locale";

export function isLocale(value: string): value is Locale {
  return value === "ru" || value === "kk";
}

export function withLocale(locale: Locale, href: string) {
  if (href === "/") {
    return `/${locale}`;
  }

  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

export function replaceLocale(pathname: string, locale: Locale) {
  const parts = pathname.split("/");

  if (isLocale(parts[1] ?? "")) {
    parts[1] = locale;
    return parts.join("/") || `/${locale}`;
  }

  return withLocale(locale, pathname);
}

export function stripLocale(pathname: string) {
  const parts = pathname.split("/");

  if (!isLocale(parts[1] ?? "")) {
    return pathname || "/";
  }

  const rest = parts.slice(2).join("/");
  return rest ? `/${rest}` : "/";
}
