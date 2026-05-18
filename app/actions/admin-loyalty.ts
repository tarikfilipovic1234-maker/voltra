"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

// ─── Promo codes ────────────────────────────────────────────────────────
const PromoSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9-]+$/),
  points: z.coerce.number().int().min(1).max(100000),
  maxRedemptions: z.coerce.number().int().min(1).max(99999999),
  source: z.string().trim().min(1).max(20),
  campaign: z.string().trim().max(120).optional(),
  expiresAt: z.string().optional(),
  active: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export async function savePromoCode(id: string | null, formData: FormData) {
  await requireRole("EDITOR");
  const parsed = PromoSchema.safeParse({
    code: formData.get("code"),
    points: formData.get("points"),
    maxRedemptions: formData.get("maxRedemptions") || 1,
    source: formData.get("source"),
    campaign: formData.get("campaign"),
    expiresAt: formData.get("expiresAt"),
    active: formData.get("active"),
  });
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }
  const data = {
    code: parsed.data.code,
    points: parsed.data.points,
    maxRedemptions: parsed.data.maxRedemptions,
    source: parsed.data.source.toUpperCase(),
    campaign: parsed.data.campaign || null,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    active: Boolean(parsed.data.active),
  };
  if (id) {
    await prisma.promoCode.update({ where: { id }, data });
  } else {
    await prisma.promoCode.create({ data });
  }
  revalidatePath("/admin/promo-codes");
  redirect("/admin/promo-codes");
}

export async function deletePromoCode(id: string) {
  await requireRole("EDITOR");
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promo-codes");
}

export async function generatePromoBatch(formData: FormData) {
  await requireRole("EDITOR");
  const { mintPromoBatch } = await import("@/lib/promo-codes");

  const prefix = String(formData.get("prefix") ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  const count = Math.max(1, Math.min(10_000, parseInt(String(formData.get("count") ?? "100"), 10) || 100));
  const points = Math.max(1, Math.min(10000, parseInt(String(formData.get("points") ?? "50"), 10) || 50));
  const source = String(formData.get("source") ?? "CAN").toUpperCase().slice(0, 20);
  const campaign = String(formData.get("campaign") ?? "Auto-batch").trim() || null;
  const maxRedemptions = Math.max(1, Math.min(999_999, parseInt(String(formData.get("maxRedemptions") ?? "1"), 10) || 1));
  const codeLength = Math.max(6, Math.min(16, parseInt(String(formData.get("codeLength") ?? "10"), 10) || 10));
  const expiresIso = String(formData.get("expiresAt") ?? "").trim();

  const result = await mintPromoBatch({
    prefix,
    count,
    points,
    source,
    campaign: campaign ?? undefined,
    maxRedemptions,
    codeLength,
    expiresAt: expiresIso ? new Date(expiresIso) : null,
  });

  revalidatePath("/admin/promo-codes");
  return { ok: true, generated: result.generated.length, codes: result.generated, duplicatesSkipped: result.duplicatesSkipped };
}

// ─── Reward items ──────────────────────────────────────────────────────
const RewardSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(1),
  imageUrl: z.string().trim().optional(),
  pointsCost: z.coerce.number().int().min(1).max(1000000),
  stock: z.coerce.number().int().min(0).max(1000000),
  category: z.string().trim().min(1).max(40),
  tier: z.string().trim().optional(),
  active: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

function slugify(input: string) {
  return input.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export async function saveRewardItem(id: string | null, formData: FormData) {
  await requireRole("EDITOR");
  const parsed = RewardSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    pointsCost: formData.get("pointsCost"),
    stock: formData.get("stock"),
    category: formData.get("category"),
    tier: formData.get("tier"),
    active: formData.get("active"),
  });
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  const data = {
    name: parsed.data.name,
    slug: parsed.data.slug?.trim() || slugify(parsed.data.name),
    description: parsed.data.description,
    imageUrl: parsed.data.imageUrl || null,
    pointsCost: parsed.data.pointsCost,
    stock: parsed.data.stock,
    category: parsed.data.category.toUpperCase(),
    tier: parsed.data.tier?.toUpperCase() || null,
    active: Boolean(parsed.data.active),
  };
  if (id) {
    await prisma.rewardItem.update({ where: { id }, data });
  } else {
    await prisma.rewardItem.create({ data });
  }
  revalidatePath("/admin/rewards");
  revalidatePath("/", "layout");
  redirect("/admin/rewards");
}

export async function deleteRewardItem(id: string) {
  await requireRole("EDITOR");
  await prisma.rewardItem.delete({ where: { id } });
  revalidatePath("/admin/rewards");
}

// ─── Merch products ────────────────────────────────────────────────────
const MerchSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().optional(),
  description: z.string().trim().min(1),
  imageUrl: z.string().trim().optional(),
  priceCents: z.coerce.number().int().min(0).max(10000000),
  currency: z.string().trim().length(3),
  stock: z.coerce.number().int().min(0).max(1000000),
  category: z.string().trim().min(1).max(40),
  dropAt: z.string().optional(),
  dropEndsAt: z.string().optional(),
  active: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
  featured: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export async function saveMerch(id: string | null, formData: FormData) {
  await requireRole("EDITOR");
  const parsed = MerchSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    priceCents: formData.get("priceCents"),
    currency: String(formData.get("currency") ?? "USD").toUpperCase(),
    stock: formData.get("stock"),
    category: formData.get("category"),
    dropAt: formData.get("dropAt"),
    dropEndsAt: formData.get("dropEndsAt"),
    active: formData.get("active"),
    featured: formData.get("featured"),
  });
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  const data = {
    name: parsed.data.name,
    slug: parsed.data.slug?.trim() || slugify(parsed.data.name),
    description: parsed.data.description,
    imageUrl: parsed.data.imageUrl || null,
    priceCents: parsed.data.priceCents,
    currency: parsed.data.currency,
    stock: parsed.data.stock,
    category: parsed.data.category.toUpperCase(),
    dropAt: parsed.data.dropAt ? new Date(parsed.data.dropAt) : null,
    dropEndsAt: parsed.data.dropEndsAt ? new Date(parsed.data.dropEndsAt) : null,
    active: Boolean(parsed.data.active),
    featured: Boolean(parsed.data.featured),
  };
  if (id) {
    await prisma.merchProduct.update({ where: { id }, data });
  } else {
    await prisma.merchProduct.create({ data });
  }
  revalidatePath("/admin/merch");
  revalidatePath("/shop");
  redirect("/admin/merch");
}

export async function deleteMerch(id: string) {
  await requireRole("EDITOR");
  await prisma.merchProduct.delete({ where: { id } });
  revalidatePath("/admin/merch");
}

// ─── Streams ───────────────────────────────────────────────────────────
const StreamSchema = z.object({
  platform: z.string().trim().toUpperCase(),
  channel: z.string().trim().min(1).max(100),
  displayName: z.string().trim().min(1).max(120),
  athleteId: z.string().trim().optional(),
  region: z.string().trim().optional(),
  category: z.string().trim().optional(),
  featured: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
  active: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export async function saveStream(id: string | null, formData: FormData) {
  await requireRole("EDITOR");
  const parsed = StreamSchema.safeParse({
    platform: formData.get("platform"),
    channel: formData.get("channel"),
    displayName: formData.get("displayName"),
    athleteId: formData.get("athleteId"),
    region: formData.get("region"),
    category: formData.get("category"),
    featured: formData.get("featured"),
    active: formData.get("active"),
  });
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  const data = {
    platform: parsed.data.platform,
    channel: parsed.data.channel,
    displayName: parsed.data.displayName,
    athleteId: parsed.data.athleteId || null,
    region: parsed.data.region?.toUpperCase() || null,
    category: parsed.data.category || null,
    featured: Boolean(parsed.data.featured),
    active: Boolean(parsed.data.active),
    lastChecked: null,
  };
  if (id) {
    await prisma.stream.update({ where: { id }, data });
  } else {
    await prisma.stream.create({ data });
  }
  revalidatePath("/admin/streams");
  revalidatePath("/", "layout");
  redirect("/admin/streams");
}

export async function deleteStream(id: string) {
  await requireRole("EDITOR");
  await prisma.stream.delete({ where: { id } });
  revalidatePath("/admin/streams");
}

// ─── Orders ────────────────────────────────────────────────────────────
export async function setOrderStatus(id: string, status: "PAID" | "FULFILLED" | "CANCELLED" | "EXPIRED") {
  await requireRole("ADMIN");
  await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(status === "PAID" ? { paidAt: new Date() } : {}),
    },
  });
  revalidatePath("/admin/orders");
}
