"use client";

export function HeroVideo({ src, poster }: { src: string; poster: string }) {
  return (
    <video
      className="hero-video absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      ref={(node) => {
        if (!node) {
          return;
        }

        node.muted = true;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          node.pause();
        }
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
