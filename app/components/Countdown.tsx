"use client";

import { useEffect, useState } from "react";

function diff(target: number, now: number) {
  const ms = Math.max(0, target - now);
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hrs = Math.floor((sec % 86400) / 3600);
  const min = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return { days, hrs, min, s, isZero: ms === 0 };
}

export function Countdown({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso).getTime();
  const [now, setNow] = useState<number>(target); // SSR-friendly: render zeros on first paint

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { days, hrs, min, s, isZero } = diff(target, now);

  return (
    <div className="grid grid-cols-4 items-center gap-2">
      <Cell value={days} label="d" />
      <Cell value={hrs} label="h" />
      <Cell value={min} label="m" />
      <Cell value={s} label="s" pulse={!isZero} />
    </div>
  );
}

function Cell({ value, label, pulse }: { value: number; label: string; pulse?: boolean }) {
  return (
    <div className="border border-border bg-surface p-3 text-center">
      <div
        className={`font-display text-3xl leading-none tabular text-gradient-green ${
          pulse ? "transition-opacity" : ""
        }`}
      >
        {value.toString().padStart(2, "0")}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-text-dim">
        {label}
      </div>
    </div>
  );
}
