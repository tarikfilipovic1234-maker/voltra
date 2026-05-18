import "server-only";
import { DEFAULT_LOCALE, type Locale } from "./config";

// Lazy-loaded JSON dictionaries — keeps each locale out of the initial bundle.
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./messages/en.json").then((m) => m.default as Dictionary),
  es: () => import("./messages/es.json").then((m) => m.default as Dictionary),
  de: () => import("./messages/de.json").then((m) => m.default as Dictionary),
  fr: () => import("./messages/fr.json").then((m) => m.default as Dictionary),
  ja: () => import("./messages/ja.json").then((m) => m.default as Dictionary),
  pt: () => import("./messages/pt.json").then((m) => m.default as Dictionary),
};

export type Dictionary = {
  nav: { products: string; athletes: string; voltage: string; storeLocator: string; findCan: string };
  hero: {
    badge: string;
    headline1: string;
    headline2: string;
    headline3: string;
    description: string;
    cta1: string;
    cta2: string;
    since: string;
    caffeine: string;
    sugar: string;
    calories: string;
    bvits: string;
    nutrition: string;
    status: string;
    statusReady: string;
  };
  lineup: { section: string; title: string; subtitle: string };
  stats: { section: string; title1: string; title2: string };
  athletes: { section: string; title: string; description: string };
  manifesto: { section: string; title1: string; title2: string; description: string; cta: string; placeholder: string; nospam: string; pack: string; unsubscribe: string };
  footer: { rights: string; status: string };
  search: { title: string; placeholder: string; results: string; noResults: string; filterBy: string; sport: string; region: string; category: string; type: string; all: string; products: string; athletes: string; articles: string; videos: string };
  auth: { signIn: string; signUp: string; signOut: string; email: string; password: string; name: string; or: string; alreadyHave: string; needAccount: string; continueWith: string };
  profile: { title: string; greeting: string; member: string; tier: string; points: string; region: string; locale: string; newsletter: string; save: string; saved: string };
  admin: { dashboard: string; athletes: string; products: string; videos: string; articles: string; events: string; users: string; create: string; edit: string; delete: string; save: string; cancel: string; back: string };
};

const cache = new Map<Locale, Dictionary>();

export async function getDictionary(locale: Locale | string): Promise<Dictionary> {
  const key = (locale in loaders ? locale : DEFAULT_LOCALE) as Locale;
  const cached = cache.get(key);
  if (cached) return cached;
  const dict = await loaders[key]();
  cache.set(key, dict);
  return dict;
}
