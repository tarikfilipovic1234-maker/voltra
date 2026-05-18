import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Hero({ dict }: { dict: Dictionary }) {
  const STATS = [
    { label: dict.hero.caffeine, value: "160", unit: "MG" },
    { label: dict.hero.sugar, value: "0", unit: "G" },
    { label: dict.hero.calories, value: "10", unit: "KCAL" },
    { label: dict.hero.bvits, value: "06", unit: "PACK" },
  ];

  return (
    <section id="top" className="relative isolate overflow-hidden">
      {/* Top instrument strip */}
      <div className="border-b border-border/60 bg-bg">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim lg:px-10">
          <span>Lat 34.05°N · Lon 118.24°W</span>
          <span className="hidden md:inline">Batch <span className="text-voltra">M-160</span> · Filed under: Fuel</span>
          <span>Vol. 02 / Drop 016</span>
        </div>
      </div>

      <div className="relative mx-auto min-h-[92vh] max-w-[1440px] px-6 pt-10 pb-20 lg:px-10 lg:pt-16">
        {/* Background claw + glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-[14%] top-1/2 h-[140%] w-[90%] -translate-y-1/2 animate-drift">
            <div className="absolute inset-0 animate-glow">
              <div className="halo" />
            </div>
            <Image
              src="/logo.svg"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 80vw, 110vw"
              className="object-contain object-right opacity-90 drop-shadow-[0_0_120px_rgba(0,255,65,0.55)]"
            />
          </div>
          {/* subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
              maskImage:
                "radial-gradient(ellipse at center, rgba(0,0,0,1), transparent 70%)",
            }}
          />
          {/* corner crosshairs */}
          <Crosshair className="top-6 left-6" />
          <Crosshair className="top-6 right-6" />
          <Crosshair className="bottom-6 left-6" />
          <Crosshair className="bottom-6 right-6" />
        </div>

        {/* Left rail */}
        <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 -rotate-90 font-mono text-[10px] uppercase tracking-[0.4em] text-text-dim lg:block">
          <span className="text-voltra">●</span>&nbsp;&nbsp;The Original Energy · Est. 2002
        </div>

        {/* Content */}
        <div className="relative grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div
              className="fade-up mb-8 inline-flex items-center gap-3 border border-border bg-surface/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted backdrop-blur"
              style={{ animationDelay: "0.05s" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-voltra opacity-75" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-voltra" />
              </span>
              <span>{dict.hero.badge}</span>
            </div>

            <h1 className="font-display text-[clamp(4.25rem,14vw,17rem)] leading-[0.82] tracking-[-0.02em]">
              <span className="block overflow-hidden">
                <span className="reveal text-gradient-acid" style={{ animationDelay: "0.1s" }}>
                  {dict.hero.headline1}
                </span>
              </span>
              <span className="block overflow-hidden">
                <span
                  className="reveal text-stroke"
                  style={{ animationDelay: "0.25s" }}
                >
                  {dict.hero.headline2}
                </span>
                <span
                  className="reveal text-gradient-green ml-[0.35em]"
                  style={{ animationDelay: "0.4s" }}
                >
                  {dict.hero.headline3}
                </span>
                <span
                  className="reveal text-voltra ml-2 align-top text-[0.45em]"
                  style={{ animationDelay: "0.55s" }}
                >
                  ®
                </span>
              </span>
            </h1>

            <div className="mt-10 grid max-w-2xl gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
              <p
                className="fade-up text-base leading-relaxed text-text-muted sm:text-lg"
                style={{ animationDelay: "0.7s" }}
              >
                {dict.hero.description}
              </p>
              <div
                className="fade-up flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim"
                style={{ animationDelay: "0.8s" }}
              >
                <span className="h-px w-10 bg-voltra" />
                {dict.hero.since}
              </div>
            </div>

            <div
              className="fade-up mt-12 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "0.9s" }}
            >
              <a
                href="#products"
                className="group clip-sharp relative inline-flex items-center gap-3 bg-voltra px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-black transition-all hover:-translate-y-[2px] hover:bg-voltra-acid"
              >
                <span>{dict.hero.cta1}</span>
                <span aria-hidden className="text-base">→</span>
                <span className="absolute inset-0 -z-10 bg-voltra blur-xl opacity-50 group-hover:opacity-90 transition-opacity" />
              </a>
              <a
                href="#voltage"
                className="clip-sharp group inline-flex items-center gap-3 border border-border bg-surface/50 px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-text backdrop-blur transition-colors hover:border-voltra hover:text-voltra"
              >
                <span className="flex h-3 w-3 items-center justify-center">
                  <span className="block h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-current" />
                </span>
                <span>{dict.hero.cta2}</span>
              </a>
            </div>
          </div>

          {/* Right side stats card */}
          <div className="lg:col-span-4">
            <div
              className="fade-up clip-tag relative border border-border bg-surface/70 p-6 backdrop-blur"
              style={{ animationDelay: "1.05s" }}
            >
              <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                <span>{dict.hero.nutrition}</span>
                <span className="text-voltra">M-001</span>
              </div>
              <ul className="grid grid-cols-2 gap-y-5">
                {STATS.map((s) => (
                  <li key={s.label}>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-gradient-green text-5xl leading-none tabular">
                        {s.value}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-voltra">
                        {s.unit}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                      {s.label}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                <span>{dict.hero.status}</span>
                <span className="flex items-center gap-2 text-voltra">
                  <span className="h-1.5 w-1.5 animate-glow rounded-full bg-voltra" />
                  {dict.hero.statusReady}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim md:flex">
          <span>Scroll</span>
          <span className="block h-10 w-px overflow-hidden bg-border">
            <span className="block h-full w-px animate-scan bg-voltra" />
          </span>
        </div>
      </div>
    </section>
  );
}

function Crosshair({ className = "" }: { className?: string }) {
  return (
    <span
      className={`absolute h-3 w-3 ${className}`}
      aria-hidden
    >
      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-voltra/60" />
      <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-voltra/60" />
    </span>
  );
}
