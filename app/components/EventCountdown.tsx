import { Countdown } from "./Countdown";
import { prisma } from "@/lib/prisma";

type Props = { region?: string };

/**
 * Shows the next 3 upcoming events with live-updating countdown timers.
 * Filters by user's region when provided.
 */
export async function EventCountdown({ region }: Props) {
  const now = new Date();
  // Surface upcoming events globally. Regional events bubble up first.
  const events = await prisma.event.findMany({
    where: { active: true, startsAt: { gte: now } },
    orderBy: { startsAt: "asc" },
    take: 6,
  });

  // Sort: matching-region first, then chronological
  events.sort((a, b) => {
    const ar = region && a.region === region ? 0 : 1;
    const br = region && b.region === region ? 0 : 1;
    if (ar !== br) return ar - br;
    return a.startsAt.getTime() - b.startsAt.getTime();
  });

  if (events.length === 0) return null;

  return (
    <section id="events" className="border-b border-border bg-bg py-20 lg:py-28">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid items-end gap-6 border-b border-border pb-8 md:grid-cols-12">
          <div className="md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              § Schedule / 05
            </span>
          </div>
          <div className="md:col-span-7">
            <h2 className="font-display text-5xl leading-[0.9] tracking-[-0.01em] sm:text-7xl">
              Coming <span className="text-gradient-green">loud.</span>
            </h2>
          </div>
          <div className="md:col-span-3 md:text-right">
            <p className="text-sm leading-relaxed text-text-muted">
              Live race lineups, fight cards, festival sets. Set your watch.
            </p>
          </div>
        </div>

        <ul className="mt-px grid grid-cols-1 gap-px bg-border lg:grid-cols-3">
          {events.slice(0, 3).map((e, i) => (
            <li
              key={e.id}
              className="bg-bg p-8 lg:p-10 flex flex-col justify-between min-h-[320px]"
            >
              <div>
                <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                  <span className="text-voltra">EV/{String(i + 1).padStart(2, "0")}</span>
                  <span>{e.region}{e.sport ? ` · ${e.sport}` : ""}</span>
                </div>

                <h3 className="mt-6 font-display text-3xl leading-tight">
                  {e.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
                  {e.description}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {e.location} · {e.startsAt.toUTCString()}
                </p>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
                  Drops in
                </span>
                <div className="mt-2">
                  <Countdown targetIso={e.startsAt.toISOString()} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
