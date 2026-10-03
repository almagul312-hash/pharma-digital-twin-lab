"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import {
  localeCookieName,
  replaceLocale,
  stripLocale,
  withLocale,
  type Locale,
} from "@/i18n/config";

export type HeaderItem = {
  href: string;
  label: string;
  emphasized: boolean;
};

type HeaderProps = {
  locale: Locale;
  brandLine1: string;
  brandLine2: string;
  languageLabel: string;
  languageRu: string;
  languageKk: string;
  navLabel: string;
  mobileNavLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  items: HeaderItem[];
};

function isActive(pathname: string, href: string) {
  const current = stripLocale(pathname);

  if (href === "/") {
    return current === "/";
  }

  return current === href || current.startsWith(`${href}/`);
}

function itemClass(active: boolean, emphasized: boolean) {
  const base =
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

  if (emphasized) {
    return active
      ? `${base} bg-navy text-white`
      : `${base} border border-navy text-navy hover:bg-navy hover:text-white`;
  }

  return active
    ? `${base} bg-surface text-navy`
    : `${base} text-foreground hover:bg-surface hover:text-navy`;
}

function rememberLocale(locale: Locale) {
  document.cookie = `${localeCookieName}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function NavLinks({
  locale,
  items,
  pathname,
  onNavigate,
}: {
  locale: Locale;
  items: HeaderItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {items.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={withLocale(locale, item.href)}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={itemClass(active, item.emphasized)}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function LanguageSwitcher({
  locale,
  pathname,
  languageLabel,
  languageRu,
  languageKk,
}: {
  locale: Locale;
  pathname: string;
  languageLabel: string;
  languageRu: string;
  languageKk: string;
}) {
  const options = [
    { locale: "ru" as const, label: languageRu, hrefLang: "ru" },
    { locale: "kk" as const, label: languageKk, hrefLang: "kk" },
  ];

  return (
    <nav aria-label={languageLabel} className="shrink-0">
      <div className="inline-flex items-center rounded-lg border border-navy bg-white p-0.5 text-sm font-semibold">
        {options.map((option, index) => {
          const active = option.locale === locale;

          return (
            <span key={option.locale} className="inline-flex items-center">
              {index > 0 ? (
                <span aria-hidden="true" className="px-0.5 text-muted">
                  |
                </span>
              ) : null}
              <Link
                href={replaceLocale(pathname, option.locale)}
                hrefLang={option.hrefLang}
                prefetch={false}
                aria-current={active ? "true" : undefined}
                onClick={() => rememberLocale(option.locale)}
                className={
                  active
                    ? "rounded-md bg-navy px-2.5 py-1 text-white"
                    : "rounded-md px-2.5 py-1 text-navy hover:bg-surface"
                }
              >
                {option.label}
              </Link>
            </span>
          );
        })}
      </div>
    </nav>
  );
}

export function Header({
  locale,
  brandLine1,
  brandLine2,
  languageLabel,
  languageRu,
  languageKk,
  navLabel,
  mobileNavLabel,
  openMenuLabel,
  closeMenuLabel,
  items,
}: HeaderProps) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPath(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="h-1 bg-navy" />
      <div className="h-0.5 bg-teal" />
      <Container>
        <div className="flex items-center justify-between gap-3 py-3">
          <Link
            href={withLocale(locale, "/")}
            className="min-w-0 max-w-[9.5rem] sm:max-w-[14rem] lg:max-w-xs"
          >
            <span className="block text-sm font-semibold leading-snug text-navy sm:text-base">
              {brandLine1}
            </span>
            <span className="mt-0.5 hidden text-xs leading-snug text-muted sm:block">
              {brandLine2}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <nav
              className="hidden items-center gap-1 xl:flex"
              aria-label={navLabel}
            >
              <NavLinks
                locale={locale}
                items={items}
                pathname={pathname}
                onNavigate={() => setOpenPath(null)}
              />
            </nav>
            <LanguageSwitcher
              locale={locale}
              pathname={pathname}
              languageLabel={languageLabel}
              languageRu={languageRu}
              languageKk={languageKk}
            />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-line p-2 text-navy xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? closeMenuLabel : openMenuLabel}
              onClick={() => setOpenPath(open ? null : pathname)}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </Container>
      {open ? (
        <nav
          id="mobile-menu"
          className="border-t border-line bg-white xl:hidden"
          aria-label={mobileNavLabel}
        >
          <Container className="flex flex-col gap-1 py-3">
            <NavLinks
              locale={locale}
              items={items}
              pathname={pathname}
              onNavigate={() => setOpenPath(null)}
            />
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
