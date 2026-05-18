import Link from "next/link";
import type { ReactNode } from "react";

export function FormShell({
  title,
  eyebrow,
  backHref,
  children,
}: {
  title: string;
  eyebrow: string;
  backHref: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl space-y-10">
      <header>
        <Link
          href={backHref}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim transition-colors hover:text-voltra"
        >
          ← Back
        </Link>
        <span className="mt-6 block font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
          {eyebrow}
        </span>
        <h1 className="mt-3 font-display text-5xl">{title}</h1>
      </header>
      {children}
    </div>
  );
}
