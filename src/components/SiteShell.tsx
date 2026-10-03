import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { navItems } from "@/data/navigation";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const dictionary = getDictionary(locale);

  return (
    <>
      <Header
        locale={locale}
        brandLine1={dictionary.brand.line1}
        brandLine2={dictionary.brand.line2}
        languageLabel={dictionary.language.label}
        languageRu={dictionary.language.ru}
        languageKk={dictionary.language.kk}
        navLabel={dictionary.nav.main}
        mobileNavLabel={dictionary.nav.mobile}
        openMenuLabel={dictionary.nav.openMenu}
        closeMenuLabel={dictionary.nav.closeMenu}
        items={navItems.map((item) => ({
          href: item.href,
          label: dictionary.nav[item.labelKey],
          emphasized: item.emphasized,
        }))}
      />
      <main className="flex-1">{children}</main>
      <Footer text={dictionary.brand.footer} />
    </>
  );
}
