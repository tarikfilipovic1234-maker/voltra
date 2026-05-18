"use client";

import { useState, useTransition } from "react";
import { submitReport } from "@/app/actions/community";
import { REPORT_REASON_LABELS } from "@/lib/moderation";

export function ReportButton({
  contentType,
  contentId,
}: {
  contentType: "REVIEW" | "COMMENT";
  contentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">
        ✓ Reported — thanks
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-red-400"
      >
        ⚐ Report
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("contentType", contentType);
        fd.set("contentId", contentId);
        start(async () => {
          const res = await submitReport(undefined, fd);
          if (res?.ok) setDone(true);
          else setError(res?.error ?? "Could not submit report.");
        });
      }}
      className="clip-tag mt-2 border border-red-500/40 bg-red-500/10 p-3"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-300">
        Why are you reporting this?
      </span>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {(Object.keys(REPORT_REASON_LABELS) as (keyof typeof REPORT_REASON_LABELS)[]).map((k) => (
          <label key={k} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
            <input type="radio" name="reason" value={k} required className="accent-voltra" />
            {REPORT_REASON_LABELS[k]}
          </label>
        ))}
      </div>
      <textarea
        name="detail"
        rows={2}
        placeholder="Optional detail…"
        className="mt-2 block w-full border border-border bg-bg px-3 py-2 font-mono text-xs text-text focus:border-voltra focus:outline-none"
      />
      {error && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-red-300">{error}</p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="clip-sharp bg-red-500 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black hover:bg-red-400 disabled:opacity-60"
        >
          {pending ? "…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
