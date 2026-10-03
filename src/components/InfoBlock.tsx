import type { ReactNode } from "react";

export function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface px-6 py-6 sm:px-8 sm:py-8">
      <h2 className="text-xl font-semibold text-navy sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}
