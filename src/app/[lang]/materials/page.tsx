import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { PageHeading } from "@/components/PageHeading";
import { PlaceholderGrid } from "@/components/PlaceholderGrid";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/materials">): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return {
    title: dictionary.materials.title,
    description: dictionary.materials.description,
  };
}

export default async function MaterialsPage({
  params,
}: PageProps<"/[lang]/materials">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <PageHeading
          title={dictionary.materials.title}
          lead={dictionary.materials.lead}
        />
        <div className="mt-10">
          <PlaceholderGrid
            items={dictionary.materials.items}
            note={dictionary.common.comingSoon}
          />
        </div>
      </Container>
    </div>
  );
}
