import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { ModerateButtons } from "@/app/components/admin/ModerateButtons";
import { moderateComment, deleteComment } from "@/app/actions/admin-community";

export default async function CommentsModPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.status ?? "ALL";
  const where = filter === "ALL" ? {} : { status: filter };

  const comments = await prisma.comment.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true, banned: true } } },
    orderBy: [{ flagCount: "desc" }, { createdAt: "desc" }],
    take: 200,
  });
  const counts = await prisma.comment.groupBy({ by: ["status"], _count: { _all: true } });

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 13 / Comments</span>
        <h1 className="mt-3 font-display text-5xl">Forum Moderation</h1>
        <p className="mt-2 text-sm text-text-muted">{comments.length} shown.</p>
      </header>

      <div className="flex gap-2">
        <Filter href="/admin/comments" label="All" active={filter === "ALL"} />
        {counts.map((c) => (
          <Filter
            key={c.status}
            href={`/admin/comments?status=${c.status}`}
            label={`${c.status} · ${c._count._all}`}
            active={filter === c.status}
          />
        ))}
      </div>

      <ul className="grid gap-px bg-border">
        {comments.map((c) => (
          <li key={c.id} className={`bg-bg p-6 ${c.flagCount > 0 ? "border-l-2 border-l-red-500" : ""}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
                <span className="text-voltra">{c.targetType}</span>
                <span className="text-text-dim">{c.targetId.slice(-6)}</span>
                <span className="text-text-muted">{c.user.name ?? c.user.email}</span>
                {c.user.banned && <span className="text-red-400">· banned</span>}
                {c.parentId && <span className="text-text-dim">· reply</span>}
              </div>
              <span className={c.status === "APPROVED" ? "text-voltra font-mono text-[10px] uppercase tracking-[0.22em]" : c.status === "PENDING" ? "text-voltra-acid font-mono text-[10px] uppercase tracking-[0.22em]" : "text-red-400 font-mono text-[10px] uppercase tracking-[0.22em]"}>
                {c.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text">{c.body}</p>
            <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
              <span>
                {c.flagCount > 0 && <span className="text-red-400">{c.flagCount} flag{c.flagCount === 1 ? "" : "s"} · </span>}
                {c.createdAt.toISOString().slice(0, 16).replace("T", " ")}
              </span>
            </div>
            <div className="mt-4">
              <ModerateButtons
                id={c.id}
                status={c.status}
                onApprove={moderateComment}
                onReject={moderateComment}
                onDelete={deleteComment}
              />
            </div>
          </li>
        ))}
        {comments.length === 0 && (
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
