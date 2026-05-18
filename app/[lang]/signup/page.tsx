import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, enabledOAuthProviders } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { SignupForm } from "@/app/components/auth/SignupForm";
import { OAuthButtons } from "@/app/components/auth/OAuthButtons";
import { AuthShell } from "@/app/components/auth/AuthShell";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";

  const session = await auth();
  if (session) redirect(`/${locale}`);

  const dict = await getDictionary(locale);

  return (
    <AuthShell
      locale={locale}
      side={{
        eyebrow: "§ Sign Up / 02",
        title: dict.auth.signUp + ".",
        body: "Join the pack. Get 100 volts just for showing up.",
      }}
    >
      <SignupForm dict={dict} />
      {enabledOAuthProviders.length > 0 && (
        <>
          <div className="my-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
            <span className="h-px flex-1 bg-border" />
            {dict.auth.or}
            <span className="h-px flex-1 bg-border" />
          </div>
          <OAuthButtons providers={enabledOAuthProviders} label={dict.auth.continueWith} />
        </>
      )}
      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
        {dict.auth.alreadyHave}{" "}
        <Link
          href={`/${locale}/login`}
          className="text-voltra underline-offset-4 hover:underline"
        >
          {dict.auth.signIn}
        </Link>
      </p>
    </AuthShell>
  );
}
