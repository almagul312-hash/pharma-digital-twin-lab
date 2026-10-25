import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeroBanner } from "@/components/home/HeroBanner";
import {
  CapabilitySection,
  HomeProjectsSection,
} from "@/components/home/HomeSections";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;

  if (!isLocale(lang)) {
    return {};
  }

  const dictionary = getDictionary(lang);

  return {
    title: { absolute: dictionary.meta.siteTitle },
    description: dictionary.meta.description,
  };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);

  return (
    <div>
      <HeroBanner
        eyebrow={dictionary.home.eyebrow}
        title={dictionary.home.title}
        lead={dictionary.home.lead}
        cta={dictionary.home.cta}
        ctaHref="#projects"
      />
      <CapabilitySection
        title={dictionary.home.capabilitiesTitle}
        capabilities={dictionary.home.capabilities}
      />
      <HomeProjectsSection
        locale={lang}
        title={dictionary.home.projectsTitle}
        status={dictionary.projects.status}
        detailsLabel={dictionary.home.projectDetails}
        startLabel={dictionary.lab.start}
        tabletsTitle={dictionary.home.tabletsTitle}
        tabletsLead={dictionary.home.tabletsLead}
        tabletsPoints={dictionary.home.tabletsPoints}
        tabletsStatus={dictionary.home.tabletsStatus}
        capsulesTitle={dictionary.home.capsulesTitle}
      />
    </div>
  );
}
