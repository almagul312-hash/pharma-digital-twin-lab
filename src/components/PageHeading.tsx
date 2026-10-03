export function PageHeading({
  title,
  lead,
}: {
  title: string;
  lead: string;
}) {
  return (
    <header className="max-w-3xl">
      <h1 className="text-3xl font-semibold leading-tight break-words text-navy sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed">{lead}</p>
    </header>
  );
}
