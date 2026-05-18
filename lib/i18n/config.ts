export const LOCALES = ["en", "es", "de", "fr", "ja", "pt"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, { name: string; native: string }> = {
  en: { name: "English", native: "English" },
  es: { name: "Spanish", native: "Español" },
  de: { name: "German", native: "Deutsch" },
  fr: { name: "French", native: "Français" },
  ja: { name: "Japanese", native: "日本語" },
  pt: { name: "Portuguese", native: "Português" },
};

export const REGIONS = ["NA", "EU", "APAC", "LATAM", "MEA"] as const;
export type Region = (typeof REGIONS)[number];
export const DEFAULT_REGION: Region = "NA";

export const REGION_LABELS: Record<Region, string> = {
  NA: "North America",
  EU: "Europe",
  APAC: "Asia Pacific",
  LATAM: "Latin America",
  MEA: "Middle East & Africa",
};

// ISO-2 country → region routing table. Used for IP-based region detection.
export const COUNTRY_TO_REGION: Record<string, Region> = {
  US: "NA", CA: "NA", MX: "NA",
  GB: "EU", FR: "EU", DE: "EU", ES: "EU", IT: "EU", PT: "EU",
  NL: "EU", BE: "EU", IE: "EU", PL: "EU", SE: "EU", NO: "EU",
  DK: "EU", FI: "EU", CH: "EU", AT: "EU",
  JP: "APAC", KR: "APAC", CN: "APAC", TW: "APAC", HK: "APAC",
  SG: "APAC", MY: "APAC", TH: "APAC", VN: "APAC", PH: "APAC",
  ID: "APAC", AU: "APAC", NZ: "APAC", IN: "APAC",
  BR: "LATAM", AR: "LATAM", CL: "LATAM", CO: "LATAM", PE: "LATAM",
  AE: "MEA", SA: "MEA", IL: "MEA", EG: "MEA", ZA: "MEA",
};

// Country → preferred locale (best-effort)
export const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  US: "en", CA: "en", GB: "en", IE: "en", AU: "en", NZ: "en",
  ES: "es", MX: "es", AR: "es", CL: "es", CO: "es", PE: "es",
  DE: "de", AT: "de", CH: "de",
  FR: "fr", BE: "fr",
  JP: "ja",
  BR: "pt", PT: "pt",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function isRegion(value: string): value is Region {
  return (REGIONS as readonly string[]).includes(value);
}
