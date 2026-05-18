import { saveStream } from "@/app/actions/admin-loyalty";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { REGIONS, REGION_LABELS } from "@/lib/i18n/config";

export default async function NewStreamPage() {
  const athletes = await prisma.athlete.findMany({ orderBy: { name: "asc" } });

  return (
    <FormShell title="Track New Channel" eyebrow="§ Streams / New" backHref="/admin/streams">
      <form
        action={async (fd) => {
          "use server";
          await saveStream(null, fd);
        }}
        className="grid gap-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Platform"
            name="platform"
            required
            options={[
              { value: "TWITCH", label: "Twitch" },
              { value: "YOUTUBE", label: "YouTube" },
              { value: "KICK", label: "Kick" },
            ]}
          />
          <Field label="Channel / Login" name="channel" required placeholder="shroud" hint="Twitch login, YouTube channel ID or handle, Kick handle" />
        </div>
        <Field label="Display name" name="displayName" required placeholder="Shroud" />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Athlete (optional)"
            name="athleteId"
            options={[{ value: "", label: "— None —" }, ...athletes.map((a) => ({ value: a.id, label: a.name }))]}
          />
          <Field label="Category" name="category" placeholder="Esports / Motocross / Brand" />
          <Field
            label="Region"
            name="region"
            options={[{ value: "", label: "Global" }, ...REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` }))]}
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <CheckField name="featured" label="Featured (eligible for homepage embed)" />
          <CheckField name="active" label="Poll this channel" defaultChecked />
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button type="submit" className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid">
            Save →
          </button>
          <a href="/admin/streams" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
