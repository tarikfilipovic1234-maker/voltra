import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { deletePromoCode, generatePromoBatch } from "@/app/actions/admin-loyalty";
import { GeneratorForm } from "@/app/components/admin/GeneratorForm";

type Props = {
  searchParams: Promise<{ q?: string; campaign?: string; status?: string }>;
};

export default async function PromoCodesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const campaign = sp.campaign?.trim();
  const status = sp.status;

  const where = {
    ...(q ? { code: { contains: q.toUpperCase() } } : {}),
    ...(campaign ? { campaign } : {}),
    ...(status === "active" ? { active: true } : status === "retired" ? { active: false } : {}),
  };

  const [codes, totals, byCampaign] = await Promise.all([
    prisma.promoCode.findMany({ where, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.promoCode.aggregate({
      _count: { _all: true },
      _sum: { redeemedCount: true, points: true },
    }),
    prisma.promoCode.groupBy({
      by: ["campaign"],
      _count: { _all: true },
      _sum: { redeemedCount: true },
      orderBy: { _count: { campaign: "desc" } },
      take: 20,
    }),
  ]);

  const exportHref = `/api/admin/promo-codes/export${campaign ? `?campaign=${encodeURIComponent(campaign)}` : ""}`;

  return (
    <div className="space-y-12">
      <header className="border-b border-border pb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 07 / Promo Codes</span>
        <h1 className="mt-3 font-display text-5xl">Codes On Cans</h1>
        <p className="mt-2 text-sm text-text-muted">
          {totals._count._all.toLocaleString()} codes minted ·{" "}
          {totals._sum.redeemedCount?.toLocaleString() ?? 0} redemptions on file ·{" "}
          Cryptographically random, no collisions
        </p>
      </header>

      {/* ─── Generator ─── */}
      <section className="clip-tag border border-voltra/40 bg-surface p-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-display text-3xl">Mint a batch</h2>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
              Up to 10,000 codes per click. CSV downloads on completion.
            </p>
          </div>
          <Link
            href={exportHref}
            className="clip-tag border border-border bg-bg px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:border-voltra hover:text-voltra"
          >
            Download CSV →
          </Link>
        </div>
        <GeneratorForm action={generatePromoBatch} />
      </section>

      {/* ─── Per-campaign performance ─── */}
      <section>
        <div className="flex items-end justify-between border-b border-border pb-3">
          <h2 className="font-display text-3xl">Campaign performance</h2>
          <Link href="/admin/promo-codes" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-voltra">Clear filters</Link>
        </div>
        <ul className="mt-4 grid gap-px bg-border md:grid-cols-3 lg:grid-cols-4">
          {byCampaign.map((c) => {
            const redeemed = c._sum.redeemedCount ?? 0;
            const minted = c._count._all;
            const rate = minted > 0 ? Math.min(100, Math.round((redeemed / minted) * 100)) : 0;
            const label = c.campaign ?? "—";
            return (
              <li key={label} className="bg-bg p-4">
                <Link
                  href={`/admin/promo-codes?campaign=${encodeURIComponent(label)}`}
                  className="block"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim line-clamp-1">{label}</div>
                  <div className="mt-2 font-display text-3xl text-gradient-green tabular">{redeemed}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    {redeemed} / {minted} · {rate}%
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden bg-bg border border-border">
                    <div className="h-full bg-gradient-to-r from-voltra-acid to-voltra" style={{ width: `${rate}%` }} />
                  </div>
                </Link>
              </li>
            );
          })}
          {byCampaign.length === 0 && (
            <li className="bg-bg p-4 text-text-dim font-mono text-[11px] uppercase tracking-[0.22em]">No campaigns yet.</li>
          )}
        </ul>
      </section>

      {/* ─── Codes table with filters ─── */}
      <section>
        <form className="mb-4 flex flex-wrap items-end gap-3 border-b border-border pb-3">
          <label className="block">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">Search code</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="VOLT-2026"
              className="mt-1 block w-48 border border-border bg-bg px-2 py-2 font-mono text-xs text-text focus:border-voltra focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">Campaign</span>
            <input
              name="campaign"
              defaultValue={campaign}
              className="mt-1 block w-56 border border-border bg-bg px-2 py-2 font-mono text-xs text-text focus:border-voltra focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">Status</span>
            <select name="status" defaultValue={status ?? ""} className="mt-1 block border border-border bg-bg px-2 py-2 font-mono text-xs uppercase tracking-[0.12em] text-text focus:border-voltra focus:outline-none">
              <option value="" className="bg-bg">All</option>
              <option value="active" className="bg-bg">Active</option>
              <option value="retired" className="bg-bg">Retired</option>
            </select>
          </label>
          <button
            type="submit"
            className="clip-sharp bg-voltra px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid"
          >
            Filter →
          </button>
          <Link href="/admin/promo-codes/new" className="ml-auto clip-sharp inline-flex items-center gap-2 border border-border bg-bg px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:border-voltra hover:text-voltra">
            + Single Code
          </Link>
        </form>

        <table className="w-full border-collapse border border-border bg-surface font-mono text-xs">
          <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
            <tr>
              <th className="border-b border-border p-3">Code</th>
              <th className="border-b border-border p-3">Points</th>
              <th className="border-b border-border p-3">Redeemed / Cap</th>
              <th className="border-b border-border p-3">Source</th>
              <th className="border-b border-border p-3">Campaign</th>
              <th className="border-b border-border p-3">Status</th>
              <th className="border-b border-border p-3"></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-b-0">
                <td className="p-3">
                  <Link href={`/admin/promo-codes/${c.id}`} className="font-display text-base text-text hover:text-voltra">
                    {c.code}
                  </Link>
                </td>
                <td className="p-3 text-voltra">+{c.points}</td>
                <td className="p-3">
                  <span className="text-text">{c.redeemedCount}</span>
                  <span className="text-text-dim"> / {c.maxRedemptions.toLocaleString()}</span>
                </td>
                <td className="p-3 text-text-muted">{c.source}</td>
                <td className="p-3 text-text-muted">{c.campaign ?? "—"}</td>
                <td className="p-3">
                  <span className={c.active ? "text-voltra" : "text-text-dim"}>
                    {c.active ? "Active" : "Retired"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <DeleteButton id={c.id} action={deletePromoCode} />
                </td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-text-dim">No codes match.</td></tr>
            )}
          </tbody>
        </table>
        {codes.length === 500 && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
            Showing first 500 — use filters or download CSV for the full set.
          </p>
        )}
      </section>
    </div>
  );
}
