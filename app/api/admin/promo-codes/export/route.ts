import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toCSV } from "@/lib/promo-codes";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const campaign = sp.get("campaign");
  const active = sp.get("active");

  const codes = await prisma.promoCode.findMany({
    where: {
      ...(campaign ? { campaign } : {}),
      ...(active === "true" ? { active: true } : active === "false" ? { active: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100_000,
  });

  const csv = toCSV(codes);
  const filename = `voltra-codes-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
