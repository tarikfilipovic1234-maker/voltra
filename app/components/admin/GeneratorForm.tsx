"use client";

import { useState, useTransition } from "react";

type ActionResult = {
  ok?: boolean;
  generated?: number;
  codes?: string[];
  duplicatesSkipped?: number;
};

export function GeneratorForm({
  action,
}: {
  action: (fd: FormData) => Promise<ActionResult>;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await action(fd);
          setResult(r);
        });
      }}
      className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-4"
    >
      <Mini label="Prefix" name="prefix" defaultValue="DROP16" hint="A–Z 0–9, ≤8 chars" />
      <Mini label="Code length" name="codeLength" type="number" defaultValue="10" />
      <Mini label="Count" name="count" type="number" defaultValue="100" hint="Max 10,000" />
      <Mini label="Points each" name="points" type="number" defaultValue="50" />
      <Mini label="Max redemptions" name="maxRedemptions" type="number" defaultValue="1" />
      <Mini label="Source" name="source" defaultValue="CAN" />
      <Mini label="Campaign" name="campaign" defaultValue="Drop 016 cans" />
      <Mini label="Expires at" name="expiresAt" type="datetime-local" />

      <div className="md:col-span-3 lg:col-span-4 flex items-center gap-4 border-t border-border pt-4">
        <button
          type="submit"
          disabled={pending}
          className="clip-sharp bg-voltra px-7 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Minting…" : "Mint Batch →"}
        </button>
        {result?.ok && (
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-voltra">
            ✓ Generated {result.generated} codes
            {result.duplicatesSkipped ? ` · ${result.duplicatesSkipped} collisions retried` : ""}
          </div>
        )}
      </div>

      {result?.codes && result.codes.length > 0 && (
        <details className="md:col-span-3 lg:col-span-4 border-t border-border pt-4">
          <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:text-voltra">
            Show {result.codes.length} generated codes
          </summary>
          <textarea
            readOnly
            value={result.codes.join("\n")}
            className="mt-3 h-48 w-full border border-border bg-bg p-3 font-mono text-xs text-text"
          />
        </details>
      )}
    </form>
  );
}

function Mini({
  label,
  name,
  type = "text",
  defaultValue,
  hint,
}: { label: string; name: string; type?: string; defaultValue?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-1 block w-full border border-border bg-bg px-2 py-2 font-mono text-xs text-text focus:border-voltra focus:outline-none"
      />
      {hint && <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">{hint}</span>}
    </label>
  );
}
