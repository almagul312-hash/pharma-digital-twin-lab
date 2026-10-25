import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TabletingExperience } from "@/components/tableting/TabletingExperience";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/digital-twins/tablets">): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return {
    title: dictionary.projects.tablets.title,
    description: dictionary.projects.tablets.description,
  };
}

export default async function TabletsProjectPage({
  params,
  searchParams,
}: PageProps<"/[lang]/digital-twins/tablets">) {
  const { lang } = await params;
  const query = await searchParams;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const start = query.start;
  const initialWorkspace = start === "1" || (Array.isArray(start) && start.includes("1"));

  return (
    <TabletingExperience
      initialWorkspace={initialWorkspace}
      locale={lang}
      title={dictionary.projects.tablets.title}
      description={dictionary.projects.tablets.description}
      backLabel={dictionary.projects.back}
    />
  );
}
