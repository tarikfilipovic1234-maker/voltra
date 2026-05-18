// Simple word-list filter for user-submitted content. Server-only.
// Words are intentionally generic stand-ins; tune for the actual brand voice.
const BLOCKED = [
  "scam",
  "spam",
  "f**k", "f*ck",
];

// Heuristics:
//   - very-short bodies look like spam
//   - excessive caps / repeated chars
//   - includes blocked words
export function autoModerate(input: { title?: string; body: string }): "APPROVED" | "PENDING" {
  const text = `${input.title ?? ""} ${input.body}`.toLowerCase();
  if (text.length < 10) return "PENDING";
  for (const word of BLOCKED) {
    if (text.includes(word.toLowerCase())) return "PENDING";
  }
  const caps = (text.match(/[A-Z]/g) ?? []).length;
  if (caps > 0 && caps / Math.max(1, text.length) > 0.6) return "PENDING";
  if (/(.)\1{5,}/.test(text)) return "PENDING"; // 6+ repeated chars
  if ((text.match(/https?:\/\//g) ?? []).length > 2) return "PENDING";
  return "APPROVED";
}

export const REPORT_REASONS = ["SPAM", "HARASSMENT", "HATE", "OFFENSIVE", "MISINFO", "OTHER"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "Spam or scam",
  HARASSMENT: "Harassment / bullying",
  HATE: "Hate speech",
  OFFENSIVE: "Offensive content",
  MISINFO: "Misinformation",
  OTHER: "Other",
};
