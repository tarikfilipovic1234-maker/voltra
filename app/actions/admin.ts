"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

// ─── Slug helper ────────────────────────────────────────────────────────
function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ─── Athletes ───────────────────────────────────────────────────────────
const AthleteSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().optional(),
  sport: z.string().trim().min(1).max(60),
  discipline: z.string().trim().max(60).optional(),
  country: z.string().trim().length(2),
  region: z.string().trim().min(2).max(8),
  bio: z.string().trim().min(1),
  imageUrl: z.string().trim().optional(),
  hero: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
  active: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export async function saveAthlete(id: string | null, formData: FormData) {
  await requireRole("EDITOR");
  const parsed = AthleteSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sport: formData.get("sport"),
    discipline: formData.get("discipline"),
    country: String(formData.get("country") ?? "").toUpperCase(),
    region: String(formData.get("region") ?? "").toUpperCase(),
    bio: formData.get("bio"),
    imageUrl: formData.get("imageUrl"),
    hero: formData.get("hero"),
    active: formData.get("active"),
  });
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  const data = {
    name: parsed.data.name,
    slug: parsed.data.slug?.trim() || slugify(parsed.data.name),
    sport: parsed.data.sport,
    discipline: parsed.data.discipline || null,
    country: parsed.data.country,
    region: parsed.data.region,
    bio: parsed.data.bio,
    imageUrl: parsed.data.imageUrl || null,
    hero: Boolean(parsed.data.hero),
    active: Boolean(parsed.data.active),
  };

  if (id) {
    await prisma.athlete.update({ where: { id }, data });
  } else {
    await prisma.athlete.create({ data });
  }
  revalidatePath("/admin/athletes");
  revalidatePath("/", "layout");
  redirect("/admin/athletes");
}

export async function deleteAthlete(id: string) {
  await requireRole("EDITOR");
  await prisma.athlete.delete({ where: { id } });
  revalidatePath("/admin/athletes");
  revalidatePath("/", "layout");
}

// ─── Products ───────────────────────────────────────────────────────────
const ProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().optional(),
  code: z.string().trim().min(1).max(20),
  flavor: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1),
  caffeineMg: z.coerce.number().int().min(0).max(500),
  sugarG: z.coerce.number().int().min(0).max(200),
  calories: z.coerce.number().int().min(0).max(500),
  juicePct: z.coerce.number().int().min(0).max(100),
  accentColor: z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/),
  badge: z.string().trim().max(40).optional(),
  regions: z.string().trim().min(1),
  active: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export async function saveProduct(id: string | null, formData: FormData) {
  await requireRole("EDITOR");
  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    code: formData.get("code"),
    flavor: formData.get("flavor"),
    description: formData.get("description"),
    caffeineMg: formData.get("caffeineMg"),
    sugarG: formData.get("sugarG"),
    calories: formData.get("calories"),
    juicePct: formData.get("juicePct") ?? 0,
    accentColor: formData.get("accentColor"),
    badge: formData.get("badge"),
    regions: formData.get("regions"),
    active: formData.get("active"),
  });
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  const data = {
    name: parsed.data.name,
    slug: parsed.data.slug?.trim() || slugify(parsed.data.name),
    code: parsed.data.code,
    flavor: parsed.data.flavor,
    description: parsed.data.description,
    caffeineMg: parsed.data.caffeineMg,
    sugarG: parsed.data.sugarG,
    calories: parsed.data.calories,
    juicePct: parsed.data.juicePct,
    accentColor: parsed.data.accentColor,
    badge: parsed.data.badge || null,
    regions: parsed.data.regions
      .split(",")
      .map((r) => r.trim().toUpperCase())
      .filter(Boolean)
      .join(","),
    active: Boolean(parsed.data.active),
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    await prisma.product.create({ data });
  }
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireRole("EDITOR");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

// ─── Videos ─────────────────────────────────────────────────────────────
const VideoSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1),
  url: z.string().trim().min(1),
  thumbnail: z.string().trim().optional(),
  sport: z.string().trim().optional(),
  region: z.string().trim().optional(),
  athleteId: z.string().trim().optional(),
  featured: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export async function saveVideo(id: string | null, formData: FormData) {
  await requireRole("EDITOR");
  const parsed = VideoSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    url: formData.get("url"),
    thumbnail: formData.get("thumbnail"),
    sport: formData.get("sport"),
    region: formData.get("region"),
    athleteId: formData.get("athleteId"),
    featured: formData.get("featured"),
  });
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  const data = {
    title: parsed.data.title,
    description: parsed.data.description,
    url: parsed.data.url,
    thumbnail: parsed.data.thumbnail || null,
    sport: parsed.data.sport || null,
    region: parsed.data.region ? parsed.data.region.toUpperCase() : null,
    athleteId: parsed.data.athleteId || null,
    featured: Boolean(parsed.data.featured),
  };

  if (id) {
    await prisma.video.update({ where: { id }, data });
  } else {
    await prisma.video.create({ data });
  }
  revalidatePath("/admin/videos");
}

export async function deleteVideo(id: string) {
  await requireRole("EDITOR");
  await prisma.video.delete({ where: { id } });
  revalidatePath("/admin/videos");
}

// ─── Articles ───────────────────────────────────────────────────────────
const ArticleSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().optional(),
  excerpt: z.string().trim().min(1).max(400),
  body: z.string().trim().min(1),
  cover: z.string().trim().optional(),
  category: z.string().trim().min(1).max(60),
  tags: z.string().trim().optional(),
  locale: z.string().trim().min(2).max(5),
  region: z.string().trim().optional(),
  published: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export async function saveArticle(id: string | null, formData: FormData) {
  const session = await requireRole("EDITOR");
  const parsed = ArticleSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    cover: formData.get("cover"),
    category: formData.get("category"),
    tags: formData.get("tags"),
    locale: formData.get("locale"),
    region: formData.get("region"),
    published: formData.get("published"),
  });
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  const willPublish = Boolean(parsed.data.published);
  const data = {
    title: parsed.data.title,
    slug: parsed.data.slug?.trim() || slugify(parsed.data.title),
    excerpt: parsed.data.excerpt,
    body: parsed.data.body,
    cover: parsed.data.cover || null,
    category: parsed.data.category,
    tags: parsed.data.tags ?? "",
    locale: parsed.data.locale,
    region: parsed.data.region || null,
    published: willPublish,
    publishedAt: willPublish ? new Date() : null,
    authorId: session.user.id,
  };

  if (id) {
    await prisma.article.update({ where: { id }, data });
  } else {
    await prisma.article.create({ data });
  }
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  await requireRole("EDITOR");
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
}

// ─── Events ─────────────────────────────────────────────────────────────
const EventSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().optional(),
  location: z.string().trim().min(1),
  region: z.string().trim().min(2).max(8),
  country: z.string().trim().optional(),
  sport: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  url: z.string().trim().optional(),
  active: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export async function saveEvent(id: string | null, formData: FormData) {
  await requireRole("EDITOR");
  const parsed = EventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    location: formData.get("location"),
    region: String(formData.get("region") ?? "").toUpperCase(),
    country: formData.get("country"),
    sport: formData.get("sport"),
    imageUrl: formData.get("imageUrl"),
    url: formData.get("url"),
    active: formData.get("active"),
  });
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  const data = {
    title: parsed.data.title,
    description: parsed.data.description,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    location: parsed.data.location,
    region: parsed.data.region,
    country: parsed.data.country ? parsed.data.country.toUpperCase() : null,
    sport: parsed.data.sport || null,
    imageUrl: parsed.data.imageUrl || null,
    url: parsed.data.url || null,
    active: Boolean(parsed.data.active),
  };
  if (id) await prisma.event.update({ where: { id }, data });
  else await prisma.event.create({ data });
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireRole("EDITOR");
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
}

// ─── Users (admin only) ─────────────────────────────────────────────────
export async function setUserRole(id: string, role: "USER" | "EDITOR" | "ADMIN") {
  await requireRole("ADMIN");
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}

export async function adjustPoints(id: string, delta: number) {
  await requireRole("ADMIN");
  await prisma.user.update({ where: { id }, data: { rewardPoints: { increment: delta } } });
  revalidatePath("/admin/users");
}
