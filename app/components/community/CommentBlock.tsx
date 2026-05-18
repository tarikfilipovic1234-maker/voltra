import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CommentForm } from "./CommentForm";
import { ReportButton } from "./ReportButton";

type Props = {
  targetType: "ARTICLE" | "VIDEO" | "EVENT";
  targetId: string;
  redirectTo: string;
  locale: string;
};

export async function CommentBlock({ targetType, targetId, redirectTo, locale }: Props) {
  const [comments, session, totalCount] = await Promise.all([
    prisma.comment.findMany({
      where: { targetType, targetId, status: "APPROVED", parentId: null },
      include: {
        user: { select: { name: true, image: true, tier: true, role: true } },
        replies: {
          where: { status: "APPROVED" },
          include: { user: { select: { name: true, tier: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    auth(),
    prisma.comment.count({
      where: { targetType, targetId, status: "APPROVED" },
    }),
  ]);

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
            § Community · Discussion
          </span>
          <h2 className="mt-3 font-display text-4xl">
            <span className="text-gradient-green">{totalCount}</span>{" "}
            <span className="text-text-muted">{totalCount === 1 ? "comment" : "comments"}</span>
          </h2>
        </div>
      </div>

      <div className="mt-8">
        {session ? (
          <CommentForm targetType={targetType} targetId={targetId} redirectTo={redirectTo} />
        ) : (
          <Link
            href={`/${locale}/login`}
            className="inline-block clip-tag border border-border bg-surface px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted hover:border-voltra hover:text-voltra"
          >
            Sign in to comment →
          </Link>
        )}
      </div>

      <ul className="mt-10 space-y-5">
        {comments.map((c) => (
          <li key={c.id} className="border-l-2 border-voltra/40 bg-surface px-6 py-5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
              <span className="flex items-center gap-3">
                <span className="text-text">{c.user.name ?? "Anonymous"}</span>
                {c.user.role === "ADMIN" && <span className="bg-voltra/20 px-1.5 py-0.5 text-voltra">staff</span>}
                <span className="text-voltra">{c.user.tier}</span>
                <span className="text-text-dim">{c.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
              </span>
              <ReportButton contentType="COMMENT" contentId={c.id} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text">{c.body}</p>

            {/* Replies */}
            {c.replies.length > 0 && (
              <ul className="mt-4 space-y-3 border-l border-border pl-5">
                {c.replies.map((r) => (
                  <li key={r.id}>
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                      <span className="flex items-center gap-3">
                        <span className="text-text">↳ {r.user.name ?? "Anonymous"}</span>
                        {r.user.role === "ADMIN" && (
                          <span className="bg-voltra/20 px-1.5 py-0.5 text-voltra">staff</span>
                        )}
                        <span className="text-text-dim">
                          {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                        </span>
                      </span>
                      <ReportButton contentType="COMMENT" contentId={r.id} />
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-muted">
                      {r.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {session && (
              <details className="mt-4">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:text-voltra">
                  ↩ Reply
                </summary>
                <div className="mt-3">
                  <CommentForm
                    targetType={targetType}
                    targetId={targetId}
                    parentId={c.id}
                    redirectTo={redirectTo}
                    compact
                  />
                </div>
              </details>
            )}
          </li>
        ))}
        {comments.length === 0 && (
          <li className="py-8 text-center font-mono text-xs uppercase tracking-[0.22em] text-text-dim">
            No comments yet. Be the first to break the silence.
          </li>
        )}
      </ul>
    </section>
  );
}
