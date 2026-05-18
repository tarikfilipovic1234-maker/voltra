import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

export function AuthShell({
  children,
  locale,
  side,
}: {
  children: React.ReactNode;
  locale: Locale;
  side: { eyebrow: string; title: string; body: string };
}) {
  return (
    <div className="relative isolate min-h-screen bg-bg">
      {/* Halo claw background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-[18%] top-1/2 h-[140%] w-[80%] -translate-y-1/2 animate-drift">
          <div className="halo opacity-60" />
          <Image
            src="/logo.svg"
            alt=""
            fill
            sizes="80vw"
            className="object-contain object-right opacity-30 drop-shadow-[0_0_120px_rgba(0,255,65,0.4)]"
          />
        </div>
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 lg:grid-cols-12">
        {/* Left side */}
        <div className="hidden border-r border-border p-12 lg:col-span-6 lg:flex lg:flex-col lg:justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.svg"
                alt="VOLTRA"
                fill
                sizes="40px"
                className="object-contain drop-shadow-[0_0_10px_rgba(0,255,65,0.55)]"
              />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              VOLTRA<span className="text-voltra">/</span>Energy
            </span>
          </Link>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              {side.eyebrow}
            </span>
            <h1 className="mt-6 font-display text-[clamp(3rem,7vw,7rem)] leading-[0.85] tracking-[-0.02em] text-gradient-green">
              {side.title}
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-text-muted">
              {side.body}
            </p>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
            Drop 016 · {locale.toUpperCase()} · Welcome to the pack.
          </div>
        </div>

        {/* Right form */}
        <div className="col-span-1 flex items-center justify-center p-6 lg:col-span-6 lg:p-12">
          <div className="w-full max-w-md">
            <Link
              href={`/${locale}`}
              className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim transition-colors hover:text-voltra lg:hidden"
            >
              ← VOLTRA.GRID
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
