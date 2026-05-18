import { Athletes } from "../components/Athletes";
import { EventCountdown } from "../components/EventCountdown";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { LiveBar } from "../components/LiveBar";
import { Manifesto } from "../components/Manifesto";
import { Marquee } from "../components/Marquee";
import { Nav } from "../components/Nav";
import { ProductLineup } from "../components/ProductLineup";
import { Stats } from "../components/Stats";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { resolveRegion } from "@/lib/i18n/resolve";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { trackPageView } from "@/lib/analytics";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const [dict, region, session] = await Promise.all([
    getDictionary(locale),
    resolveRegion(),
    auth(),
  ]);
  // Fire-and-forget — analytics never blocks render
  void trackPageView({ path: `/${lang}`, userId: session?.user?.id });

  // CMS-driven content for the landing page, filtered by region.
  const [products, athletesByRegion, totalAthletes] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, regions: { contains: region } },
      orderBy: { code: "asc" },
      take: 6,
    }),
    prisma.athlete.groupBy({
      by: ["sport"],
      where: { active: true },
      _count: { _all: true },
      orderBy: { _count: { sport: "desc" } },
      take: 4,
    }),
    prisma.athlete.count({ where: { active: true } }),
  ]);

  return (
    <>
      <Nav dict={dict} locale={locale} session={session} />
      <main>
        <Hero dict={dict} />
        <LiveBar />
        <Marquee />
        <ProductLineup dict={dict} products={products} region={region} />
        <EventCountdown region={region} />
        <Stats dict={dict} />
        <Marquee reverse speed="slow" />
        <Athletes dict={dict} sports={athletesByRegion} totalAthletes={totalAthletes} />
        <Manifesto dict={dict} />
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
