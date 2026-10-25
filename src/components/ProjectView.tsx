import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { InfoBlock } from "@/components/InfoBlock";
import { PlaceholderGrid } from "@/components/PlaceholderGrid";
import { StatusBadge } from "@/components/StatusBadge";
import { withLocale, type Locale } from "@/i18n/config";
import type { ProjectCopy } from "@/i18n/types";

export function ProjectView({
  locale,
  project,
  status,
  backLabel,
  structureTitle,
  structureText,
  stagesTitle,
  comingSoon,
  action,
}: {
  locale: Locale;
  project: ProjectCopy;
  status: string;
  backLabel: string;
  structureTitle: string;
  structureText: string;
  stagesTitle: string;
  comingSoon: string;
  action?: ReactNode;
}) {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <Link
          href={withLocale(locale, "/digital-twins")}
          className="text-sm font-semibold text-teal hover:text-teal-dark"
        >
          {backLabel}
        </Link>
        <div className="mt-6">
          <StatusBadge status={status} />
        </div>
        <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight break-words text-navy sm:text-4xl">
          {project.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed">
          {project.description}
        </p>
        {action ? <div className="mt-8">{action}</div> : null}
        <div className="mt-10">
          <InfoBlock title={structureTitle}>
            <p>{structureText}</p>
          </InfoBlock>
        </div>
        <h2 className="mt-10 text-2xl font-semibold text-navy">{stagesTitle}</h2>
        <div className="mt-6">
          <PlaceholderGrid items={project.stages} note={comingSoon} />
        </div>
      </Container>
    </div>
  );
}
