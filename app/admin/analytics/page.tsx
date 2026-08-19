import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { Stamp } from "@/components/stamp";
import { loadLiquidity, type ReconcileRow } from "@/lib/liquidity";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Liquidity",
  robots: { index: false, follow: false },
};

function hoursLabel(h: number | null) {
  if (h == null) return "—";
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${h.toFixed(1)} h`;
  return `${(h / 24).toFixed(1)} d`;
}

function pct(n: number | null) {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

function matchStamp(row: ReconcileRow) {
  if (row.status === "ok") return { label: "Match", className: "bg-sage text-mark" };
  if (row.status === "events_ahead") return { label: "Events ahead", className: "bg-[#f4e6d8] text-hold" };
  if (row.status === "records_ahead") return { label: "Records ahead", className: "bg-stop/10 text-stop" };
  return { label: "Events only", className: "" };
}

export default async function AdminLiquidityPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const data = await loadLiquidity();
  const inTarget = data.quotesPerOpen >= 3 && data.quotesPerOpen <= 5;
  const maxBar = Math.max(1, ...data.days.map((d) => Math.max(d.rfqs, d.opened, d.quotes)));
  const umamiHost = data.umamiScript.replace(/\/script\.js$/i, "");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <AdminNav current="liquidity" />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Admin · liquidity</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        PRD KPIs from live records. First-party events sit beside those records so ops can see whether Scenario A
        is actually writing data — not a registration chart.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat n={data.activeBuyers} l="Active buyers (30d)" hint="Orgs that posted ≥1 RFQ" />
        <Stat n={data.activeSuppliersQuoted} l="Active suppliers (30d)" hint="Quoted at least once" />
        <Stat n={data.rfqsMonthOpened} l="RFQs opened / month" hint="Reached Open or beyond" />
        <Stat
          n={data.quotesPerOpen ? data.quotesPerOpen.toFixed(1) : "—"}
          l="Quotes / open RFQ"
          hint="Target 3–5"
          stamp={data.qualifiedOpen ? (inTarget ? "On target" : "Off target") : undefined}
          stampHold={!inTarget && data.qualifiedOpen > 0}
        />
        <Stat n={hoursLabel(data.medianResponseHours)} l="Median time to 1st quote" hint="Open → first quote_submit" />
        <Stat n={hoursLabel(data.medianTimeToThreeHours)} l="Median time to 3 quotes" hint="Open → third quote_submit" />
        <Stat n={pct(data.supplierResponseRate)} l="Supplier response rate" hint="Matched RFQs that got a quote" />
        <Stat n={pct(data.buyerRepeatRate)} l="Buyer repeat (90d)" hint="Buyers with ≥2 RFQs / ≥1" />
      </div>
      <p className="mt-3 text-xs text-mill">
        Directory: {data.buyers} buyer orgs · {data.suppliersApproved} approved suppliers · {data.rfqsOpen} open RFQs
        · {data.activeSuppliersMatched} suppliers matched in 30d
      </p>

      <h2 className="mt-10 text-2xl font-semibold">Quote coverage on open RFQs</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Target is 3–5 submitted quotes per qualified open RFQ. Zero is a matching problem. Above ~8 is usually over-broadcast.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat n={data.quoteBand.zero} l="0 quotes" />
        <Stat n={data.quoteBand.low} l="1–2 quotes" />
        <Stat n={data.quoteBand.target} l="3–5 quotes" stamp={data.qualifiedOpen ? "Target band" : undefined} />
        <Stat n={data.quoteBand.high} l="6+ quotes" />
      </div>

      <h2 className="mt-10 text-2xl font-semibold">30-day loop (events)</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Daily counts from AnalyticsEvent — RFQ submit, RFQ open, quote submit. Pakistan calendar day (UTC+5).
      </p>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-rule bg-sheet p-4">
        <div className="flex min-w-160 items-end gap-1">
          {data.days.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-28 w-full items-end justify-center gap-px">
                <span
                  className="w-1/3 rounded-t bg-ink/80"
                  style={{ height: `${(d.rfqs / maxBar) * 100}%`, minHeight: d.rfqs ? 2 : 0 }}
                  title={`${d.date} submit ${d.rfqs}`}
                />
                <span
                  className="w-1/3 rounded-t bg-mark"
                  style={{ height: `${(d.opened / maxBar) * 100}%`, minHeight: d.opened ? 2 : 0 }}
                  title={`${d.date} open ${d.opened}`}
                />
                <span
                  className="w-1/3 rounded-t bg-steel/70"
                  style={{ height: `${(d.quotes / maxBar) * 100}%`, minHeight: d.quotes ? 2 : 0 }}
                  title={`${d.date} quote ${d.quotes}`}
                />
              </div>
              <span className="text-[9px] text-mill">{d.date.slice(8)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-mill">
          <span className="mr-3 inline-block h-2 w-2 rounded-sm bg-ink/80" /> Submit{" "}
          <span className="mr-3 ml-3 inline-block h-2 w-2 rounded-sm bg-mark" /> Open{" "}
          <span className="mr-3 ml-3 inline-block h-2 w-2 rounded-sm bg-steel/70" /> Quote
        </p>
      </div>

      <h2 className="mt-10 text-2xl font-semibold">Side-by-side verify</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Last 30 days. Postgres events vs domain tables. Umami is a mirror, not the source of truth.
      </p>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-rule bg-sheet">
        <table className="w-full min-w-180 text-left text-sm">
          <thead className="border-b border-rule text-[11px] uppercase tracking-wide text-mill">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Events 30d</th>
              <th className="px-4 py-3 font-medium">Records 30d</th>
              <th className="px-4 py-3 font-medium">Check</th>
              <th className="px-4 py-3 font-medium">How to read</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              const stamp = matchStamp(row);
              return (
                <tr key={row.name} className="border-b border-rule/70 last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {row.label}
                    <span className="mt-0.5 block font-mono text-[11px] text-mill">{row.name}</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row.events30}</td>
                  <td className="px-4 py-3 tabular-nums">{row.records30 ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Stamp className={stamp.className}>{stamp.label}</Stamp>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{row.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-rule bg-sheet p-4">
          <p className="text-[11px] uppercase tracking-wide text-mill">Profile views (all-time)</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {data.profileViewEventsAll}
            <span className="text-lg text-ink-soft"> vs {data.profileViewsSum}</span>
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            AnalyticsEvent <span className="font-mono">profile_view</span> vs sum of supplier{" "}
            <span className="font-mono">profileViews</span>. These should stay together — the beacon increments both.
          </p>
          <p className="mt-2">
            {data.profileViewEventsAll === data.profileViewsSum ? (
              <Stamp className="bg-sage text-mark">Match</Stamp>
            ) : (
              <Stamp className="bg-[#f4e6d8] text-hold">Drift</Stamp>
            )}
          </p>
        </div>
        <div className="rounded-3xl border border-rule bg-sheet p-4">
          <p className="text-[11px] uppercase tracking-wide text-mill">Umami (optional)</p>
          {data.umamiId ? (
            <>
              <p className="mt-2 font-mono text-sm break-all">{data.umamiId}</p>
              <p className="mt-2 text-sm text-ink-soft">
                Script loaded from the public layout. Custom events also POST to the collect API for RFQ/quote/match.
                Compare this dashboard to{" "}
                <a href={umamiHost} className="text-steel underline" target="_blank" rel="noreferrer">
                  the Umami workspace
                </a>
                . If they disagree, trust Postgres.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">
              Not configured. Set <span className="font-mono">NEXT_PUBLIC_UMAMI_WEBSITE_ID</span> (and optionally{" "}
              <span className="font-mono">NEXT_PUBLIC_UMAMI_SCRIPT_URL</span> for self-hosted) in{" "}
              <span className="font-mono">.env</span>. The liquidity table works without it.
            </p>
          )}
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-semibold">Recent events</h2>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-rule bg-sheet">
        <table className="w-full min-w-180 text-left text-sm">
          <thead className="border-b border-rule text-[11px] uppercase tracking-wide text-mill">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Payload</th>
            </tr>
          </thead>
          <tbody>
            {data.recentEvents.map((ev) => (
              <tr key={ev.id} className="border-b border-rule/70 last:border-0 align-top">
                <td className="px-4 py-3 font-mono text-[11px] text-mill whitespace-nowrap">
                  {ev.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{ev.name}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {ev.user ? `${ev.user.email} · ${ev.user.role}` : "anonymous"}
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-mill break-all">{ev.payload}</td>
              </tr>
            ))}
            {!data.recentEvents.length ? (
              <tr>
                <td className="px-4 py-6 text-ink-soft" colSpan={4}>
                  No events yet. Complete Scenario A (search → profile → RFQ → open → quote) or run{" "}
                  <span className="font-mono">npm run analytics:verify</span>.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  n,
  l,
  hint,
  stamp,
  stampHold,
}: {
  n: number | string;
  l: string;
  hint?: string;
  stamp?: string;
  stampHold?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-rule bg-sheet p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-3xl font-semibold tabular-nums">{n}</p>
        {stamp ? <Stamp className={cn(stampHold ? "bg-[#f4e6d8] text-hold" : "bg-sage text-mark")}>{stamp}</Stamp> : null}
      </div>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-mill">{l}</p>
      {hint ? <p className="mt-1 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}
