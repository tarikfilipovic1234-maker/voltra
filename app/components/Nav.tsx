import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { signOutAction } from "@/app/actions/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  dict: Dictionary;
  locale: Locale;
  session: Session | null;
};

export function Nav({ dict, locale, session }: Props) {
  const links = [
    { label: dict.nav.products, code: "01", href: `/${locale}#products` },
    { label: "Shop", code: "02", href: `/${locale}/shop` },
    { label: "Rewards", code: "03", href: `/${locale}/rewards` },
    { label: dict.nav.athletes, code: "04", href: `/${locale}#athletes` },
    { label: dict.nav.storeLocator, code: "05", href: `/${locale}/search` },
  ];

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "EDITOR";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
        <Link href={`/${locale}`} className="group flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image
              src="/logo.svg"
              alt="VOLTRA"
              fill
              sizes="40px"
              className="object-contain drop-shadow-[0_0_10px_rgba(0,255,65,0.55)]"
              priority
            />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted group-hover:text-voltra transition-colors">
            VOLTRA<span className="text-voltra">/</span>Energy
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="group relative flex items-center gap-2 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-text"
            >
              <span className="text-voltra/70 group-hover:text-voltra">{l.code}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher current={locale} />

          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="hidden items-center gap-2 border border-border bg-surface/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted backdrop-blur transition-colors hover:border-voltra hover:text-voltra lg:flex"
              >
                <span className="h-1.5 w-1.5 animate-glow rounded-full bg-voltra" />
                {session.user.name ?? session.user.email}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="clip-tag hidden border border-voltra/60 bg-voltra/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-voltra transition-colors hover:bg-voltra/20 md:inline-flex"
                >
                  Admin
                </Link>
              )}
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim transition-colors hover:text-voltra"
                >
                  {dict.auth.signOut}
                </button>
              </form>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="clip-sharp inline-flex items-center gap-2 bg-voltra px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
            >
              {dict.auth.signIn}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
