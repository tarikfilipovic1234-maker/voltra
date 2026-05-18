import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const COLUMNS = [
  {
    title: "Company",
    links: ["About", "Careers", "Sustainability", "Press"],
  },
  {
    title: "Products",
    links: ["Original", "Ultra", "Juiced", "Rehab", "Reserve", "Khaos"],
  },
  {
    title: "Pack",
    links: ["Athletes", "Esports", "Events", "Newsletter"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Cookies", "California Notice"],
  },
];

const SOCIAL = ["Instagram", "TikTok", "YouTube", "X", "Twitch"];

export function Footer({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <footer className="relative isolate overflow-hidden bg-bg pt-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid gap-12 border-b border-border pb-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12">
                <Image
                  src="/logo.svg"
                  alt="VOLTRA"
                  fill
                  sizes="48px"
                  className="object-contain drop-shadow-[0_0_15px_rgba(0,255,65,0.55)]"
                />
              </div>
              <span className="font-display text-3xl tracking-[-0.01em]">
                VOLTRA<span className="text-voltra">.</span>
              </span>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-text-muted">
              160mg of caffeine. Zero compromise. The original mean energy drink
              — brewed loud, served cold, made for the relentless.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s}
                  href="#"
                  className="clip-tag border border-border bg-surface px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-voltra hover:text-voltra"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {COLUMNS.map((col) => (
                <div key={col.title}>
                  <h4 className="font-mono text-[10px] uppercase tracking-[0.32em] text-voltra">
                    {col.title}
                  </h4>
                  <ul className="mt-5 space-y-3">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a
                          href="#"
                          className="font-display text-xl uppercase tracking-[0.01em] text-text transition-colors hover:text-voltra"
                        >
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 py-8 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} VOLTRA Energy Co.. {dict.footer.rights}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-glow rounded-full bg-voltra" />
              Status · {dict.footer.status}
            </span>
            <span>v 16.02 / 06 · {locale.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Massive watermark wordmark */}
      <div className="relative -mt-6 select-none overflow-hidden leading-none">
        <p
          aria-hidden
          className="font-display text-stroke whitespace-nowrap text-[clamp(8rem,28vw,26rem)] tracking-[-0.04em] leading-[0.8] translate-y-[18%]"
        >
          VOLTRA · GRID
        </p>
      </div>
    </footer>
  );
}
