import { signInWithProvider } from "@/app/actions/auth";

const META: Record<string, { label: string; bg: string; fg: string; icon: string }> = {
  google: {
    label: "Google",
    bg: "bg-white",
    fg: "text-black",
    icon: "G",
  },
  discord: {
    label: "Discord",
    bg: "bg-[#5865F2]",
    fg: "text-white",
    icon: "D",
  },
  facebook: {
    label: "Facebook",
    bg: "bg-[#1877F2]",
    fg: "text-white",
    icon: "f",
  },
};

export function OAuthButtons({
  providers,
  label,
}: {
  providers: string[];
  label: string;
}) {
  if (providers.length === 0) return null;
  return (
    <div className="grid gap-3">
      {providers.map((p) => {
        const meta = META[p];
        if (!meta) return null;
        return (
          <form
            key={p}
            action={async () => {
              "use server";
              await signInWithProvider(p);
            }}
          >
            <button
              type="submit"
              className={`clip-sharp flex w-full items-center justify-center gap-3 ${meta.bg} ${meta.fg} px-7 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.22em] transition-transform hover:-translate-y-[1px]`}
            >
              <span className="font-display text-base">{meta.icon}</span>
              <span>{label} {meta.label}</span>
            </button>
          </form>
        );
      })}
    </div>
  );
}
