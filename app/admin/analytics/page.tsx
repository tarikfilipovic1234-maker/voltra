import Link from "next/link";

import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ range?: string }>;
};

const RANGE_OPTIONS = [
  { key: "24h", label: "24h", ms: 24 * 3600 * 1000 },
  { key: "7d", label: "7d", ms: 7 * 24 * 3600 * 1000 },
  { key: "30d", label: "30d", ms: 30 * 24 * 3600 * 1000 },
  { key: "90d", label: "90d", ms: 90 * 24 * 3600 * 1000 },
  { key: "all", label: "All time", ms: Number.POSITIVE_INFINITY },
];

export default async function AnalyticsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const range = RANGE_OPTIONS.find((r) => r.key === sp.range) ?? RANGE_OPTIONS[2];
  const since = range.ms === Number.POSITIVE_INFINITY
    ? new Date(0)
    : new Date(Date.now() - range.ms);

  const [
    pvTotal,
    uniqueSessions,
    byRegion,
    topPaths,
    topAthletes,
    topProducts,
    topArticles,
    flavorClicks,
    storeSearches,
    timeline,
    eventCounts,
  ] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: since } } }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      select: { sessionId: true },
      distinct: ["sessionId"],
      take: 100_000,
    }),
    prisma.pageView.groupBy({
      by: ["region"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["athleteId"],
      where: { createdAt: { gte: since }, athleteId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { athleteId: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["productId"],
      where: { createdAt: { gte: since }, productId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
    prisma.pageView.groupBy({
      by: ["articleId"],
      where: { createdAt: { gte: since }, articleId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { articleId: "desc" } },
      take: 10,
    }),
    prisma.trackEvent.groupBy({
      by: ["productId", "value"],
      where: {
        createdAt: { gte: since },
        kind: { in: ["FLAVOR_CLICK", "PRODUCT_CLICK"] },
      },
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
    prisma.trackEvent.groupBy({
      by: ["value", "region"],
      where: { createdAt: { gte: since }, kind: "STORE_SEARCH" },
      _count: { _all: true },
      orderBy: { _count: { value: "desc" } },
      take: 20,
    }),
    prisma.$queryRawUnsafe<{ day: string; count: bigint | number }[]>(
      `SELECT to_char("createdAt", 'YYYY-MM-DD') AS day, COUNT(*) AS count
       FROM "PageView"
       WHERE "createdAt" >= $1
       GROUP BY day ORDER BY day ASC`,
      since
    ),
    prisma.trackEvent.groupBy({
      by: ["kind"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  // Hydrate references → names
  const athleteIds = topAthletes.map((r) => r.athleteId!).filter(Boolean);
  const productIds = [
    ...topProducts.map((r) => r.productId!).filter(Boolean),
    ...flavorClicks.map((r) => r.productId!).filter(Boolean),
  ];
  const articleIds = topArticles.map((r) => r.articleId!).filter(Boolean);

  const [athletes, products, articles] = await Promise.all([
    athleteIds.length ? prisma.athlete.findMany({ where: { id: { in: athleteIds } }, select: { id: true, name: true, sport: true } }) : [],
    productIds.length ? prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, accentColor: true } }) : [],
    articleIds.length ? prisma.article.findMany({ where: { id: { in: articleIds } }, select: { id: true, title: true } }) : [],
  ]);
  const athleteById = new Map(athletes.map((a) => [a.id, a]));
  const productById = new Map(products.map((p) => [p.id, p]));
  const articleById = new Map(articles.map((a) => [a.id, a]));

  const maxRegion = Math.max(1, ...byRegion.map((r) => r._count._all));
  const maxAthlete = Math.max(1, ...topAthletes.map((r) => r._count._all));
  const maxProduct = Math.max(1, ...topProducts.map((r) => r._count._all));
  const maxArticle = Math.max(1, ...topArticles.map((r) => r._count._all));
  const maxFlavor = Math.max(1, ...flavorClicks.map((r) => r._count._all));
  const maxStore = Math.max(1, ...storeSearches.map((r) => r._count._all));
  const maxDay = Math.max(1, ...timeline.map((r) => Number(r.count)));

  return (
    <div className="space-y-12">
      <header className="border-b border-border pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 01 / Analytics</span>
          <h1 className="mt-3 font-display text-5xl">Operations Telemetry</h1>
          <p className="mt-2 text-sm text-text-muted">
            Pageviews + click events recorded server-side. {pvTotal.toLocaleString()} views in window · {uniqueSessions.length.toLocaleString()} unique sessions.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((r) => (
            <Link
              key={r.key}
              href={`/admin/analytics?range=${r.key}`}
              className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
                range.key === r.key ? "border-voltra bg-voltra/10 text-voltra" : "border-border text-text-muted hover:text-text"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Headline tiles */}
      <section className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        <Tile label="Pageviews" value={pvTotal} />
        <Tile label="Unique sessions" value={uniqueSessions.length} />
        <Tile label="Click events" value={eventCounts.reduce((a, e) => a + e._count._all, 0)} />
        <Tile label="Region top" value={byRegion[0]?.region ?? "—"} muted />
      </section>

      {/* Timeline */}
      <section>
        <h2 className="font-display text-3xl border-b border-border pb-3">Traffic over time</h2>
        <div className="mt-6 grid grid-cols-[80px_1fr] items-center gap-y-1 gap-x-3 font-mono text-[10px] uppercase tracking-[0.18em]">
          {timeline.map((row) => {
            const count = Number(row.count);
            const pct = (count / maxDay) * 100;
            return (
              <div key={row.day} className="contents">
                <div className="text-text-dim">{row.day}</div>
                <div className="flex items-center gap-3">
                  <div className="h-3 flex-1 overflow-hidden bg-bg border border-border">
                    <div className="h-full bg-gradient-to-r from-voltra-acid to-voltra" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-12 text-right text-text tabular">{count}</span>
                </div>
              </div>
            );
          })}
          {timeline.length === 0 && (
            <div className="col-span-2 text-text-dim">No data in this window.</div>
          )}
        </div>
      </section>

      {/* Region demand */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl border-b border-border pb-3">Region demand</h2>
          <BarList
            rows={byRegion.map((r) => ({
              label: r.region ?? "Unknown",
              value: r._count._all,
              max: maxRegion,
            }))}
            emptyLabel="No regional data."
          />
        </div>
        <div>
          <h2 className="font-display text-3xl border-b border-border pb-3">Top URLs</h2>
          <ol className="mt-4 divide-y divide-border border-y border-border font-mono text-xs">
            {topPaths.map((p, i) => (
              <li key={p.path} className="flex items-center justify-between py-2.5">
                <span className="truncate text-text">
                  <span className="text-text-dim mr-3">{String(i + 1).padStart(2, "0")}</span>
                  {p.path}
                </span>
                <span className="text-voltra tabular">{p._count._all.toLocaleString()}</span>
              </li>
            ))}
            {topPaths.length === 0 && <li className="py-3 text-text-dim">No data.</li>}
          </ol>
        </div>
      </section>

      {/* Top athletes + Top products */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl border-b border-border pb-3">Most-viewed athletes</h2>
          <BarList
            rows={topAthletes.map((r) => {
              const a = r.athleteId ? athleteById.get(r.athleteId) : null;
              return {
                label: a ? `${a.name}` : (r.athleteId?.slice(-6) ?? "—"),
                sub: a?.sport ?? "—",
                value: r._count._all,
                max: maxAthlete,
              };
            })}
            emptyLabel="No athlete views in this range."
          />
        </div>
        <div>
          <h2 className="font-display text-3xl border-b border-border pb-3">Most-viewed products</h2>
          <BarList
            rows={topProducts.map((r) => {
              const p = r.productId ? productById.get(r.productId) : null;
              return {
                label: p?.name ?? (r.productId?.slice(-6) ?? "—"),
                value: r._count._all,
                max: maxProduct,
                accent: p?.accentColor,
              };
            })}
            emptyLabel="No product views in this range."
          />
        </div>
      </section>

      {/* Flavor clicks + Article reads */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl border-b border-border pb-3">Flavor / Product clicks</h2>
          <BarList
            rows={flavorClicks.map((r) => {
              const p = r.productId ? productById.get(r.productId) : null;
              return {
                label: p?.name ?? r.value ?? "—",
                sub: r.value && p?.name && r.value !== p.name ? r.value : undefined,
                value: r._count._all,
                max: maxFlavor,
                accent: p?.accentColor,
              };
            })}
            emptyLabel="No click events tracked yet."
          />
        </div>
        <div>
          <h2 className="font-display text-3xl border-b border-border pb-3">Most-read articles</h2>
          <BarList
            rows={topArticles.map((r) => {
              const a = r.articleId ? articleById.get(r.articleId) : null;
              return {
                label: a?.title ?? (r.articleId?.slice(-6) ?? "—"),
                value: r._count._all,
                max: maxArticle,
              };
            })}
            emptyLabel="No article reads in this range."
          />
        </div>
      </section>

      {/* Store locator demand */}
      <section>
        <div className="flex items-end justify-between border-b border-border pb-3">
          <h2 className="font-display text-3xl">Store locator demand</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">By query · region · volume</span>
        </div>
        <BarList
          rows={storeSearches.map((r) => ({
            label: r.value ?? "—",
            sub: r.region ?? "Global",
            value: r._count._all,
            max: maxStore,
          }))}
          emptyLabel="No store-locator searches yet. Try /shop or trigger the test event."
        />
      </section>

      {/* Event kinds */}
      <section>
        <h2 className="font-display text-3xl border-b border-border pb-3">Event mix</h2>
        <ul className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border">
          {eventCounts.map((e) => (
            <li key={e.kind} className="bg-bg p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">{e.kind}</div>
              <div className="mt-2 font-display text-3xl text-gradient-green tabular">{e._count._all.toLocaleString()}</div>
            </li>
          ))}
          {eventCounts.length === 0 && (
            <li className="bg-bg p-4 text-text-dim font-mono text-[11px] uppercase tracking-[0.22em]">
              No click events tracked yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Tile({ label, value, muted }: { label: string; value: number | string; muted?: boolean }) {
  return (
    <div className="bg-bg p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">{label}</div>
      <div className={`mt-3 font-display text-5xl tabular ${muted ? "text-text" : "text-gradient-green"}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function BarList({
  rows,
  emptyLabel,
}: {
  rows: { label: string; sub?: string; value: number; max: number; accent?: string }[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-text-dim">{emptyLabel}</p>;
  }
  return (
    <ol className="mt-4 space-y-3">
      {rows.map((r, i) => {
        const pct = Math.max(1, (r.value / r.max) * 100);
        return (
          <li key={`${r.label}-${i}`}>
            <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.18em]">
              <span className="text-text truncate">
                <span className="text-text-dim mr-2">{String(i + 1).padStart(2, "0")}</span>
                {r.label}
                {r.sub && <span className="text-text-dim normal-case tracking-normal"> · {r.sub}</span>}
              </span>
              <span className="text-voltra tabular">{r.value.toLocaleString()}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden bg-bg border border-border">
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  background: r.accent
                    ? `linear-gradient(90deg, ${r.accent}, var(--voltra-green))`
                    : "linear-gradient(90deg, var(--voltra-acid), var(--voltra-green))",
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
