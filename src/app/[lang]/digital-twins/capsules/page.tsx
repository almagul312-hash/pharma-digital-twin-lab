import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectView } from "@/components/ProjectView";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/digital-twins/capsules">): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return {
    title: dictionary.projects.capsules.title,
    description: dictionary.projects.capsules.description,
  };
}

export default async function CapsulesProjectPage({
  params,
}: PageProps<"/[lang]/digital-twins/capsules">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);

  return (
    <ProjectView
      locale={lang}
      project={dictionary.projects.capsules}
      status={dictionary.projects.status}
      backLabel={dictionary.projects.back}
      structureTitle={dictionary.projects.structureTitle}
      structureText={dictionary.projects.structureText}
      stagesTitle={dictionary.projects.stagesTitle}
      comingSoon={dictionary.common.comingSoon}
    />
  );
}
