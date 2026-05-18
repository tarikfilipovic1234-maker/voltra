import "server-only";
import { cookies, headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "voltra.sid";

async function getSessionId(): Promise<string> {
  const c = await cookies();
  let sid = c.get(SESSION_COOKIE)?.value;
  if (!sid) {
    sid = randomUUID();
    c.set(SESSION_COOKIE, sid, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return sid;
}

async function getContext() {
  const h = await headers();
  const c = await cookies();
  return {
    region: c.get("voltra.region")?.value ?? null,
    locale: c.get("voltra.locale")?.value ?? null,
    country:
      h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null,
    referer: h.get("referer") ?? null,
    sessionId: await getSessionId(),
  };
}

export type TrackPageInput = {
  path: string;
  athleteId?: string;
  productId?: string;
  articleId?: string;
  userId?: string | null;
};

/**
 * Fire-and-forget pageview log. Never throws — analytics must never break a render.
 */
export async function trackPageView(input: TrackPageInput) {
  try {
    const ctx = await getContext();
    await prisma.pageView.create({
      data: {
        path: input.path,
        locale: ctx.locale,
        region: ctx.region,
        country: ctx.country,
        referer: ctx.referer?.slice(0, 500) ?? null,
        userId: input.userId ?? null,
        sessionId: ctx.sessionId,
        athleteId: input.athleteId ?? null,
        productId: input.productId ?? null,
        articleId: input.articleId ?? null,
      },
    });
  } catch {
    // swallow
  }
}

export type TrackEventInput = {
  kind:
    | "PRODUCT_CLICK"
    | "FLAVOR_CLICK"
    | "CTA_CLICK"
    | "STORE_SEARCH"
    | "SEARCH"
    | "VIDEO_PLAY";
  productId?: string;
  athleteId?: string;
  value?: string;
  userId?: string | null;
};

export async function trackEvent(input: TrackEventInput) {
  try {
    const ctx = await getContext();
    await prisma.trackEvent.create({
      data: {
        kind: input.kind,
        productId: input.productId ?? null,
        athleteId: input.athleteId ?? null,
        value: input.value?.slice(0, 200) ?? null,
        region: ctx.region,
        country: ctx.country,
        userId: input.userId ?? null,
        sessionId: ctx.sessionId,
      },
    });
  } catch {
    // swallow
  }
}
