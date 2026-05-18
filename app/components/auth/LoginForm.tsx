"use client";

import { useActionState } from "react";
import { signInAction, type AuthFormState } from "@/app/actions/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function LoginForm({ dict }: { dict: Dictionary }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signInAction,
    undefined
  );

  return (
    <form action={action} className="mt-12 space-y-5">
      <Field
        id="email"
        name="email"
        type="email"
        label={dict.auth.email}
        required
      />
      <Field
        id="password"
        name="password"
        type="password"
        label={dict.auth.password}
        required
      />

      {state?.error && (
        <p className="border border-red-500/40 bg-red-500/10 p-3 font-mono text-xs uppercase tracking-[0.18em] text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="clip-sharp inline-flex w-full items-center justify-center gap-3 bg-voltra px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-black transition-all hover:-translate-y-[2px] hover:bg-voltra-acid disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "…" : dict.auth.signIn} <span aria-hidden>→</span>
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
        {label}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        className="mt-2 block w-full clip-tag border border-border bg-surface px-4 py-3 font-mono text-sm text-text placeholder:text-text-dim focus:border-voltra focus:outline-none"
      />
    </label>
  );
}
