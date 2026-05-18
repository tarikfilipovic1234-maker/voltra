import type { ReactNode } from "react";

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  hint,
  rows,
  options,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  placeholder?: string;
  hint?: ReactNode;
  rows?: number;
  options?: { value: string; label: string }[];
}) {
  const id = name;
  const cls = "mt-2 block w-full border border-border bg-bg px-4 py-3 font-mono text-sm text-text placeholder:text-text-dim focus:border-voltra focus:outline-none";

  let input: ReactNode;
  if (options) {
    input = (
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        className={cls + " uppercase tracking-[0.12em]"}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-bg">
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (rows) {
    input = (
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={cls + " leading-relaxed"}
      />
    );
  } else {
    input = (
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className={cls}
      />
    );
  }

  return (
    <label htmlFor={id} className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
        {label}
      </span>
      {input}
      {hint && (
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
          {hint}
        </span>
      )}
    </label>
  );
}

export function CheckField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-voltra"
      />
      {label}
    </label>
  );
}
