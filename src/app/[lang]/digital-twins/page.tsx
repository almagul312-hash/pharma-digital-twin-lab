import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { PageHeading } from "@/components/PageHeading";
import { ProjectCard } from "@/components/ProjectCard";
import { projectSlugs } from "@/data/projects";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/digital-twins">): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return {
    title: dictionary.digitalTwins.title,
    description: dictionary.digitalTwins.description,
  };
}

export default async function DigitalTwinsPage({
  params,
}: PageProps<"/[lang]/digital-twins">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <PageHeading
          title={dictionary.digitalTwins.title}
          lead={dictionary.digitalTwins.lead}
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {projectSlugs.map((slug) => (
            <ProjectCard
              key={slug}
              locale={lang}
              slug={slug}
              title={dictionary.projects[slug].title}
              description={dictionary.projects[slug].description}
              status={dictionary.projects.status}
              openLabel={dictionary.projects.open}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
