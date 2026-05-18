import Image from "next/image";
import { newsletterSignupAction } from "@/app/actions/newsletter";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Manifesto({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="store-locator"
      className="relative isolate overflow-hidden border-b border-border bg-bg py-32 lg:py-40"
    >
      {/* Giant faded background claw */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] top-1/2 h-[160%] w-[80%] -translate-y-1/2 animate-drift">
          <div className="halo opacity-60" />
          <Image
            src="/logo.svg"
            alt=""
            fill
            sizes="80vw"
            className="object-contain object-left opacity-25 drop-shadow-[0_0_120px_rgba(0,255,65,0.4)]"
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              {dict.manifesto.section}
            </span>

            <h2 className="mt-6 font-display text-[clamp(3rem,9vw,9rem)] leading-[0.85] tracking-[-0.02em]">
              {dict.manifesto.title1} <br />
              <span className="text-gradient-green">{dict.manifesto.title2}</span>
            </h2>

            <p className="mt-8 max-w-xl text-base leading-relaxed text-text-muted sm:text-lg">
              {dict.manifesto.description}
            </p>

            <form
              className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
              action={newsletterSignupAction}
            >
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="clip-tag flex w-full items-center gap-3 border border-border bg-surface px-5 py-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">
                  Mail/in
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={dict.manifesto.placeholder}
                  className="w-full bg-transparent font-mono text-sm uppercase tracking-[0.12em] text-text placeholder:text-text-dim focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="clip-sharp group inline-flex items-center justify-center gap-3 bg-voltra px-8 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-black transition-all hover:-translate-y-[2px] hover:bg-voltra-acid"
              >
                {dict.manifesto.cta}
                <span aria-hidden>→</span>
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-glow rounded-full bg-voltra" />
                127,418 {dict.manifesto.pack}
              </span>
              <span>·</span>
              <span>{dict.manifesto.nospam}</span>
              <span>·</span>
              <span>{dict.manifesto.unsubscribe}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
