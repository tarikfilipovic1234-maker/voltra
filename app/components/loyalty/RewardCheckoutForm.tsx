"use client";

import { useActionState } from "react";
import Link from "next/link";
import { checkoutReward, type RewardCheckoutState } from "@/app/actions/rewards";

export function RewardCheckoutForm({
  itemId,
  country,
}: {
  itemId: string;
  country: string;
}) {
  const [state, action, pending] = useActionState<RewardCheckoutState, FormData>(
    checkoutReward,
    undefined
  );

  if (state?.ok) {
    return (
      <div className="mt-6 clip-tag border border-voltra/40 bg-voltra/10 p-5">
        <div className="font-display text-3xl text-voltra">Order placed.</div>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
          −{state.pointsSpent?.toLocaleString()} pts · Tracking goes out within 5 business days.
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
          Order · {state.orderId}
        </p>
        <Link
          href="/profile"
          className="mt-5 inline-block clip-sharp bg-voltra px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid"
        >
          → Profile
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 grid gap-4">
      <input type="hidden" name="itemId" value={itemId} />
      <Field label="Full Name" name="shippingName" required />
      <Field label="Address" name="shippingLine1" required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" name="shippingCity" required />
        <Field label="ZIP" name="shippingZip" required />
      </div>
      <Field label="Country (ISO-2)" name="shippingCountry" required defaultValue={country} maxLength={2} />

      {state?.error && (
        <p className="clip-tag border border-red-500/40 bg-red-500/10 p-3 font-mono text-[10px] uppercase tracking-[0.18em] text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="clip-sharp mt-2 inline-flex w-full items-center justify-center gap-3 bg-voltra px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Processing…" : "Confirm Redemption →"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  defaultValue,
  maxLength,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
        {label}
      </span>
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        maxLength={maxLength}
        className="mt-2 block w-full border border-border bg-bg px-3 py-2.5 font-mono text-sm text-text focus:border-voltra focus:outline-none"
      />
    </label>
  );
}
