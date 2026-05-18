"use client";

import { useActionState, useState } from "react";
import { submitReview, type CommunityState } from "@/app/actions/community";

export function ReviewForm({
  targetType,
  targetId,
  redirectTo,
}: {
  targetType: "PRODUCT" | "ATHLETE" | "ARTICLE";
  targetId: string;
  redirectTo: string;
}) {
  const [state, action, pending] = useActionState<CommunityState, FormData>(
    submitReview,
    undefined
  );
  const [rating, setRating] = useState(5);

  if (state?.ok) {
    return (
      <div className="clip-tag border border-voltra/40 bg-voltra/10 p-5">
        <p className="font-display text-2xl text-voltra">Review submitted.</p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
          {state.pending
            ? "Held for moderator approval — looks like our auto-mod flagged something."
            : "Live now. Thanks for being loud."}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="clip-tag border border-border bg-surface p-6">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="rating" value={rating} />

      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Your rating</span>
      <div className="mt-2 flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`font-display text-3xl leading-none transition-colors ${
              n <= rating ? "text-voltra" : "text-text-dim hover:text-text"
            }`}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
        <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">{rating} / 5</span>
      </div>

      <label className="mt-5 block">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Headline</span>
        <input
          name="title"
          required
          maxLength={120}
          placeholder="Hit me clean"
          className="mt-2 block w-full border border-border bg-bg px-4 py-3 font-display text-xl text-text focus:border-voltra focus:outline-none"
        />
      </label>

      <label className="mt-4 block">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Review</span>
        <textarea
          name="body"
          required
          rows={4}
          maxLength={2000}
          placeholder="What did you think?"
          className="mt-2 block w-full border border-border bg-bg px-4 py-3 font-mono text-sm text-text focus:border-voltra focus:outline-none"
        />
      </label>

      {state?.error && (
        <p className="mt-3 clip-tag border border-red-500/40 bg-red-500/10 p-3 font-mono text-[10px] uppercase tracking-[0.18em] text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="clip-sharp mt-5 inline-flex items-center gap-3 bg-voltra px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Post Review →"}
      </button>
    </form>
  );
}
