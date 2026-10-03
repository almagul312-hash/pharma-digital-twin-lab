import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { withLocale, type Locale } from "@/i18n/config";
import type { ProjectSlug } from "@/data/projects";

export function ProjectCard({
  locale,
  slug,
  title,
  description,
  status,
  openLabel,
}: {
  locale: Locale;
  slug: ProjectSlug;
  title: string;
  description: string;
  status: string;
  openLabel: string;
}) {
  return (
    <Link
      href={withLocale(locale, `/digital-twins/${slug}`)}
      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition-colors hover:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
    >
      <StatusBadge status={status} />
      <h3 className="mt-4 text-xl font-semibold leading-snug text-navy group-hover:text-teal-dark">
        {title}
      </h3>
      <p className="mt-3 flex-1 leading-relaxed">{description}</p>
      <span className="mt-6 text-sm font-semibold text-teal">{openLabel}</span>
    </Link>
  );
}
