import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

// Crockford-style base32 — drops I, L, O, U so codes are easy to read off cans
// and unambiguous when typed back in.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTVWXYZ";

export function generateSecureCode(length = 10): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export type BatchPlan = {
  prefix: string;
  count: number;
  points: number;
  source: string;
  campaign?: string;
  maxRedemptions: number;
  expiresAt: Date | null;
  codeLength: number;
};

export type BatchResult = {
  generated: string[];
  duplicatesSkipped: number;
  campaign: string | null;
};

/**
 * Mint N cryptographically random codes. Collisions are extremely unlikely with
 * length≥10 but we still retry. Inserts in chunks for SQLite performance.
 */
export async function mintPromoBatch(plan: BatchPlan): Promise<BatchResult> {
  const codes = new Set<string>();
  let duplicates = 0;
  const target = Math.min(plan.count, 10_000);

  while (codes.size < target) {
    const candidate = `${plan.prefix}${plan.prefix ? "-" : ""}${generateSecureCode(plan.codeLength)}`;
    if (codes.has(candidate)) {
      duplicates++;
      continue;
    }
    codes.add(candidate);
  }

  const data = Array.from(codes).map((code) => ({
    code,
    points: plan.points,
    maxRedemptions: plan.maxRedemptions,
    source: plan.source,
    campaign: plan.campaign ?? null,
    expiresAt: plan.expiresAt,
    active: true,
  }));

  // Bulk insert in chunks of 500.
  for (let i = 0; i < data.length; i += 500) {
    const slice = data.slice(i, i + 500);
    try {
      await prisma.promoCode.createMany({ data: slice });
    } catch {
      // fall back to per-row inserts on any unique conflict
      for (const row of slice) {
        try {
          await prisma.promoCode.create({ data: row });
        } catch {
          duplicates++;
        }
      }
    }
  }

  return {
    generated: Array.from(codes),
    duplicatesSkipped: duplicates,
    campaign: plan.campaign ?? null,
  };
}

export function toCSV(codes: { code: string; points: number; campaign: string | null; source: string; expiresAt: Date | null; redeemedCount: number; maxRedemptions: number; active: boolean; createdAt: Date }[]): string {
  const header = "code,points,redeemed,cap,active,source,campaign,expires_at,created_at";
  const rows = codes.map((c) =>
    [
      c.code,
      c.points,
      c.redeemedCount,
      c.maxRedemptions,
      c.active ? "1" : "0",
      c.source,
      csvEscape(c.campaign ?? ""),
      c.expiresAt?.toISOString() ?? "",
      c.createdAt.toISOString(),
    ].join(",")
  );
  return [header, ...rows].join("\n");
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
