import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/login">): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return {
    title: dictionary.login.title,
    description: dictionary.login.description,
  };
}

export default async function LoginPage({
  params,
}: PageProps<"/[lang]/login">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);

  return (
    <div className="bg-surface py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white px-6 py-8 shadow-sm sm:px-8">
          <h1 className="text-3xl font-semibold text-navy">
            {dictionary.login.title}
          </h1>
          <p className="mt-4 leading-relaxed">{dictionary.login.text}</p>
          <p className="mt-6 rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-teal-dark">
            {dictionary.common.comingSoon}
          </p>
        </div>
      </Container>
    </div>
  );
}
