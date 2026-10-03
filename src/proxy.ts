import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  localeHeaderName,
  type Locale,
} from "@/i18n/config";

const localeCookieMaxAge = 60 * 60 * 24 * 365;

function isPrefetch(request: NextRequest) {
  return (
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose") === "prefetch"
  );
}

function savedLocale(request: NextRequest): Locale {
  const value = request.cookies.get(localeCookieName)?.value;
  return value && isLocale(value) ? value : defaultLocale;
}

function withLocaleHeader(request: NextRequest, locale: Locale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeHeaderName, locale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!isPrefetch(request)) {
    response.cookies.set(localeCookieName, locale, {
      path: "/",
      maxAge: localeCookieMaxAge,
      sameSite: "lax",
    });
  }

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1] ?? "";

  if (isLocale(segment)) {
    return withLocaleHeader(request, segment);
  }

  const locale = savedLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
