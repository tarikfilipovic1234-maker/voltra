export function SearchInput({
  action,
  defaultValue,
  placeholder,
}: {
  action: string;
  defaultValue: string;
  placeholder: string;
}) {
  return (
    <form action={action} method="GET" className="flex w-full max-w-3xl">
      <div className="clip-tag flex w-full items-center gap-3 border border-border bg-surface px-5 py-4">
        <span aria-hidden className="font-mono text-[10px] uppercase tracking-[0.22em] text-voltra">
          ⌕
        </span>
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoFocus
          className="w-full bg-transparent font-mono text-sm uppercase tracking-[0.12em] text-text placeholder:text-text-dim focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="clip-sharp ml-3 inline-flex items-center justify-center gap-2 bg-voltra px-7 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
      >
        Run →
      </button>
    </form>
  );
}
