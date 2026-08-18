export function TitleBlock({
  number,
  title,
  meta,
}: {
  number?: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="space-y-2">
      {number ? (
        <p className="font-mono text-[11px] tracking-widest text-mill uppercase">
          {number}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold text-ink md:text-3xl">{title}</h2>
      {meta ? <p className="text-sm text-ink-soft">{meta}</p> : null}
    </div>
  );
}
