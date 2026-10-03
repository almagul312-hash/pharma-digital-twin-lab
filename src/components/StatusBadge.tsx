export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex w-fit rounded-full bg-teal-soft px-3 py-1 text-sm font-semibold text-teal-dark">
      {status}
    </span>
  );
}
