import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALES,
  DEFAULT_LOCALE,
  COUNTRY_TO_LOCALE,
  COUNTRY_TO_REGION,
  DEFAULT_REGION,
  type Locale,
  isLocale,
} from "@/lib/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;
const LOCALE_SEGMENT = new RegExp(`^/(${LOCALES.join("|")})(/|$)`);

function pickLocale(req: NextRequest): Locale {
  // 1. cookie override
  const cookieLocale = req.cookies.get("voltra.locale")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  // 2. geo header
  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    null;
  if (country) {
    const fromCountry = COUNTRY_TO_LOCALE[country.toUpperCase()];
    if (fromCountry) return fromCountry;
  }

  // 3. accept-language
  const accept = req.headers.get("accept-language") ?? "";
  const top = accept
    .split(",")
    .map((p) => p.split(";")[0].trim().slice(0, 2).toLowerCase())
    .find((p) => (LOCALES as readonly string[]).includes(p));
  if (top && isLocale(top)) return top;

  // 4. default
  return DEFAULT_LOCALE;
}

function pickRegion(req: NextRequest): string {
  const cookieRegion = req.cookies.get("voltra.region")?.value;
  if (cookieRegion) return cookieRegion;
  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    null;
  if (country) {
    const fromCountry = COUNTRY_TO_REGION[country.toUpperCase()];
    if (fromCountry) return fromCountry;
  }
  return DEFAULT_REGION;
}

export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Skip Next internals, API routes, static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") || // admin is locale-agnostic
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // If path already has a locale, just refresh the region cookie if missing.
  if (LOCALE_SEGMENT.test(pathname)) {
    const res = NextResponse.next();
    if (!req.cookies.get("voltra.region")?.value) {
      res.cookies.set("voltra.region", pickRegion(req), {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  }

  // No locale in path — pick one and redirect
  const locale = pickLocale(req);
  const region = pickRegion(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;

  const res = NextResponse.redirect(url);
  res.cookies.set("voltra.locale", locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  res.cookies.set("voltra.region", region, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export const config = {
  // Run on all paths except Next internals & static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
