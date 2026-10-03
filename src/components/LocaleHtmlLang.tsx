"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isLocale } from "@/i18n/config";

export function LocaleHtmlLang() {
  const pathname = usePathname();

  useEffect(() => {
    const segment = pathname.split("/")[1] ?? "";

    if (isLocale(segment)) {
      document.documentElement.lang = segment;
    }
  }, [pathname]);

  return null;
}
