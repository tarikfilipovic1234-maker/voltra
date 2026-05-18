import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";

const KINDS = ["PRODUCT_CLICK", "FLAVOR_CLICK", "CTA_CLICK", "STORE_SEARCH", "SEARCH", "VIDEO_PLAY"] as const;

const BodySchema = z.object({
  kind: z.enum(KINDS),
  productId: z.string().max(40).optional(),
  athleteId: z.string().max(40).optional(),
  value: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const session = await auth();
  await trackEvent({
    ...parsed.data,
    userId: session?.user?.id ?? null,
  });
  return NextResponse.json({ ok: true });
}
