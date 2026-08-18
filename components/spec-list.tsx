export function SpecList({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="rounded-2xl bg-paper px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-mill">{k}</dt>
          <dd className="mt-1 text-sm text-ink">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
