"use client";

import { useActionState } from "react";
import { signUpAction, type AuthFormState } from "@/app/actions/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SignupForm({ dict }: { dict: Dictionary }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signUpAction,
    undefined
  );

  return (
    <form action={action} className="mt-12 space-y-5">
      <Field id="name" name="name" type="text" label={dict.auth.name} required errors={state?.fieldErrors?.name} />
      <Field id="email" name="email" type="email" label={dict.auth.email} required errors={state?.fieldErrors?.email} />
      <Field id="password" name="password" type="password" label={dict.auth.password} required errors={state?.fieldErrors?.password} />

      <label className="flex items-start gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        <input
          type="checkbox"
          name="newsletter"
          defaultChecked
          className="mt-0.5 h-4 w-4 accent-voltra"
        />
        <span>
          Sign me up for the newsletter — drops, athlete news, occasional 3 AM
          lab notes.
        </span>
      </label>

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
        {pending ? "…" : dict.auth.signUp} <span aria-hidden>→</span>
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
  errors,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  required?: boolean;
  errors?: string[];
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
        className={`mt-2 block w-full clip-tag border bg-surface px-4 py-3 font-mono text-sm text-text placeholder:text-text-dim focus:outline-none ${
          errors ? "border-red-500/50 focus:border-red-400" : "border-border focus:border-voltra"
        }`}
      />
      {errors?.map((err) => (
        <span key={err} className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-red-300">
          {err}
        </span>
      ))}
    </label>
  );
}
