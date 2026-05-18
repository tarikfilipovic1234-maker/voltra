"use client";

import { useTransition } from "react";
import { setUserRole } from "@/app/actions/admin";

const ROLES = ["USER", "EDITOR", "ADMIN"] as const;

export function UserRoleSelect({ id, role }: { id: string; role: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={role}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as (typeof ROLES)[number];
        if (!ROLES.includes(next)) return;
        if (!confirm(`Set role to ${next}?`)) return;
        start(() => setUserRole(id, next));
      }}
      className="border border-border bg-bg px-2 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-text focus:border-voltra focus:outline-none disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r} className="bg-bg">
          {r}
        </option>
      ))}
    </select>
  );
}
