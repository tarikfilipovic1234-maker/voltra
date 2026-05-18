import { NextRequest, NextResponse } from "next/server";
import { getTrackedStreams } from "@/lib/streams";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const onlyLive = sp.get("live") === "true";
  const featured = sp.get("featured") === "true" ? true : undefined;
  const streams = await getTrackedStreams({ onlyLive, featured });
  return NextResponse.json(
    { streams, total: streams.length, liveNow: streams.filter((s) => s.live).length },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}
