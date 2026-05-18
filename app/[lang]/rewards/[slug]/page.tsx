import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { canUnlock, CATEGORY_LABELS } from "@/lib/loyalty";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { RewardCheckoutForm } from "@/app/components/loyalty/RewardCheckoutForm";

export default async function RewardDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const item = await prisma.rewardItem.findUnique({ where: { slug } });
  if (!item || !item.active) notFound();

  const locked = !canUnlock(user.tier, item.tier);
  const soldOut = item.stock <= 0;
  const broke = user.rewardPoints < item.pointsCost;
  const blockReason = locked
    ? `Locked to ${item.tier} tier (you're ${user.tier})`
    : soldOut
      ? "Sold out"
      : broke
        ? `Need ${(item.pointsCost - user.rewardPoints).toLocaleString()} more points`
        : null;

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href={`/${locale}/rewards`} className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:text-voltra">
            ← Rewards
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            Balance · <span className="text-voltra tabular">{user.rewardPoints.toLocaleString()}</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10 lg:py-20">
        <div className="grid gap-16 lg:grid-cols-12">
          <section className="lg:col-span-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              § {CATEGORY_LABELS[item.category] ?? item.category}
            </span>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.85] tracking-[-0.02em]">
              {item.name}
            </h1>
            <div className="mt-10 relative isolate aspect-square border border-border bg-surface">
              <div className="absolute inset-1/4 blur-3xl opacity-30 bg-voltra" />
              <Image
                src={item.imageUrl ?? "/logo.svg"}
                alt={item.name}
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(0,255,65,0.55)] p-12"
              />
            </div>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-text-muted">
              {item.description}
            </p>
          </section>

          <aside className="lg:col-span-6">
            <div className="clip-tag border border-border bg-surface p-8">
              <div className="grid grid-cols-2 items-end gap-4 border-b border-border pb-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Cost</div>
                  <div className="font-display text-5xl text-gradient-green tabular">{item.pointsCost.toLocaleString()}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">Volts</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">In Stock</div>
                  <div className={`font-display text-5xl tabular ${soldOut ? "text-red-400" : "text-text"}`}>
                    {soldOut ? "0" : item.stock}
                  </div>
                </div>
              </div>

              {blockReason ? (
                <div className="mt-6 clip-tag border border-red-500/40 bg-red-500/10 p-4 font-mono text-[11px] uppercase tracking-[0.18em] text-red-300">
                  {blockReason}
                </div>
              ) : (
                <RewardCheckoutForm itemId={item.id} country={user.country ?? "US"} />
              )}
            </div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
              Earn more points via{" "}
              <Link href={`/${locale}/redeem`} className="text-voltra hover:underline">
                can codes →
              </Link>
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
