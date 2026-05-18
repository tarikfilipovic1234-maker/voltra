import type { Dictionary } from "@/lib/i18n/dictionaries";

type SportGroup = {
  sport: string;
  _count: { _all: number };
};

const TAGLINES: Record<string, { tagline: string; feature: string }> = {
  Motocross: { tagline: "Dirt, throttle, repeat.", feature: "Supercross · MXGP · Nitro Circus" },
  "Formula 1": { tagline: "Apex hunters.", feature: "Lewis · Lando · Track-side garage takeover" },
  Esports: { tagline: "Lan loud, GG louder.", feature: "CS · League · Apex · Valorant" },
  UFC: { tagline: "Octagon-cleared.", feature: "PPVs · Walkouts · Fight Night" },
  MotoGP: { tagline: "Tarmac saints.", feature: "MotoGP · Moto2 · Moto3" },
  MXGP: { tagline: "Mud apex.", feature: "MXGP · MX1 · MX2" },
  BMX: { tagline: "Park kings.", feature: "Park · Vert · Dirt" },
  Skate: { tagline: "Concrete prayers.", feature: "Vert · Street · Park" },
  Music: { tagline: "Decks down.", feature: "Touring · Festivals · Drops" },
};

type Props = {
  dict: Dictionary;
  sports: SportGroup[];
  totalAthletes: number;
};

export function Athletes({ dict, sports, totalAthletes }: Props) {
  return (
    <section id="athletes" className="relative border-b border-border bg-bg py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid items-end gap-6 border-b border-border pb-10 md:grid-cols-12">
          <div className="md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              {dict.athletes.section}
            </span>
          </div>
          <div className="md:col-span-7">
            <h2 className="font-display text-5xl leading-[0.9] tracking-[-0.01em] sm:text-7xl">
              <span className="text-gradient-green">{dict.athletes.title}</span>
            </h2>
          </div>
          <div className="md:col-span-3 md:text-right">
            <p className="text-sm leading-relaxed text-text-muted">
              {dict.athletes.description}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
              <span className="text-voltra">{totalAthletes}</span> athletes signed
            </p>
          </div>
        </div>

        <ul className="mt-px grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {sports.map((s, i) => {
            const meta = TAGLINES[s.sport] ?? {
              tagline: "Built different.",
              feature: "Featured roster",
            };
            return (
              <li
                key={s.sport}
                className="group relative isolate overflow-hidden bg-bg p-8 transition-colors hover:bg-surface min-h-[420px] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-voltra">
                    S/{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="my-12">
                  <h3 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.86] tracking-[-0.01em]">
                    {s.sport.split(" ").map((w, idx) => (
                      <span
                        key={idx}
                        className={
                          idx % 2 === 0 ? "block text-text" : "block text-stroke"
                        }
                      >
                        {w}
                      </span>
                    ))}
                  </h3>
                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
                    {meta.tagline}
                  </p>
                </div>

                <div className="space-y-2 border-t border-border pt-5 font-mono text-[11px] uppercase tracking-[0.18em]">
                  <div className="flex items-center justify-between">
                    <span className="text-text-dim">Roster</span>
                    <span className="text-voltra">
                      {String(s._count._all).padStart(2, "0")} athletes
                    </span>
                  </div>
                  <p className="pt-2 leading-relaxed text-text-muted normal-case tracking-normal text-xs">
                    <span className="font-mono uppercase tracking-[0.18em] text-text-dim">
                      Featuring ·{" "}
                    </span>
                    {meta.feature}
                  </p>
                </div>

                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-3 border border-voltra opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:inset-2"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
