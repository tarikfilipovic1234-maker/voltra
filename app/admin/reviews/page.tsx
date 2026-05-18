import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { ModerateButtons } from "@/app/components/admin/ModerateButtons";
import { moderateReview, deleteReview } from "@/app/actions/admin-community";

export default async function ReviewsModPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status ?? "ALL";
  const where = filter === "ALL" ? {} : { status: filter };

  const reviews = await prisma.review.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, banned: true } } },
    orderBy: [{ flagCount: "desc" }, { createdAt: "desc" }],
    take: 200,
  });
  const counts = await prisma.review.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 12 / Reviews</span>
        <h1 className="mt-3 font-display text-5xl">Review Moderation</h1>
        <p className="mt-2 text-sm text-text-muted">
          {reviews.length} shown · Flagged items sort first.
        </p>
      </header>

      <div className="flex gap-2">
        <Filter href="/admin/reviews" label="All" active={filter === "ALL"} />
        {counts.map((c) => (
          <Filter
            key={c.status}
            href={`/admin/reviews?status=${c.status}`}
            label={`${c.status} · ${c._count._all}`}
            active={filter === c.status}
          />
        ))}
      </div>

      <ul className="grid gap-px bg-border lg:grid-cols-2">
        {reviews.map((r) => (
          <li key={r.id} className={`bg-bg p-6 ${r.flagCount > 0 ? "border-l-2 border-l-red-500" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
                  <span className="text-voltra">{r.targetType}</span>
                  <span className="text-text-dim">{r.targetId.slice(-6)}</span>
                  <Stars rating={r.rating} />
                </div>
                <h3 className="mt-2 font-display text-xl">{r.title}</h3>
              </div>
              <span className={r.status === "APPROVED" ? "text-voltra font-mono text-[10px] uppercase tracking-[0.22em]" : r.status === "PENDING" ? "text-voltra-acid font-mono text-[10px] uppercase tracking-[0.22em]" : "text-red-400 font-mono text-[10px] uppercase tracking-[0.22em]"}>
                {r.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">{r.body}</p>
            <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
              <span>
                {r.user.name ?? r.user.email}
                {r.user.banned && <span className="ml-2 text-red-400">· banned</span>}
                {r.flagCount > 0 && <span className="ml-2 text-red-400">· {r.flagCount} flag{r.flagCount === 1 ? "" : "s"}</span>}
              </span>
              <span>{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
            </div>
            <div className="mt-4">
              <ModerateButtons
                id={r.id}
                status={r.status}
                onApprove={moderateReview}
                onReject={moderateReview}
                onDelete={deleteReview}
              />
            </div>
          </li>
        ))}
        {reviews.length === 0 && (
          <li className="bg-bg p-8 text-center text-text-dim font-mono text-xs uppercase tracking-[0.22em]">
            Nothing in this queue.
          </li>
        )}
      </ul>
    </div>
  );
}

function Filter({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
        active ? "border-voltra bg-voltra/10 text-voltra" : "border-border text-text-muted hover:text-text"
      }`}
    >
      {label}
    </Link>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5`} className="text-voltra">
      {"★".repeat(rating)}<span className="text-text-dim">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
