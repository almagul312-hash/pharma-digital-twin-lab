export function PlaceholderGrid({
  items,
  note,
}: {
  items: readonly string[];
  note: string;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-xl border border-line bg-surface px-5 py-5"
        >
          <h3 className="text-lg font-semibold text-navy">{item}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{note}</p>
        </li>
      ))}
    </ul>
  );
}
