"use client";

import { useActionState } from "react";
import { submitComment, type CommunityState } from "@/app/actions/community";

export function CommentForm({
  targetType,
  targetId,
  parentId,
  redirectTo,
  compact = false,
}: {
  targetType: "ARTICLE" | "VIDEO" | "EVENT";
  targetId: string;
  parentId?: string;
  redirectTo: string;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState<CommunityState, FormData>(
    submitComment,
    undefined
  );

  if (state?.ok) {
    return (
      <div className="clip-tag border border-voltra/40 bg-voltra/10 p-4 font-mono text-[11px] uppercase tracking-[0.18em] text-voltra">
        ✓ {state.pending ? "Held for moderator approval." : "Posted."}
      </div>
    );
  }

  return (
    <form action={action} className={compact ? "" : "clip-tag border border-border bg-surface p-5"}>
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
          {parentId ? "Your reply" : "Your comment"}
        </span>
        <textarea
          name="body"
          required
          rows={compact ? 3 : 4}
          maxLength={2000}
          placeholder="Loud and clear…"
          className="mt-2 block w-full border border-border bg-bg px-4 py-3 font-mono text-sm leading-relaxed text-text focus:border-voltra focus:outline-none"
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
        className="clip-sharp mt-4 inline-flex items-center gap-3 bg-voltra px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid disabled:opacity-60"
      >
        {pending ? "Posting…" : parentId ? "Reply →" : "Post Comment →"}
      </button>
    </form>
  );
}
