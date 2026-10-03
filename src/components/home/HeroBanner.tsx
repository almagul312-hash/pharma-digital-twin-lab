import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Container } from "@/components/Container";
import { HeroVideo } from "@/components/home/HeroVideo";

const videoFile = path.join(
  process.cwd(),
  "public",
  "videos",
  "pharma-process.mp4",
);

// Видеофайл ещё не добавлен. Положите ролик в public/videos/pharma-process.mp4,
// и баннер подключит его автоматически. Пока файла нет, показывается статичный градиент.
const videoSrc = "/videos/pharma-process.mp4";
const posterSrc = "/videos/poster.svg";

export function HeroBanner({
  eyebrow,
  title,
  lead,
  cta,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  cta: string;
  ctaHref: string;
}) {
  const hasVideo = fs.existsSync(videoFile);

  return (
    <section className="relative isolate flex min-h-[34rem] w-full items-center overflow-hidden bg-[#062038] lg:min-h-[640px] lg:h-[640px]">
      <div
        className="absolute inset-0 bg-[linear-gradient(105deg,#062038_0%,#0b3a6a_46%,#1a7f8c_100%)]"
        aria-hidden="true"
      />
      {hasVideo ? <HeroVideo src={videoSrc} poster={posterSrc} /> : null}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#041526]/90 via-[#0b3a6a]/68 to-[#0b3a6a]/15"
        aria-hidden="true"
      />
      <Container className="relative z-10 py-14 sm:py-16">
        <div className="max-w-[92%] md:max-w-[55%]">
          <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/95 sm:text-lg">
            {lead}
          </p>
          <Link
            href={ctaHref}
            aria-label={cta}
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-teal px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-teal-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {cta}
          </Link>
        </div>
      </Container>
    </section>
  );
}
