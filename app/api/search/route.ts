import { NextRequest, NextResponse } from "next/server";
import { search, type SearchType } from "@/lib/search";

const TYPE_VALUES: SearchType[] = ["all", "products", "athletes", "articles", "videos"];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const typeRaw = sp.get("type") ?? "all";
  const type = (TYPE_VALUES.includes(typeRaw as SearchType) ? typeRaw : "all") as SearchType;

  const limit = Math.min(parseInt(sp.get("limit") ?? "24", 10) || 24, 100);

  const result = await search({
    q: sp.get("q") ?? undefined,
    type,
    sport: sp.get("sport") ?? undefined,
    region: sp.get("region") ?? undefined,
    category: sp.get("category") ?? undefined,
    locale: sp.get("locale") ?? undefined,
    limit,
  });

  return NextResponse.json(result, {
    headers: {
      // Short cache for popular queries.
      "Cache-Control": "public, max-age=10, stale-while-revalidate=60",
    },
  });
}
