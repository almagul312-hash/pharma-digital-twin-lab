import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { InfoBlock } from "@/components/InfoBlock";
import { PageHeading } from "@/components/PageHeading";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return {
    title: dictionary.about.title,
    description: dictionary.about.description,
  };
}

export default async function AboutPage({
  params,
}: PageProps<"/[lang]/about">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);

  return (
    <div className="py-12 sm:py-16">
      <Container className="space-y-8">
        <PageHeading
          title={dictionary.about.title}
          lead={dictionary.about.lead}
        />
        <InfoBlock title={dictionary.about.purposeTitle}>
          <p>{dictionary.about.purposeText}</p>
        </InfoBlock>
        <InfoBlock title={dictionary.about.availableTitle}>
          <ul className="list-disc space-y-2 pl-5">
            {dictionary.about.available.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </InfoBlock>
        <InfoBlock title={dictionary.about.nextTitle}>
          <p>{dictionary.about.nextText}</p>
          <p className="text-sm font-semibold text-teal-dark">
            {dictionary.common.comingSoon}
          </p>
        </InfoBlock>
      </Container>
    </div>
  );
}
