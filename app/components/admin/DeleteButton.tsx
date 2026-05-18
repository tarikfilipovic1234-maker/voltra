"use client";

import { useTransition } from "react";

export function DeleteButton({
  id,
  action,
  label = "Delete",
}: {
  id: string;
  action: (id: string) => Promise<void>;
  label?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => {
        if (!confirm("Delete this record? This cannot be undone.")) return;
        start(() => action(id));
      }}
      disabled={pending}
      className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
    >
      {pending ? "…" : label}
    </button>
  );
}
