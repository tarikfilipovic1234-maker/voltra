"use client";

import { useActionState } from "react";
import { updateProfileAction, type AuthFormState } from "@/app/actions/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Initial = {
  name: string;
  locale: string;
  region: string;
  country: string;
  newsletter: boolean;
};

type Props = {
  dict: Dictionary;
  initial: Initial;
  locales: { code: string; label: string }[];
  regions: { code: string; label: string }[];
};

export function ProfileForm({ dict, initial, locales, regions }: Props) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    updateProfileAction,
    undefined
  );

  return (
    <form action={action} className="mt-8 grid gap-6">
      <Field label={dict.auth.name} id="name" name="name" defaultValue={initial.name} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Select label={dict.profile.locale} id="locale" name="locale" defaultValue={initial.locale} options={locales} />
        <Select label={dict.profile.region} id="region" name="region" defaultValue={initial.region} options={regions} />
      </div>

      <Field label="Country (ISO-2)" id="country" name="country" defaultValue={initial.country} maxLength={2} />

      <label className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        <input
          type="checkbox"
          name="newsletter"
          defaultChecked={initial.newsletter}
          className="h-4 w-4 accent-voltra"
        />
        <span>{dict.profile.newsletter}</span>
      </label>

      {state?.ok && (
        <p className="border border-voltra/40 bg-voltra/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-voltra">
          ✓ {dict.profile.saved}
        </p>
      )}
      {state?.error && (
        <p className="border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "…" : dict.profile.save}
        </button>
      </div>
    </form>
  );
}

function Field({ label, id, name, defaultValue, maxLength }: { label: string; id: string; name: string; defaultValue?: string; maxLength?: number }) {
  return (
    <label htmlFor={id} className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">{label}</span>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        maxLength={maxLength}
        className="mt-2 block w-full clip-tag border border-border bg-bg px-4 py-3 font-mono text-sm text-text focus:border-voltra focus:outline-none"
      />
    </label>
  );
}

function Select({ label, id, name, defaultValue, options }: { label: string; id: string; name: string; defaultValue?: string; options: { code: string; label: string }[] }) {
  return (
    <label htmlFor={id} className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">{label}</span>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 block w-full clip-tag border border-border bg-bg px-4 py-3 font-mono text-sm uppercase tracking-[0.12em] text-text focus:border-voltra focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.code} value={o.code} className="bg-bg">
            {o.label} ({o.code.toUpperCase()})
          </option>
        ))}
      </select>
    </label>
  );
}
