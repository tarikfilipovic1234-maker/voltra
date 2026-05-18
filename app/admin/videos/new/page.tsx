import { saveVideo } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { REGIONS, REGION_LABELS } from "@/lib/i18n/config";

export default async function NewVideoPage() {
  const athletes = await prisma.athlete.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  return (
    <FormShell title="New Video" eyebrow="§ Videos / New" backHref="/admin/videos">
      <form
        action={async (fd) => {
          "use server";
          await saveVideo(null, fd);
          const { redirect } = await import("next/navigation");
          redirect("/admin/videos");
        }}
        className="grid gap-6"
      >
        <Field label="Title" name="title" required />
        <Field label="Description" name="description" rows={4} required />
        <Field label="Embed URL" name="url" required placeholder="https://www.youtube.com/embed/…" />
        <Field label="Thumbnail URL" name="thumbnail" />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Sport" name="sport" />
          <Field
            label="Region"
            name="region"
            options={[
              { value: "", label: "Global" },
              ...REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` })),
            ]}
          />
          <Field
            label="Athlete"
            name="athleteId"
            options={[{ value: "", label: "— None —" }, ...athletes.map((a) => ({ value: a.id, label: a.name }))]}
          />
        </div>
        <CheckField name="featured" label="Featured (homepage video reel)" />
        <Buttons />
      </form>
    </FormShell>
  );
}

function Buttons() {
  return (
    <div className="flex items-center gap-3 border-t border-border pt-6">
      <button
        type="submit"
        className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
      >
        Save →
      </button>
      <a href="/admin/videos" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
    </div>
  );
}
