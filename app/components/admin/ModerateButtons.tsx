"use client";

import { useTransition } from "react";

type ModStatus = "APPROVED" | "REJECTED" | "PENDING";

export function ModerateButtons({
  id,
  status,
  onApprove,
  onReject,
  onDelete,
}: {
  id: string;
  status: string;
  onApprove: (id: string, status: ModStatus) => Promise<void>;
  onReject: (id: string, status: ModStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending || status === "APPROVED"}
        onClick={() => start(() => onApprove(id, "APPROVED"))}
        className="clip-tag border border-voltra/40 bg-voltra/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-voltra hover:bg-voltra/20 disabled:opacity-50"
      >
        ✓ Approve
      </button>
      <button
        type="button"
        disabled={pending || status === "REJECTED"}
        onClick={() => start(() => onReject(id, "REJECTED"))}
        className="clip-tag border border-red-500/40 bg-red-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-red-300 hover:bg-red-500/20 disabled:opacity-50"
      >
        ✕ Reject
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this content permanently?")) return;
          start(() => onDelete(id));
        }}
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-red-400 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
