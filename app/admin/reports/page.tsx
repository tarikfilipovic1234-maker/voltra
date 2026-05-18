import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { REPORT_REASON_LABELS } from "@/lib/moderation";
import { ResolveReportControls } from "@/app/components/admin/ResolveReportControls";

export default async function ReportsModPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status ?? "OPEN";
  const where = filter === "ALL" ? {} : { status: filter };

  const reports = await prisma.report.findMany({
    where,
    include: { submittedBy: { select: { id: true, name: true, email: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  // Resolve referenced content
  const reviewIds = reports.filter((r) => r.contentType === "REVIEW").map((r) => r.contentId);
  const commentIds = reports.filter((r) => r.contentType === "COMMENT").map((r) => r.contentId);
  const [reviews, comments] = await Promise.all([
    reviewIds.length > 0
      ? prisma.review.findMany({
          where: { id: { in: reviewIds } },
          include: { user: { select: { name: true, email: true, banned: true, id: true } } },
        })
      : Promise.resolve([]),
    commentIds.length > 0
      ? prisma.comment.findMany({
          where: { id: { in: commentIds } },
          include: { user: { select: { name: true, email: true, banned: true, id: true } } },
        })
      : Promise.resolve([]),
  ]);
  const reviewById = new Map(reviews.map((r) => [r.id, r]));
  const commentById = new Map(comments.map((c) => [c.id, c]));

  const counts = await prisma.report.groupBy({ by: ["status"], _count: { _all: true } });

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 14 / Reports</span>
        <h1 className="mt-3 font-display text-5xl">Moderation Queue</h1>
        <p className="mt-2 text-sm text-text-muted">User-flagged content awaiting decision.</p>
      </header>

      <div className="flex gap-2">
        {["OPEN", "RESOLVED", "DISMISSED", "ALL"].map((s) => {
          const count = counts.find((c) => c.status === s)?._count._all ?? 0;
          return (
            <Link
              key={s}
              href={s === "ALL" ? "/admin/reports?status=ALL" : `/admin/reports?status=${s}`}
              className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
                filter === s ? "border-voltra bg-voltra/10 text-voltra" : "border-border text-text-muted hover:text-text"
              }`}
            >
              {s}{s !== "ALL" ? ` · ${count}` : ""}
            </Link>
          );
        })}
      </div>

      <ul className="grid gap-px bg-border">
        {reports.map((r) => {
          const item = r.contentType === "REVIEW" ? reviewById.get(r.contentId) : commentById.get(r.contentId);
          return (
            <li key={r.id} className="bg-bg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
                  <span className="text-voltra">{r.contentType}</span>
                  <span className="text-red-300">{REPORT_REASON_LABELS[r.reason as keyof typeof REPORT_REASON_LABELS] ?? r.reason}</span>
                  <span className="text-text-dim">{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
                </div>
                <span className={r.status === "OPEN" ? "text-voltra-acid font-mono text-[10px] uppercase tracking-[0.22em]" : "text-text-dim font-mono text-[10px] uppercase tracking-[0.22em]"}>
                  {r.status}
                </span>
              </div>
              {r.detail && (
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
                  Reporter note: <span className="text-text normal-case tracking-normal">{r.detail}</span>
                </p>
              )}
              <div className="mt-4 border-l-2 border-voltra/40 bg-surface p-4">
                {item ? (
                  <>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                      by {item.user.name ?? item.user.email}
                      {item.user.banned && <span className="ml-2 text-red-400">· banned</span>}
                    </div>
                    {"title" in item && (
                      <div className="mt-2 font-display text-lg">{item.title}</div>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-text">{item.body}</p>
                  </>
                ) : (
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-dim">
                    Original content removed.
                  </p>
                )}
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                Reported by {r.submittedBy.name ?? r.submittedBy.email}
              </p>
              {r.status === "OPEN" && (
                <div className="mt-4">
                  <ResolveReportControls id={r.id} authorUserId={item?.user.id ?? null} />
                </div>
              )}
              {r.resolution && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  Outcome: <span className="text-text normal-case tracking-normal">{r.resolution}</span>
                </p>
              )}
            </li>
          );
        })}
        {reports.length === 0 && (
          <li className="bg-bg p-8 text-center text-text-dim font-mono text-xs uppercase tracking-[0.22em]">
            Queue clear — nothing to review.
          </li>
        )}
      </ul>
    </div>
  );
}
