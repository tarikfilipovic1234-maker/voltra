"use client";

import { useActionState, useRef, useEffect } from "react";
import { redeemPromoCode, type RedeemState } from "@/app/actions/loyalty";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function RedeemForm({
  initialPoints,
  tier,
  dict,
}: {
  initialPoints: number;
  tier: string;
  dict: Dictionary;
}) {
  const [state, action, pending] = useActionState<RedeemState, FormData>(
    redeemPromoCode,
    undefined
  );
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (state?.ok && ref.current) ref.current.value = "";
  }, [state?.ok]);

  return (
    <form action={action} className="space-y-6">
      <label htmlFor="code" className="block">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Promo Code</span>
        <div className="clip-tag mt-3 flex items-center gap-3 border border-border bg-surface px-5 py-5 transition-colors focus-within:border-voltra">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">CODE</span>
          <input
            ref={ref}
            id="code"
            name="code"
            required
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="VOLT-2026"
            className="w-full bg-transparent font-display text-3xl uppercase tracking-[0.08em] text-text placeholder:text-text-dim focus:outline-none"
          />
        </div>
      </label>

      {state?.ok && (
        <div className="clip-tag border border-voltra/40 bg-voltra/10 p-5">
          <div className="font-display text-2xl text-voltra">
            +{state.pointsAwarded} <span className="text-text">points</span>
          </div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
            New balance · <span className="text-voltra">{state.newBalance?.toLocaleString()} pts</span>
            {state.campaign && <> · Campaign · <span className="text-text">{state.campaign}</span></>}
          </div>
        </div>
      )}
      {state?.error && (
        <div className="clip-tag border border-red-500/40 bg-red-500/10 p-4 font-mono text-xs uppercase tracking-[0.18em] text-red-300">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Validating…" : "Redeem →"}
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
          Starting balance · <span className="text-text">{initialPoints.toLocaleString()}</span> · Tier {tier}
        </span>
      </div>

      <details className="border-t border-border pt-4">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:text-voltra">
          Try a sample code →
        </summary>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
          Demo seed codes: <span className="text-voltra">VOLT-2026</span> · <span className="text-voltra">RUN-IT</span> · <span className="text-voltra">ANAHEIM-A1</span>
        </p>
      </details>
    </form>
  );
}
