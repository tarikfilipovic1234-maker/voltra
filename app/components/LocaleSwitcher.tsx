import Link from "next/link";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

export function LocaleSwitcher({ current }: { current: Locale }) {
  return (
    <details className="group relative hidden md:block">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 border border-border bg-surface/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted backdrop-blur transition-colors hover:border-voltra hover:text-voltra [&::-webkit-details-marker]:hidden">
        <span aria-hidden>◌</span>
        {current.toUpperCase()}
        <span className="text-text-dim transition-transform group-open:rotate-180">▾</span>
      </summary>
      <ul className="absolute right-0 top-full mt-2 min-w-[180px] border border-border bg-surface py-1 shadow-2xl shadow-black/60">
        {LOCALES.map((code) => (
          <li key={code}>
            <Link
              href={`/${code}`}
              className={`flex items-center justify-between px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-bg hover:text-voltra ${
                code === current ? "text-voltra" : "text-text-muted"
              }`}
            >
              <span>{LOCALE_LABELS[code].native}</span>
              <span className="text-text-dim">{code.toUpperCase()}</span>
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
