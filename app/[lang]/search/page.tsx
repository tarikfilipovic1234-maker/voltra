import Image from "next/image";
import Link from "next/link";
import { search, type SearchType } from "@/lib/search";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { resolveRegion } from "@/lib/i18n/resolve";
import { trackEvent, trackPageView } from "@/lib/analytics";
import { auth } from "@/lib/auth";
import { SearchInput } from "@/app/components/search/SearchInput";
import { FilterPill } from "@/app/components/search/FilterPill";

type SearchPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const TYPE_VALUES: SearchType[] = ["all", "products", "athletes", "articles", "videos"];

function pickType(value: string | string[] | undefined): SearchType {
  const v = Array.isArray(value) ? value[0] : value;
  return TYPE_VALUES.includes(v as SearchType) ? (v as SearchType) : "all";
}

function pickStr(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.trim() ? v.trim() : undefined;
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const sp = await searchParams;
  const q = pickStr(sp.q) ?? "";
  const type = pickType(sp.type);
  const sport = pickStr(sp.sport);
  const region = pickStr(sp.region);
  const category = pickStr(sp.category);

  const [dict, defaultRegion, results, session] = await Promise.all([
    getDictionary(locale),
    resolveRegion(),
    search({ q, type, sport, region, category, locale }),
    auth(),
  ]);
  void trackPageView({ path: `/${lang}/search`, userId: session?.user?.id });
  if (q) {
    void trackEvent({
      kind: "STORE_SEARCH",
      value: q,
      userId: session?.user?.id ?? null,
    });
  }

  const baseHref = `/${locale}/search`;
  const link = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q, type, sport, region, category, ...next };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return `${baseHref}?${params.toString()}`;
  };

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href={`/${locale}`} className="flex items-center gap-3">
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
              VOLTRA<span className="text-voltra">/</span>Search
            </span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
            Region · {defaultRegion}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10 lg:py-16">
        <div className="grid gap-6 border-b border-border pb-10 md:grid-cols-12">
          <div className="md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              § Find / 00
            </span>
          </div>
          <div className="md:col-span-10">
            <h1 className="font-display text-5xl leading-[0.9] tracking-[-0.01em] sm:text-7xl">
              <span className="text-gradient-green">{dict.search.title}</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              {results.total} {dict.search.results}
              {q && (
                <>
                  {" "}
                  · <span className="text-text">"{q}"</span>
                </>
              )}
            </p>
            <div className="mt-6">
              <SearchInput action={baseHref} defaultValue={q} placeholder={dict.search.placeholder} />
            </div>
          </div>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-12">
          {/* Facets sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-10">
              <FacetGroup title={dict.search.type} all={dict.search.all} allHref={link({ type: undefined })} active={type === "all"}>
                {results.facets.types.map((t) => (
                  <FilterPill
                    key={t.value}
                    href={link({ type: t.value })}
                    active={type === t.value}
                    count={t.count}
                    label={dict.search[t.value as "products" | "athletes" | "articles" | "videos"] ?? t.value}
                  />
                ))}
              </FacetGroup>

              <FacetGroup title={dict.search.sport} all={dict.search.all} allHref={link({ sport: undefined })} active={!sport}>
                {results.facets.sports.map((s) => (
                  <FilterPill
                    key={s.value}
                    href={link({ sport: s.value })}
                    active={sport === s.value}
                    count={s.count}
                    label={s.value}
                  />
                ))}
              </FacetGroup>

              <FacetGroup title={dict.search.region} all={dict.search.all} allHref={link({ region: undefined })} active={!region}>
                {results.facets.regions.map((r) => (
                  <FilterPill
                    key={r.value}
                    href={link({ region: r.value })}
                    active={region === r.value}
                    count={r.count}
                    label={r.value}
                  />
                ))}
              </FacetGroup>

              <FacetGroup title={dict.search.category} all={dict.search.all} allHref={link({ category: undefined })} active={!category}>
                {results.facets.categories.map((c) => (
                  <FilterPill
                    key={c.value}
                    href={link({ category: c.value })}
                    active={category === c.value}
                    count={c.count}
                    label={c.value}
                  />
                ))}
              </FacetGroup>
            </div>
          </aside>

          {/* Results */}
          <section className="lg:col-span-9">
            {results.hits.length === 0 ? (
              <div className="border border-border bg-surface p-16 text-center">
                <p className="font-display text-3xl text-gradient-green">∅</p>
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
                  {dict.search.noResults}
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
                {results.hits.map((hit) => (
                  <li
                    key={`${hit.type}-${hit.id}`}
                    className="group relative bg-bg p-6 transition-colors hover:bg-surface"
                  >
                    <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                      <span
                        className="text-voltra"
                        style={hit.accent ? { color: hit.accent } : undefined}
                      >
                        {hit.type}
                      </span>
                      {hit.meta && (
                        <span className="text-text-dim">{hit.meta}</span>
                      )}
                    </div>
                    <h3 className="font-display text-3xl leading-tight">
                      {hit.title}
                    </h3>
                    {hit.subtitle && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
                        {hit.subtitle}
                      </p>
                    )}
                    <a
                      href={hit.href}
                      className="absolute inset-0"
                      aria-label={hit.title}
                    />
                    <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                      <span>View →</span>
                      <span
                        aria-hidden
                        className="h-px w-12 bg-border transition-all group-hover:w-24 group-hover:bg-voltra"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function FacetGroup({
  title,
  children,
  all,
  allHref,
  active,
}: {
  title: string;
  children: React.ReactNode;
  all: string;
  allHref: string;
  active: boolean;
}) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.32em] text-voltra">
        {title}
      </h3>
      <ul className="space-y-1.5">
        <li>
          <FilterPill href={allHref} active={active} label={all} count={undefined} />
        </li>
        {children}
      </ul>
    </div>
  );
}
