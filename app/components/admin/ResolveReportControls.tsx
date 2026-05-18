"use client";

import { useState, useTransition } from "react";
import { resolveReport, banUser } from "@/app/actions/admin-community";

export function ResolveReportControls({
  id,
  authorUserId,
}: {
  id: string;
  authorUserId: string | null;
}) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");

  return (
    <div className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Outcome note (optional)…"
        className="block w-full border border-border bg-bg px-3 py-2 font-mono text-xs text-text focus:border-voltra focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => resolveReport(id, "RESOLVED", note || "Resolved"))}
          className="clip-tag border border-voltra/40 bg-voltra/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-voltra hover:bg-voltra/20 disabled:opacity-50"
        >
          ✓ Resolve
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => resolveReport(id, "DISMISSED", note || "Dismissed"))}
          className="clip-tag border border-border bg-bg px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:border-voltra hover:text-voltra disabled:opacity-50"
        >
          ✕ Dismiss
        </button>
        {authorUserId && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Ban the author of the reported content?")) return;
              const reason = prompt("Ban reason (shown internally):", note || "Reported content");
              if (reason === null) return;
              start(async () => {
                await banUser(authorUserId, reason);
                await resolveReport(id, "RESOLVED", `Banned author · ${reason}`);
              });
            }}
            className="clip-tag border border-red-500/40 bg-red-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            ⛔ Resolve + Ban User
          </button>
        )}
      </div>
    </div>
  );
}
