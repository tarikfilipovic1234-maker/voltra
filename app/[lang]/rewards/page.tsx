import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CATEGORY_LABELS, canUnlock } from "@/lib/loyalty";
import { isLocale, type Locale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string }>;
};

export default async function RewardsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const sp = await searchParams;
  const cat = sp.cat ?? "ALL";

  const [items, session, categoryRows] = await Promise.all([
    prisma.rewardItem.findMany({
      where: { active: true, ...(cat !== "ALL" ? { category: cat } : {}) },
      orderBy: [{ pointsCost: "asc" }],
    }),
    auth(),
    prisma.rewardItem.groupBy({
      by: ["category"],
      where: { active: true },
      _count: { _all: true },
    }),
  ]);

  const user = session?.user;

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/logo.svg" alt="" fill sizes="40px" className="object-contain drop-shadow-[0_0_10px_rgba(0,255,65,0.55)]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              VOLTRA<span className="text-voltra">/</span>Gear
            </span>
          </Link>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <Link href={`/${locale}/redeem`} className="hover:text-voltra">→ Redeem Code</Link>
            <Link href={`/${locale}/shop`} className="hover:text-voltra">→ Cash Shop</Link>
            {user ? (
              <Link href={`/${locale}/profile`} className="text-voltra tabular">
                {user.tier} · {/* placeholder filled from server data below */}
              </Link>
            ) : (
              <Link href={`/${locale}/login`} className="hover:text-voltra">Sign In</Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10 lg:py-20">
        <div className="grid items-end gap-6 border-b border-border pb-10 md:grid-cols-12">
          <div className="md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              § Gear / 01
            </span>
          </div>
          <div className="md:col-span-7">
            <h1 className="font-display text-[clamp(3rem,8vw,7rem)] leading-[0.85] tracking-[-0.02em]">
              Spend the <span className="text-gradient-green">voltage.</span>
            </h1>
          </div>
          <div className="md:col-span-3 md:text-right">
            <p className="text-sm leading-relaxed text-text-muted">
              Trade your Volts for the real thing. Apparel, gaming gear,
              VIP digital perks. Limited stock — first one wins.
            </p>
          </div>
        </div>

        {/* Category filter */}
        <nav className="my-8 flex flex-wrap items-center gap-2">
          <CategoryPill href={`/${locale}/rewards`} label="All" count={categoryRows.reduce((a, c) => a + c._count._all, 0)} active={cat === "ALL"} />
          {categoryRows.map((c) => (
            <CategoryPill
              key={c.category}
              href={`/${locale}/rewards?cat=${c.category}`}
              label={CATEGORY_LABELS[c.category] ?? c.category}
              count={c._count._all}
              active={cat === c.category}
            />
          ))}
        </nav>

        {/* Grid */}
        <ul className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const locked = !canUnlock(user?.tier, item.tier);
            const soldOut = item.stock <= 0;
            const affordable = (user && (user.tier ? true : true)) ?? false; // checked at redeem
            return (
              <li key={item.id} className="group relative bg-bg p-8 transition-colors hover:bg-surface">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                  {item.tier && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">
                      {item.tier} TIER
                    </span>
                  )}
                </div>
                <div className="relative my-8 grid h-44 place-items-center">
                  <div className="absolute inset-x-1/4 inset-y-0 blur-3xl opacity-20 bg-voltra" />
                  <Image
                    src={item.imageUrl ?? "/logo.svg"}
                    alt=""
                    width={180}
                    height={180}
                    className="relative h-36 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,255,65,0.45)] transition-transform duration-500 group-hover:-translate-y-1"
                  />
                </div>
                <h3 className="font-display text-2xl leading-tight">{item.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
                  {item.description}
                </p>
                <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">Cost</div>
                    <div className="font-display text-3xl text-gradient-green tabular">
                      {item.pointsCost.toLocaleString()}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">pts</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">Stock</div>
                    <div className={`font-display text-2xl tabular ${soldOut ? "text-red-400" : "text-text"}`}>
                      {soldOut ? "SOLD" : item.stock}
                    </div>
                  </div>
                </div>

                <Link
                  href={
                    soldOut || locked
                      ? "#"
                      : `/${locale}/rewards/${item.slug}`
                  }
                  aria-disabled={soldOut || locked}
                  className={`clip-sharp mt-5 inline-flex w-full items-center justify-center gap-3 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] transition-transform ${
                    soldOut || locked
                      ? "cursor-not-allowed border border-border bg-bg text-text-dim"
                      : "bg-voltra text-black hover:-translate-y-[1px] hover:bg-voltra-acid"
                  }`}
                >
                  {soldOut ? "Sold Out" : locked ? `${item.tier} Only` : "Claim →"}
                </Link>
              </li>
            );
          })}
        </ul>

        {items.length === 0 && (
          <p className="py-24 text-center font-mono text-sm uppercase tracking-[0.22em] text-text-muted">
            No items in this category.
          </p>
        )}
      </main>
    </div>
  );
}

function CategoryPill({ href, label, count, active }: { href: string; label: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
        active
          ? "border-voltra bg-voltra/10 text-voltra"
          : "border-border bg-bg text-text-muted hover:border-voltra/40 hover:text-text"
      }`}
    >
      {label}
      <span className={`tabular ${active ? "text-voltra" : "text-text-dim"}`}>{count}</span>
    </Link>
  );
}
