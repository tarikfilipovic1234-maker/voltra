"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { isLocale, isRegion } from "@/lib/i18n/config";

const SignUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[a-zA-Z]/, "At least one letter")
    .regex(/[0-9]/, "At least one number"),
  newsletter: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .optional(),
});

export type AuthFormState =
  | {
      ok?: boolean;
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    newsletter: formData.get("newsletter"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password, newsletter } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const isAdmin = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      newsletter: Boolean(newsletter),
      role: isAdmin ? "ADMIN" : "USER",
      tier: isAdmin ? "APEX" : "ROOKIE",
      rewardPoints: isAdmin ? 1000 : 100,
    },
  });

  // Auto-sign-in
  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  redirect("/");
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Email and password required." };
  }
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return { error: "Invalid credentials." };
  }
  redirect("/");
}

export async function signInWithProvider(provider: string) {
  await signIn(provider, { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// ─── Profile updates ───────────────────────────────────────────────────
const ProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  locale: z.string().refine(isLocale, "Invalid locale"),
  region: z.string().refine(isRegion, "Invalid region"),
  country: z.string().trim().max(2).optional(),
  newsletter: z
    .union([z.literal("on"), z.literal("true"), z.literal(""), z.undefined()])
    .optional(),
});

export async function updateProfileAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await verifySession();
  if (!session) return { error: "Not signed in." };

  const parsed = ProfileSchema.safeParse({
    name: formData.get("name"),
    locale: formData.get("locale"),
    region: formData.get("region"),
    country: formData.get("country"),
    newsletter: formData.get("newsletter"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      locale: parsed.data.locale,
      region: parsed.data.region,
      country: parsed.data.country || null,
      newsletter: Boolean(parsed.data.newsletter),
    },
  });

  revalidatePath("/", "layout");
  return { ok: true };
}
