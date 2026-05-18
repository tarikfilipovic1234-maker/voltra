import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [
    products, athletes, videos, articles, draftArticles, events, users, newsletterCount,
    promoCodes, rewardItems, merchProducts, pendingOrders, paidOrders, liveStreams,
    recentArticles, recentAthletes,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.athlete.count({ where: { active: true } }),
    prisma.video.count(),
    prisma.article.count({ where: { published: true } }),
    prisma.article.count({ where: { published: false } }),
    prisma.event.count({ where: { active: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { newsletter: true } }),
    prisma.promoCode.count({ where: { active: true } }),
    prisma.rewardItem.count({ where: { active: true } }),
    prisma.merchProduct.count({ where: { active: true } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.stream.count({ where: { live: true } }),
    prisma.article.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.athlete.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Products", value: products, href: "/admin/products" },
    { label: "Athletes", value: athletes, href: "/admin/athletes" },
    { label: "Videos", value: videos, href: "/admin/videos" },
    { label: "Articles · Live", value: articles, href: "/admin/articles" },
    { label: "Articles · Draft", value: draftArticles, href: "/admin/articles?published=false" },
    { label: "Events", value: events, href: "/admin/events" },
    { label: "Users", value: users, href: "/admin/users" },
    { label: "Newsletter Subs", value: newsletterCount, href: "/admin/users?newsletter=true" },
    { label: "Promo Codes · Live", value: promoCodes, href: "/admin/promo-codes" },
    { label: "Reward Items", value: rewardItems, href: "/admin/rewards" },
    { label: "Merch SKUs", value: merchProducts, href: "/admin/merch" },
    { label: "Orders · Pending", value: pendingOrders, href: "/admin/orders?status=PENDING" },
    { label: "Orders · Paid", value: paidOrders, href: "/admin/orders?status=PAID" },
    { label: "Streams · Live", value: liveStreams, href: "/admin/streams" },
  ];

  return (
    <div className="space-y-12">
      <header>
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
          § Dashboard / 00
        </span>
        <h1 className="mt-4 font-display text-[clamp(3rem,6vw,5rem)] leading-[0.86] tracking-[-0.01em]">
          Operations <span className="text-gradient-green">Console.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-text-muted">
          A loud, live console for the marketing team. Edit here, the site
          updates on next refresh. No deploys.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group bg-bg p-6 transition-colors hover:bg-surface"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
              {s.label}
            </div>
            <div className="mt-3 font-display text-6xl leading-none tracking-[-0.01em] text-gradient-green tabular">
              {s.value.toLocaleString()}
            </div>
            <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              Manage{" "}
              <span aria-hidden className="text-voltra transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-px bg-border md:grid-cols-2">
        <article className="bg-bg p-8">
          <h2 className="font-display text-3xl">Latest Articles</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {recentArticles.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 font-mono text-xs uppercase tracking-[0.18em]">
                <Link href={`/admin/articles/${a.id}`} className="truncate text-text hover:text-voltra">
                  {a.title}
                </Link>
                <span className={a.published ? "text-voltra" : "text-text-dim"}>
                  {a.published ? "Live" : "Draft"}
                </span>
              </li>
            ))}
            {recentArticles.length === 0 && <li className="py-3 text-text-dim">No articles yet.</li>}
          </ul>
          <Link
            href="/admin/articles/new"
            className="mt-6 inline-block clip-tag border border-voltra/60 bg-voltra/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-voltra transition-colors hover:bg-voltra/20"
          >
            + New Article
          </Link>
        </article>

        <article className="bg-bg p-8">
          <h2 className="font-display text-3xl">Latest Athletes</h2>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {recentAthletes.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 font-mono text-xs uppercase tracking-[0.18em]">
                <Link href={`/admin/athletes/${a.id}`} className="truncate text-text hover:text-voltra">
                  {a.name}
                </Link>
                <span className="text-text-dim">{a.sport} · {a.region}</span>
              </li>
            ))}
            {recentAthletes.length === 0 && <li className="py-3 text-text-dim">No athletes yet.</li>}
          </ul>
          <Link
            href="/admin/athletes/new"
            className="mt-6 inline-block clip-tag border border-voltra/60 bg-voltra/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-voltra transition-colors hover:bg-voltra/20"
          >
            + New Athlete
          </Link>
        </article>
      </section>
    </div>
  );
}
