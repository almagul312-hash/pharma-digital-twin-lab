import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CapsulesExperience } from "@/components/capsules/CapsulesExperience";
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
  searchParams,
}: PageProps<"/[lang]/digital-twins/capsules">) {
  const { lang } = await params;
  const query = await searchParams;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const start = query.start;
  const initialWorkspace = start === "1" || (Array.isArray(start) && start.includes("1"));

  return (
    <CapsulesExperience
      initialWorkspace={initialWorkspace}
      locale={lang}
      project={dictionary.projects.capsules}
      status={dictionary.projects.status}
      backLabel={dictionary.projects.back}
      stagesTitle={dictionary.projects.stagesTitle}
      lab={dictionary.lab}
    />
  );
}
