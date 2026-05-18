import "server-only";
import { prisma } from "@/lib/prisma";

export type SearchType = "all" | "products" | "athletes" | "articles" | "videos";

export type SearchHit = {
  type: "product" | "athlete" | "article" | "video";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  image?: string | null;
  accent?: string;
  meta?: string;
};

export type SearchFilters = {
  q?: string;
  type?: SearchType;
  sport?: string;
  region?: string;
  category?: string;
  locale?: string;
  limit?: number;
};

export type SearchResult = {
  hits: SearchHit[];
  total: number;
  facets: {
    types: { value: SearchType; count: number }[];
    sports: { value: string; count: number }[];
    regions: { value: string; count: number }[];
    categories: { value: string; count: number }[];
  };
};

function contains(field: string, q: string) {
  // SQLite is case-insensitive by default for ASCII; for unicode use COLLATE NOCASE
  return { [field]: { contains: q } };
}

export async function search(filters: SearchFilters): Promise<SearchResult> {
  const q = (filters.q ?? "").trim();
  const type: SearchType = filters.type ?? "all";
  const limit = filters.limit ?? 24;
  const lower = q.toLowerCase();

  const hits: SearchHit[] = [];

  // ─── Products ────────────────────────────────────────────────────────
  const productWhere: Record<string, unknown> = { active: true };
  if (filters.region) productWhere.regions = { contains: filters.region };
  if (q) {
    productWhere.OR = [
      { name: { contains: q } },
      { flavor: { contains: q } },
      { description: { contains: q } },
      { code: { contains: q } },
      { name: { contains: lower } },
      { flavor: { contains: lower } },
    ];
  }
  // ─── Athletes ────────────────────────────────────────────────────────
  const athleteWhere: Record<string, unknown> = { active: true };
  if (filters.sport) athleteWhere.sport = filters.sport;
  if (filters.region) athleteWhere.region = filters.region;
  if (q) {
    athleteWhere.OR = [
      { name: { contains: q } },
      { sport: { contains: q } },
      { discipline: { contains: q } },
      { bio: { contains: q } },
      { name: { contains: lower } },
    ];
  }
  // ─── Articles ────────────────────────────────────────────────────────
  const articleWhere: Record<string, unknown> = { published: true };
  if (filters.category) articleWhere.category = filters.category;
  if (filters.locale) articleWhere.locale = filters.locale;
  if (filters.region) articleWhere.OR = [{ region: filters.region }, { region: null }];
  if (q) {
    articleWhere.AND = [
      {
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
          { body: { contains: q } },
          { tags: { contains: q } },
          { title: { contains: lower } },
        ],
      },
    ];
  }
  // ─── Videos ──────────────────────────────────────────────────────────
  const videoWhere: Record<string, unknown> = {};
  if (filters.sport) videoWhere.sport = filters.sport;
  if (filters.region) videoWhere.OR = [{ region: filters.region }, { region: null }];
  if (q) {
    videoWhere.AND = [
      {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { sport: { contains: q } },
        ],
      },
    ];
  }

  const [products, athletes, articles, videos] = await Promise.all([
    type === "all" || type === "products"
      ? prisma.product.findMany({ where: productWhere, take: limit, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    type === "all" || type === "athletes"
      ? prisma.athlete.findMany({ where: athleteWhere, take: limit, orderBy: { name: "asc" } })
      : Promise.resolve([]),
    type === "all" || type === "articles"
      ? prisma.article.findMany({ where: articleWhere, take: limit, orderBy: { publishedAt: "desc" } })
      : Promise.resolve([]),
    type === "all" || type === "videos"
      ? prisma.video.findMany({ where: videoWhere, take: limit, orderBy: { publishedAt: "desc" } })
      : Promise.resolve([]),
  ]);

  for (const p of products) {
    hits.push({
      type: "product",
      id: p.id,
      title: p.name,
      subtitle: p.flavor,
      href: `/products/${p.slug}`,
      accent: p.accentColor,
      meta: `${p.caffeineMg}mg · ${p.code}`,
    });
  }
  for (const a of athletes) {
    hits.push({
      type: "athlete",
      id: a.id,
      title: a.name,
      subtitle: `${a.sport} · ${a.country}`,
      href: `/athletes/${a.slug}`,
      image: a.imageUrl,
      meta: a.discipline ?? undefined,
    });
  }
  for (const a of articles) {
    hits.push({
      type: "article",
      id: a.id,
      title: a.title,
      subtitle: a.excerpt,
      href: `/articles/${a.slug}`,
      image: a.cover,
      meta: a.category,
    });
  }
  for (const v of videos) {
    hits.push({
      type: "video",
      id: v.id,
      title: v.title,
      subtitle: v.description,
      href: v.url,
      image: v.thumbnail,
      meta: v.sport ?? undefined,
    });
  }

  // ─── Facets ──────────────────────────────────────────────────────────
  const [productCount, athleteCount, articleCount, videoCount] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.athlete.count({ where: { active: true } }),
    prisma.article.count({ where: { published: true } }),
    prisma.video.count(),
  ]);

  const sportRows = await prisma.athlete.groupBy({
    by: ["sport"],
    where: { active: true },
    _count: { _all: true },
    orderBy: { _count: { sport: "desc" } },
  });
  const regionRows = await prisma.athlete.groupBy({
    by: ["region"],
    where: { active: true },
    _count: { _all: true },
  });
  const categoryRows = await prisma.article.groupBy({
    by: ["category"],
    where: { published: true },
    _count: { _all: true },
  });

  return {
    hits,
    total: hits.length,
    facets: {
      types: [
        { value: "products", count: productCount },
        { value: "athletes", count: athleteCount },
        { value: "articles", count: articleCount },
        { value: "videos",   count: videoCount   },
      ],
      sports:     sportRows.map((s)    => ({ value: s.sport,    count: s._count._all })),
      regions:    regionRows.map((r)   => ({ value: r.region,   count: r._count._all })),
      categories: categoryRows.map((c) => ({ value: c.category, count: c._count._all })),
    },
  };
}
