import "server-only";
import { headers, cookies } from "next/headers";
import {
  COUNTRY_TO_LOCALE,
  COUNTRY_TO_REGION,
  DEFAULT_LOCALE,
  DEFAULT_REGION,
  isLocale,
  isRegion,
  LOCALES,
  type Locale,
  type Region,
} from "./config";

/**
 * Resolution order:
 *  1. URL path segment ([lang])  — handled by route props, not here
 *  2. Cookie  "voltra.locale"  / "voltra.region"  (user override)
 *  3. Authenticated user profile DB value           — handled separately
 *  4. Geo headers (Vercel / hosting provider)
 *  5. Accept-Language header
 *  6. Default (en / NA)
 */
export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("voltra.locale")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const h = await headers();

  // Vercel-style geo headers (x-vercel-ip-country) and Cloudflare CF-IPCountry
  const country =
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null;
  if (country && COUNTRY_TO_LOCALE[country.toUpperCase()]) {
    return COUNTRY_TO_LOCALE[country.toUpperCase()];
  }

  const accept = h.get("accept-language");
  if (accept) {
    const top = accept
      .split(",")
      .map((p) => p.split(";")[0].trim().slice(0, 2).toLowerCase())
      .find((p) => (LOCALES as readonly string[]).includes(p));
    if (top && isLocale(top)) return top;
  }

  return DEFAULT_LOCALE;
}

export async function resolveRegion(): Promise<Region> {
  const cookieStore = await cookies();
  const cookieRegion = cookieStore.get("voltra.region")?.value;
  if (cookieRegion && isRegion(cookieRegion)) return cookieRegion;

  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null;
  if (country && COUNTRY_TO_REGION[country.toUpperCase()]) {
    return COUNTRY_TO_REGION[country.toUpperCase()];
  }

  return DEFAULT_REGION;
}

export async function resolveLocaleAndRegion() {
  const [locale, region] = await Promise.all([
    resolveLocale(),
    resolveRegion(),
  ]);
  return { locale, region };
}
