import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { RedeemForm } from "@/app/components/loyalty/RedeemForm";
import { prisma } from "@/lib/prisma";

export default async function RedeemPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  const dict = await getDictionary(locale);

  const history = await prisma.redemption.findMany({
    where: { userId: user.id },
    include: { code: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="relative min-h-screen bg-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-[12%] top-[10%] h-[80%] w-[60%] animate-drift">
          <div className="halo opacity-50" />
          <Image
            src="/logo.svg"
            alt=""
            fill
            sizes="60vw"
            className="object-contain opacity-25 drop-shadow-[0_0_120px_rgba(0,255,65,0.4)]"
          />
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image src="/logo.svg" alt="" fill sizes="40px" className="object-contain drop-shadow-[0_0_10px_rgba(0,255,65,0.55)]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              VOLTRA<span className="text-voltra">/</span>Redeem
            </span>
          </Link>
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            <Link href={`/${locale}/rewards`} className="hover:text-voltra">→ Rewards</Link>
            <Link href={`/${locale}/profile`} className="hover:text-voltra">{user.name ?? user.email}</Link>
            <span className="text-voltra tabular">{user.rewardPoints.toLocaleString()} pts</span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto grid max-w-[1440px] gap-16 px-6 py-16 lg:grid-cols-12 lg:px-10 lg:py-24">
        <section className="lg:col-span-7">
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
            § Loyalty / 01 · Redeem
          </span>
          <h1 className="mt-4 font-display text-[clamp(3rem,8vw,7rem)] leading-[0.85] tracking-[-0.02em]">
            Crack a can.<br/>
            <span className="text-gradient-green">Cash a code.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
            Every can in the Drop 016 family carries a 8-character code on the
            inside of the tab. Drop it here, watch the meter spike, climb tiers,
            unlock gear.
          </p>

          <div className="mt-12">
            <RedeemForm initialPoints={user.rewardPoints} tier={user.tier} dict={dict} />
          </div>
        </section>

        <aside className="lg:col-span-5">
          <div className="clip-tag border border-border bg-surface p-8">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
              <span>Tier · Balance</span>
              <span className="text-voltra">{user.tier}</span>
            </div>
            <div className="mt-6 font-display text-7xl leading-none text-gradient-green tabular">
              {user.rewardPoints.toLocaleString()}
            </div>
            <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-voltra">
              Volts
            </div>
            <TierMeter points={user.rewardPoints} />
          </div>

          <div className="mt-10">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.32em] text-voltra">Recent Redemptions</h3>
            <ul className="mt-4 divide-y divide-border border-y border-border font-mono text-xs">
              {history.length === 0 && <li className="py-3 text-text-dim">No codes redeemed yet — try VOLT-2026.</li>}
              {history.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3 uppercase tracking-[0.18em]">
                  <div>
                    <div className="text-text">{r.code.code}</div>
                    <div className="text-text-dim normal-case tracking-normal">
                      {r.code.campaign ?? "—"}
                    </div>
                  </div>
                  <span className="text-voltra tabular">+{r.pointsAwarded}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}

function TierMeter({ points }: { points: number }) {
  const tiers = [
    { name: "ROOKIE", at: 0 },
    { name: "SURGE", at: 1000 },
    { name: "APEX", at: 5000 },
  ];
  const next = tiers.find((t) => points < t.at);
  const pct = next ? Math.min(100, (points / next.at) * 100) : 100;
  return (
    <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
      <div className="flex justify-between">
        <span>Progress</span>
        <span className="text-voltra">{next ? `${next.at - points} → ${next.name}` : "MAX TIER"}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden bg-bg">
        <div
          className="h-full bg-gradient-to-r from-voltra-acid via-voltra to-voltra-deep transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
