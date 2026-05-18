import type { Dictionary } from "@/lib/i18n/dictionaries";

const BIG_STATS = [
  { value: "160", unit: "mg", label: "Caffeine per can — same as a quad espresso." },
  { value: "0", unit: "g", label: "Sugar in every Ultra can. Zero. None. Nada." },
  { value: "100", unit: "%", label: "Volt — the same proprietary blend since '02." },
];

const INGREDIENTS = [
  ["Taurine", "1000mg"],
  ["L-Carnitine", "100mg"],
  ["Glucose", "Sourced Fresh"],
  ["Caffeine", "From Natural Bean"],
  ["B-Vitamins", "B2 · B3 · B6 · B12"],
  ["Inositol", "Trace"],
];

export function Stats({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="voltage"
      className="relative border-b border-border bg-surface py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-12">
          {/* Left — oversized numerals */}
          <div className="lg:col-span-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              {dict.stats.section}
            </span>
            <h2 className="mt-4 font-display text-5xl leading-[0.92] tracking-[-0.01em] sm:text-7xl">
              {dict.stats.title1} <br />
              <span className="text-gradient-green">{dict.stats.title2}</span>
            </h2>

            <ul className="mt-14 space-y-10">
              {BIG_STATS.map((s, i) => (
                <li
                  key={s.value}
                  className="group grid grid-cols-1 items-end gap-4 border-b border-border pb-8 sm:grid-cols-[auto_1fr_auto]"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
                    0{i + 1}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-gradient-green text-[clamp(5rem,12vw,11rem)] leading-[0.8] tabular">
                      {s.value}
                    </span>
                    <span className="font-mono text-xl uppercase tracking-[0.2em] text-voltra">
                      {s.unit}
                    </span>
                  </div>
                  <p className="max-w-sm text-sm leading-relaxed text-text-muted sm:text-right">
                    {s.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — ingredient panel */}
          <aside className="lg:col-span-5 lg:pl-10">
            <div className="sticky top-24 clip-tag border border-border bg-bg p-8">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                <span>Spec Sheet</span>
                <span className="text-voltra">REV. 016</span>
              </div>

              <h3 className="mt-6 font-display text-3xl leading-tight">
                What's in the <span className="text-voltra">brew?</span>
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                A proprietary energy blend, brewed in small loud batches and
                shipped out cold. Built to hit hard, clean up sober, and keep the
                lights on past the encore.
              </p>

              <dl className="mt-8 divide-y divide-border border-y border-border">
                {INGREDIENTS.map(([name, val]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between py-3 font-mono text-xs uppercase tracking-[0.18em]"
                  >
                    <dt className="text-text">{name}</dt>
                    <dd className="text-voltra">{val}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-text-dim">
                <span>Verified</span>
                <span className="flex items-center gap-2 text-voltra">
                  <span className="h-1.5 w-1.5 animate-glow rounded-full bg-voltra" />
                  Quality Sealed
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
