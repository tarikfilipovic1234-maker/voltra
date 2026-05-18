import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { formatMoney, getCart } from "@/lib/cart";
import { isLocale, type Locale } from "@/lib/i18n/config";

const CAT_LABELS: Record<string, string> = {
  APPAREL: "Apparel",
  HEADWEAR: "Headwear",
  ACCESSORIES: "Accessories",
  COLLAB: "Collab",
  DROP: "Drop",
};

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const sp = await searchParams;
  const cat = sp.cat ?? "ALL";

  const [products, cart, categories, dropProducts] = await Promise.all([
    prisma.merchProduct.findMany({
      where: { active: true, ...(cat !== "ALL" ? { category: cat } : {}) },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    getCart(),
    prisma.merchProduct.groupBy({
      by: ["category"],
      where: { active: true },
      _count: { _all: true },
    }),
    prisma.merchProduct.findMany({
      where: { active: true, category: "DROP", dropEndsAt: { gte: new Date() } },
      orderBy: { dropEndsAt: "asc" },
      take: 1,
    }),
  ]);

  const drop = dropProducts[0];

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/logo.svg" alt="" fill sizes="40px" className="object-contain drop-shadow-[0_0_10px_rgba(0,255,65,0.55)]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              VOLTRA<span className="text-voltra">/</span>Shop
            </span>
          </Link>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <Link href={`/${locale}/rewards`} className="hover:text-voltra">→ Rewards</Link>
            <Link href={`/${locale}/cart`} className="clip-tag border border-border bg-surface px-3 py-2 hover:border-voltra hover:text-voltra">
              Cart · <span className="text-voltra">{cart.itemCount}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10 lg:py-20">
        {/* Featured drop banner */}
        {drop && <DropBanner drop={drop} locale={locale} />}

        <div className="grid items-end gap-6 border-b border-border pb-10 md:grid-cols-12">
          <div className="md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ Merch / 01</span>
          </div>
          <div className="md:col-span-7">
            <h1 className="font-display text-[clamp(3rem,8vw,7rem)] leading-[0.85] tracking-[-0.02em]">
              The <span className="text-gradient-green">cash shop.</span>
            </h1>
          </div>
          <div className="md:col-span-3 md:text-right">
            <p className="text-sm leading-relaxed text-text-muted">
              Pay in dollars, not points. Free shipping over $75 in the US.
              Worldwide delivery.
            </p>
          </div>
        </div>

        <nav className="my-8 flex flex-wrap items-center gap-2">
          <CategoryPill href={`/${locale}/shop`} label="All" count={categories.reduce((a, c) => a + c._count._all, 0)} active={cat === "ALL"} />
          {categories.map((c) => (
            <CategoryPill
              key={c.category}
              href={`/${locale}/shop?cat=${c.category}`}
              label={CAT_LABELS[c.category] ?? c.category}
              count={c._count._all}
              active={cat === c.category}
            />
          ))}
        </nav>

        <ul className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const available = Math.max(0, p.stock - p.reserved);
            const soldOut = available <= 0;
            const isDrop = p.category === "DROP";
            return (
              <li key={p.id} className="group relative bg-bg p-6 transition-colors hover:bg-surface">
                <Link href={`/${locale}/shop/${p.slug}`} className="block">
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
                      {CAT_LABELS[p.category] ?? p.category}
                    </span>
                    {p.featured && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">FEATURED</span>
                    )}
                    {isDrop && p.dropEndsAt && p.dropEndsAt > new Date() && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra-acid">
                        DROP · LIMITED
                      </span>
                    )}
                  </div>

                  <div className="relative my-8 grid h-44 place-items-center">
                    <div className="absolute inset-x-1/4 inset-y-0 blur-3xl opacity-20 bg-voltra" />
                    <Image
                      src={p.imageUrl ?? "/logo.svg"}
                      alt={p.name}
                      width={180}
                      height={180}
                      className="relative h-36 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,255,65,0.45)] transition-transform duration-500 group-hover:-translate-y-1"
                    />
                  </div>

                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-2xl">{p.name}</h3>
                    <span className="font-display text-2xl text-gradient-green tabular">
                      {formatMoney(p.priceCents, p.currency)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">{p.description}</p>
                </Link>

                <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                  <span className={soldOut ? "text-red-400" : "text-text-dim"}>
                    {soldOut ? "Sold Out" : `${available} in stock`}
                  </span>
                  <Link
                    href={`/${locale}/shop/${p.slug}`}
                    className="text-voltra hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}

function CategoryPill({ href, label, count, active }: { href: string; label: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
        active ? "border-voltra bg-voltra/10 text-voltra" : "border-border bg-bg text-text-muted hover:border-voltra/40 hover:text-text"
      }`}
    >
      {label}
      <span className={`tabular ${active ? "text-voltra" : "text-text-dim"}`}>{count}</span>
    </Link>
  );
}

function DropBanner({ drop, locale }: { drop: { id: string; name: string; slug: string; imageUrl: string | null; priceCents: number; currency: string; dropEndsAt: Date | null }; locale: Locale }) {
  return (
    <div className="mb-12 relative isolate overflow-hidden clip-tag border border-voltra/40 bg-surface p-8 sm:p-12">
      <div className="halo opacity-30" />
      <div className="grid items-center gap-8 sm:grid-cols-[1fr_auto]">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-voltra-acid">
            Live Drop · ends soon
          </span>
          <h2 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">
            {drop.name}
          </h2>
          {drop.dropEndsAt && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
              Ends {drop.dropEndsAt.toUTCString()}
            </p>
          )}
          <div className="mt-6 flex items-center gap-4">
            <Link
              href={`/${locale}/shop/${drop.slug}`}
              className="clip-sharp inline-flex items-center gap-3 bg-voltra px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid"
            >
              Grab it →
            </Link>
            <span className="font-display text-3xl text-gradient-green tabular">
              {formatMoney(drop.priceCents, drop.currency)}
            </span>
          </div>
        </div>
        <div className="relative h-48 w-48 self-end">
          <Image
            src={drop.imageUrl ?? "/logo.svg"}
            alt=""
            fill
            sizes="192px"
            className="object-contain drop-shadow-[0_0_40px_rgba(0,255,65,0.5)]"
          />
        </div>
      </div>
    </div>
  );
}
