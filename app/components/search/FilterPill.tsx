import Link from "next/link";

export function FilterPill({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number | undefined;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
        active
          ? "border-voltra bg-voltra/10 text-voltra"
          : "border-border bg-bg text-text-muted hover:border-voltra/40 hover:text-text"
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={`tabular ${active ? "text-voltra" : "text-text-dim"}`}>{count}</span>
      )}
    </Link>
  );
}
