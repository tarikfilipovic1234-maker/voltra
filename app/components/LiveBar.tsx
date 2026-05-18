import Link from "next/link";
import Image from "next/image";
import { getTrackedStreams } from "@/lib/streams";

const PLATFORM_LABEL: Record<string, string> = {
  TWITCH: "Twitch",
  YOUTUBE: "YouTube",
  KICK: "Kick",
};

const PLATFORM_COLOR: Record<string, string> = {
  TWITCH: "#9146FF",
  YOUTUBE: "#FF0033",
  KICK: "#53FC18",
};

/**
 * Sticky horizontal scroller of tracked channels with live/offline indicators.
 * Embeds the top live stream player inline when at least one is live.
 *
 * Server component — polls APIs in lib/streams.ts. Cached 60s per channel.
 */
export async function LiveBar() {
  const streams = await getTrackedStreams();
  const featuredLive = streams.find((s) => s.live && s.featured) ?? streams.find((s) => s.live);

  return (
    <section id="live" className="border-y border-border bg-bg">
      <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-10">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
          <span>
            § Live / 04 · <span className="text-voltra">{streams.filter((s) => s.live).length} live now</span>
          </span>
          <Link href="#" className="hover:text-voltra">All channels →</Link>
        </div>

        <ul className="mt-5 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {streams.map((s) => (
            <li key={s.id} className="shrink-0">
              <Link
                href={s.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex w-[260px] items-start gap-3 border p-3 transition-colors ${
                  s.live ? "border-voltra/40 bg-surface" : "border-border bg-bg hover:bg-surface"
                }`}
              >
                <span
                  aria-hidden
                  className="absolute right-3 top-3 flex h-2 w-2"
                >
                  {s.live ? (
                    <>
                      <span className="absolute inset-0 animate-ping rounded-full bg-voltra opacity-75" />
                      <span className="relative h-2 w-2 rounded-full bg-voltra" />
                    </>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-text-dim" />
                  )}
                </span>

                <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-border bg-bg">
                  <Image
                    src={s.thumbnail || "/logo.svg"}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.22em]"
                      style={{ color: PLATFORM_COLOR[s.platform] }}
                    >
                      {PLATFORM_LABEL[s.platform]}
                    </span>
                    {s.live && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-voltra">
                        ● LIVE · {s.viewerCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-display text-xl leading-tight truncate">
                    {s.displayName}
                  </div>
                  <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    {s.live ? s.title ?? s.game ?? "Live now" : "Offline"}
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {streams.length === 0 && (
            <li className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
              No channels tracked yet. Add some in /admin/streams.
            </li>
          )}
        </ul>

        {featuredLive && (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
            <div className="clip-tag relative aspect-video w-full overflow-hidden border border-voltra/40 bg-bg">
              <iframe
                src={featuredLive.embedUrl}
                title={`${featuredLive.displayName} live`}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="h-full w-full"
                loading="lazy"
              />
              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 bg-bg/80 px-3 py-1 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-voltra opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-voltra" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">LIVE</span>
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">
                Featured · {PLATFORM_LABEL[featuredLive.platform]}
              </div>
              <h3 className="mt-2 font-display text-4xl leading-tight">{featuredLive.displayName}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-3">
                {featuredLive.title}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4 font-mono text-[10px] uppercase tracking-[0.22em]">
                <div>
                  <dt className="text-text-dim">Viewers</dt>
                  <dd className="mt-1 text-voltra tabular">{featuredLive.viewerCount.toLocaleString()}</dd>
                </div>
                {featuredLive.game && (
                  <div>
                    <dt className="text-text-dim">Category</dt>
                    <dd className="mt-1 text-text truncate">{featuredLive.game}</dd>
                  </div>
                )}
              </dl>
              <Link
                href={featuredLive.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="clip-sharp mt-5 inline-flex items-center gap-3 bg-voltra px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid"
              >
                Open Channel →
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
