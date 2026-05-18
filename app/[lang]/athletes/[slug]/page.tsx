import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { trackPageView } from "@/lib/analytics";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ReviewBlock } from "@/app/components/community/ReviewBlock";

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";

  const [athlete, dict, session] = await Promise.all([
    prisma.athlete.findUnique({ where: { slug } }),
    getDictionary(locale),
    auth(),
  ]);
  if (!athlete || !athlete.active) notFound();

  void trackPageView({
    path: `/${lang}/athletes/${slug}`,
    athleteId: athlete.id,
    userId: session?.user?.id,
  });

  const [videos, stream, relatedAthletes] = await Promise.all([
    prisma.video.findMany({
      where: { athleteId: athlete.id },
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
    prisma.stream.findFirst({
      where: { athleteId: athlete.id, active: true },
    }),
    prisma.athlete.findMany({
      where: {
        active: true,
        sport: athlete.sport,
        id: { not: athlete.id },
      },
      take: 4,
    }),
  ]);

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3"
          >
            <div className="relative h-10 w-10">
              <Image
                src="/logo.svg"
                alt=""
                fill
                sizes="40px"
                className="object-contain drop-shadow-[0_0_10px_rgba(0,255,65,0.55)]"
              />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              VOLTRA<span className="text-voltra">/</span>Athlete
            </span>
          </Link>
          <Link
            href={`/${locale}/search?type=athletes`}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:text-voltra"
          >
            ← All Athletes
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-border bg-bg">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-[12%] top-1/2 h-[140%] w-[70%] -translate-y-1/2 animate-drift">
            <div className="halo opacity-50" />
            <Image
              src="/logo.svg"
              alt=""
              fill
              sizes="70vw"
              className="object-contain object-right opacity-20 drop-shadow-[0_0_120px_rgba(0,255,65,0.4)]"
            />
          </div>
        </div>

        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-6 pb-16 pt-20 lg:grid-cols-12 lg:px-10 lg:pb-24 lg:pt-28">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              <span>§ Athlete</span>
              <span className="text-text-dim">/</span>
              <span className="text-text-muted">{athlete.sport}</span>
              {athlete.discipline && (
                <>
                  <span className="text-text-dim">·</span>
                  <span className="text-text-muted">{athlete.discipline}</span>
                </>
              )}
            </div>
            <h1 className="mt-6 font-display text-[clamp(4rem,12vw,13rem)] leading-[0.85] tracking-[-0.02em]">
              <span className="text-gradient-green">{athlete.name.split(" ")[0]}</span>
              {athlete.name.includes(" ") && (
                <>
                  <br />
                  <span className="text-text">{athlete.name.split(" ").slice(1).join(" ")}</span>
                </>
              )}
            </h1>
            <p className="mt-10 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
              {athlete.bio}
            </p>
          </div>

          <aside className="lg:col-span-4">
            <div className="clip-tag border border-border bg-surface p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
                Athlete Card
              </div>
              <dl className="mt-5 divide-y divide-border border-y border-border font-mono text-xs uppercase tracking-[0.18em]">
                <Row label="Sport" value={athlete.sport} />
                {athlete.discipline && <Row label="Discipline" value={athlete.discipline} />}
                <Row label="Country" value={athlete.country} />
                <Row label="Region" value={athlete.region} />
                {athlete.hero && <Row label="Tier" value="Hero" accent />}
                <Row label="Signed" value={athlete.createdAt.toISOString().slice(0, 10)} />
              </dl>

              {stream && (
                <Link
                  href={stream.live ? `https://${stream.platform === "TWITCH" ? "twitch.tv" : stream.platform === "YOUTUBE" ? "youtube.com" : "kick.com"}/${stream.channel}` : "#"}
                  target={stream.live ? "_blank" : undefined}
                  className={`mt-6 flex items-center justify-between gap-2 border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
                    stream.live
                      ? "border-voltra/40 bg-voltra/10 text-voltra hover:bg-voltra/20"
                      : "border-border bg-bg text-text-dim"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {stream.live ? (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 animate-ping rounded-full bg-voltra opacity-75" />
                        <span className="relative h-2 w-2 rounded-full bg-voltra" />
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-text-dim" />
                    )}
                    {stream.live ? "Live now" : "Offline"}
                  </span>
                  <span>{stream.platform} · {stream.channel}</span>
                </Link>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Videos */}
      {videos.length > 0 && (
        <section className="border-b border-border bg-bg py-20">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
            <h2 className="font-display text-4xl border-b border-border pb-4">
              <span className="text-voltra">§ Footage</span>{" "}
              <span className="text-text-muted">/ {videos.length} clip{videos.length === 1 ? "" : "s"}</span>
            </h2>
            <ul className="mt-8 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <li key={v.id} className="bg-bg p-6">
                  <div className="aspect-video border border-border bg-surface relative overflow-hidden">
                    {v.thumbnail ? (
                      <Image
                        src={v.thumbnail}
                        alt={v.title}
                        fill
                        sizes="(min-width: 1024px) 400px, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <Image
                          src="/logo.svg"
                          alt=""
                          width={80}
                          height={80}
                          className="object-contain opacity-40"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-xl leading-tight">{v.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
                    {v.description}
                  </p>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.22em] text-voltra hover:underline"
                  >
                    Watch →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Related */}
      {relatedAthletes.length > 0 && (
        <section className="border-b border-border bg-bg py-16">
          <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
            <h2 className="font-display text-3xl border-b border-border pb-4">
              <span className="text-voltra">§ Same lineup</span>
            </h2>
            <ul className="mt-6 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {relatedAthletes.map((a) => (
                <li key={a.id} className="bg-bg p-6">
                  <Link href={`/${locale}/athletes/${a.slug}`} className="block">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                      {a.region} · {a.discipline ?? a.sport}
                    </div>
                    <h3 className="mt-3 font-display text-2xl">{a.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-text-muted">{a.bio}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Reviews (community) */}
      <section className="bg-bg pb-20">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <ReviewBlock
            targetType="ATHLETE"
            targetId={athlete.id}
            redirectTo={`/${locale}/athletes/${slug}`}
            locale={locale}
          />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-text-dim">{label}</dt>
      <dd className={accent ? "text-voltra" : "text-text"}>{value}</dd>
    </div>
  );
}
