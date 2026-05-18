import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/dal";
import { signOutAction } from "@/app/actions/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, LOCALES, LOCALE_LABELS, REGIONS, REGION_LABELS, type Locale } from "@/lib/i18n/config";
import { ProfileForm } from "@/app/components/auth/ProfileForm";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const dict = await getDictionary(locale);

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.svg"
                alt=""
                fill
                sizes="40px"
                className="object-contain drop-shadow-[0_0_10px_rgba(0,255,65,0.55)]"
              />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              VOLTRA<span className="text-voltra">/</span>Profile
            </span>
          </Link>
          <form action={signOutAction}>
            <button className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim transition-colors hover:text-voltra">
              {dict.auth.signOut}
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              § Profile / 01
            </span>
            <h1 className="mt-4 font-display text-[clamp(3rem,6vw,5rem)] leading-[0.88] tracking-[-0.01em]">
              {dict.profile.greeting}
              <br />
              <span className="text-gradient-green">{user.name ?? user.email}.</span>
            </h1>

            <ul className="mt-10 divide-y divide-border border-y border-border font-mono text-xs uppercase tracking-[0.18em]">
              <li className="flex items-center justify-between py-3">
                <span className="text-text-dim">{dict.profile.tier}</span>
                <span className="text-voltra">{user.tier}</span>
              </li>
              <li className="flex items-center justify-between py-3">
                <span className="text-text-dim">{dict.profile.points}</span>
                <span className="text-voltra tabular">{user.rewardPoints.toLocaleString()}</span>
              </li>
              <li className="flex items-center justify-between py-3">
                <span className="text-text-dim">{dict.profile.member}</span>
                <span className="text-text">
                  {user.createdAt.toISOString().slice(0, 10)}
                </span>
              </li>
              <li className="flex items-center justify-between py-3">
                <span className="text-text-dim">Role</span>
                <span className="text-text">{user.role}</span>
              </li>
            </ul>

            {(user.role === "ADMIN" || user.role === "EDITOR") && (
              <Link
                href="/admin"
                className="clip-sharp mt-8 inline-flex items-center gap-3 border border-voltra/60 bg-voltra/10 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-voltra transition-colors hover:bg-voltra/20"
              >
                → Admin Console
              </Link>
            )}
          </aside>

          <section className="lg:col-span-8">
            <div className="clip-tag border border-border bg-surface p-8">
              <h2 className="font-display text-3xl">{dict.profile.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Update your region, language and newsletter preferences. Region
                changes immediately filter which products show on the landing
                page.
              </p>

              <ProfileForm
                dict={dict}
                initial={{
                  name: user.name ?? "",
                  locale: user.locale,
                  region: user.region,
                  country: user.country ?? "",
                  newsletter: user.newsletter,
                }}
                locales={LOCALES.map((c) => ({ code: c, label: LOCALE_LABELS[c].native }))}
                regions={REGIONS.map((c) => ({ code: c, label: REGION_LABELS[c] }))}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
