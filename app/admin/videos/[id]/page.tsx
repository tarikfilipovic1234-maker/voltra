import { notFound, redirect } from "next/navigation";

import { saveVideo } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { REGIONS, REGION_LABELS } from "@/lib/i18n/config";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [v, athletes] = await Promise.all([
    prisma.video.findUnique({ where: { id } }),
    prisma.athlete.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  if (!v) notFound();

  return (
    <FormShell title={`Edit · ${v.title}`} eyebrow="§ Videos / Edit" backHref="/admin/videos">
      <form
        action={async (fd) => {
          "use server";
          await saveVideo(id, fd);
          redirect("/admin/videos");
        }}
        className="grid gap-6"
      >
        <Field label="Title" name="title" defaultValue={v.title} required />
        <Field label="Description" name="description" rows={4} defaultValue={v.description} required />
        <Field label="Embed URL" name="url" defaultValue={v.url} required />
        <Field label="Thumbnail URL" name="thumbnail" defaultValue={v.thumbnail ?? ""} />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Sport" name="sport" defaultValue={v.sport ?? ""} />
          <Field
            label="Region"
            name="region"
            defaultValue={v.region ?? ""}
            options={[
              { value: "", label: "Global" },
              ...REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` })),
            ]}
          />
          <Field
            label="Athlete"
            name="athleteId"
            defaultValue={v.athleteId ?? ""}
            options={[{ value: "", label: "— None —" }, ...athletes.map((a) => ({ value: a.id, label: a.name }))]}
          />
        </div>
        <CheckField name="featured" label="Featured" defaultChecked={v.featured} />
        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button
            type="submit"
            className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
          >
            Save →
          </button>
          <a href="/admin/videos" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
