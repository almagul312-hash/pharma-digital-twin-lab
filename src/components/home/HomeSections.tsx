import Link from "next/link";
import { Container } from "@/components/Container";
import {
  ExperimentIcon,
  ParametersIcon,
  ProcessIcon,
  ResultsIcon,
} from "@/components/home/CapabilityIcons";
import {
  CapsuleIllustration,
  TabletIllustration,
} from "@/components/home/ProjectIllustrations";
import { StatusBadge } from "@/components/StatusBadge";
import { withLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

const capabilityItems = [
  { key: "processes", icon: ProcessIcon },
  { key: "parameters", icon: ParametersIcon },
  { key: "results", icon: ResultsIcon },
  { key: "experiment", icon: ExperimentIcon },
] as const;

export function CapabilitySection({
  title,
  capabilities,
}: {
  title: string;
  capabilities: Dictionary["home"]["capabilities"];
}) {
  return (
    <section className="bg-[#e7f4fb] py-16 sm:py-20">
      <Container>
        <h2 className="text-center text-3xl font-semibold text-navy">
          {title}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {capabilityItems.map((item) => {
            const content = capabilities[item.key];
            const Icon = item.icon;

            return (
              <article
                key={item.key}
                className="group rounded-2xl bg-white px-5 py-6 text-center shadow-md transition-shadow duration-200 hover:shadow-lg"
              >
                <div className="mx-auto flex h-28 items-center justify-center rounded-2xl bg-[#e7f4fb]">
                  <Icon />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-navy">
                  {content.title}
                </h3>
                <p className="mt-3 leading-relaxed">{content.description}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function HomeProjectsSection({
  locale,
  title,
  status,
  detailsLabel,
  tabletsTitle,
  capsulesTitle,
}: {
  locale: Locale;
  title: string;
  status: string;
  detailsLabel: string;
  tabletsTitle: string;
  capsulesTitle: string;
}) {
  const cards = [
    {
      slug: "tablets",
      title: tabletsTitle,
      illustration: <TabletIllustration />,
    },
    {
      slug: "capsules",
      title: capsulesTitle,
      illustration: <CapsuleIllustration />,
    },
  ] as const;

  return (
    <section id="projects" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <Container>
        <h2 className="text-center text-3xl font-semibold text-navy">{title}</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          {cards.map((card) => (
            <article
              key={card.slug}
              className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md"
            >
              <div className="h-64 sm:h-72">{card.illustration}</div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <StatusBadge status={status} />
                <h3 className="mt-4 text-2xl font-semibold leading-snug text-navy">
                  {card.title}
                </h3>
                <Link
                  href={withLocale(locale, `/digital-twins/${card.slug}`)}
                  aria-label={detailsLabel}
                  className="mt-6 inline-flex w-fit items-center justify-center rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                >
                  {detailsLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
