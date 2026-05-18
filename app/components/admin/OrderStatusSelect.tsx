"use client";

import { useTransition } from "react";
import { setOrderStatus } from "@/app/actions/admin-loyalty";

const STATUSES = ["PENDING", "PAID", "FULFILLED", "EXPIRED", "CANCELLED"] as const;

export function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as (typeof STATUSES)[number];
        if (!STATUSES.includes(next)) return;
        if (next === "PENDING") return; // not a manual transition
        if (!confirm(`Mark order as ${next}?`)) return;
        start(() => setOrderStatus(id, next as "PAID" | "FULFILLED" | "CANCELLED" | "EXPIRED"));
      }}
      className="border border-border bg-bg px-2 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-text focus:border-voltra focus:outline-none disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-bg" disabled={s === "PENDING" && status !== "PENDING"}>
          {s}
        </option>
      ))}
    </select>
  );
}
