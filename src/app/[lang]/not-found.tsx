import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { withLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { getRequestLocale } from "@/i18n/request-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = getDictionary(await getRequestLocale());

  return {
    title: {
      absolute: `${dictionary.notFound.title} | ${dictionary.meta.titleSuffix}`,
    },
  };
}

export default async function NotFound() {
  const locale = await getRequestLocale();
  const dictionary = getDictionary(locale);

  return (
    <Container className="py-20">
      <h1 className="text-3xl font-semibold text-navy">
        {dictionary.notFound.title}
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed">{dictionary.notFound.text}</p>
      <Link
        href={withLocale(locale, "/")}
        className="mt-8 inline-flex items-center justify-center rounded-lg bg-navy px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-teal"
      >
        {dictionary.notFound.action}
      </Link>
    </Container>
  );
}
