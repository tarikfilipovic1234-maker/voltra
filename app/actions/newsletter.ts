"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const EmailSchema = z.string().email().trim().toLowerCase();

export async function newsletterSignupAction(formData: FormData) {
  const parsed = EmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    redirect("/?newsletter=invalid");
  }
  const email = parsed.data;

  // Logged-in user — just flip their flag.
  const session = await auth();
  if (session?.user?.email) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { newsletter: true, rewardPoints: { increment: 50 } },
    });
    redirect("/?newsletter=ok");
  }

  // Anonymous — create a shadow user that can later be claimed on signup.
  await prisma.user.upsert({
    where: { email },
    update: { newsletter: true },
    create: { email, newsletter: true, name: "Newsletter Subscriber" },
  });

  redirect("/?newsletter=ok");
}
