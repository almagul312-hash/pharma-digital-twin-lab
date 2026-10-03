import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { LocaleHtmlLang } from "@/components/LocaleHtmlLang";
import { getDictionary } from "@/i18n/dictionary";
import { getRequestLocale } from "@/i18n/request-locale";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["cyrillic", "latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = getDictionary(await getRequestLocale());

  return {
    description: dictionary.meta.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} className={`${sourceSans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <LocaleHtmlLang />
        {children}
      </body>
    </html>
  );
}
