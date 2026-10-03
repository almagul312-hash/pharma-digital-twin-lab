import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectView } from "@/components/ProjectView";
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
}: PageProps<"/[lang]/digital-twins/tablets">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);

  return (
    <ProjectView
      locale={lang}
      project={dictionary.projects.tablets}
      status={dictionary.projects.status}
      backLabel={dictionary.projects.back}
      structureTitle={dictionary.projects.structureTitle}
      structureText={dictionary.projects.structureText}
      stagesTitle={dictionary.projects.stagesTitle}
      comingSoon={dictionary.common.comingSoon}
    />
  );
}
