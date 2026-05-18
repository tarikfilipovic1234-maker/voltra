import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "./ReviewForm";
import { ReportButton } from "./ReportButton";

type Props = {
  targetType: "PRODUCT" | "ATHLETE" | "ARTICLE";
  targetId: string;
  /** path to revalidate after submission */
  redirectTo: string;
  locale: string;
};

const STAR = "★";
const DIM_STAR = "★";

export async function ReviewBlock({ targetType, targetId, redirectTo, locale }: Props) {
  const [reviews, session, agg] = await Promise.all([
    prisma.review.findMany({
      where: { targetType, targetId, status: "APPROVED" },
      include: { user: { select: { name: true, image: true, tier: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    auth(),
    prisma.review.aggregate({
      where: { targetType, targetId, status: "APPROVED" },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);
  const avg = agg._avg.rating ?? 0;
  const count = agg._count._all;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ Community · Reviews</span>
          <h2 className="mt-3 font-display text-4xl">
            <span className="text-gradient-green">{count}</span>{" "}
            <span className="text-text-muted">{count === 1 ? "review" : "reviews"}</span>
          </h2>
        </div>
        {count > 0 && (
          <div className="text-right">
            <div className="font-display text-5xl text-text tabular">{avg.toFixed(1)}</div>
            <div className="text-voltra">
              {STAR.repeat(Math.round(avg))}
              <span className="text-text-dim">{DIM_STAR.repeat(5 - Math.round(avg))}</span>
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">avg rating</div>
          </div>
        )}
      </div>

      {/* Submission form */}
      <div className="mt-8">
        {session ? (
          <ReviewForm
            targetType={targetType}
            targetId={targetId}
            redirectTo={redirectTo}
          />
        ) : (
          <Link
            href={`/${locale}/login`}
            className="inline-block clip-tag border border-border bg-surface px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted hover:border-voltra hover:text-voltra"
          >
            Sign in to leave a review →
          </Link>
        )}
      </div>

      {/* List */}
      <ul className="mt-12 space-y-6">
        {reviews.map((r) => (
          <li key={r.id} className="border-l-2 border-voltra/40 bg-surface px-6 py-5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
              <span className="flex items-center gap-3">
                <span className="text-text">{r.user.name ?? "Anonymous Volt"}</span>
                <span className="text-voltra">{r.user.tier}</span>
                <span className="text-text-dim">{r.createdAt.toISOString().slice(0, 10)}</span>
              </span>
              <span className="text-voltra">{STAR.repeat(r.rating)}<span className="text-text-dim">{DIM_STAR.repeat(5 - r.rating)}</span></span>
            </div>
            <h3 className="mt-3 font-display text-2xl">{r.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{r.body}</p>
            <div className="mt-3">
              <ReportButton contentType="REVIEW" contentId={r.id} />
            </div>
          </li>
        ))}
        {reviews.length === 0 && (
          <li className="py-8 text-center font-mono text-xs uppercase tracking-[0.22em] text-text-dim">
            No reviews yet. Be loud.
          </li>
        )}
      </ul>
    </section>
  );
}
