import { notFound } from "next/navigation";

import { saveStream } from "@/app/actions/admin-loyalty";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { REGIONS, REGION_LABELS } from "@/lib/i18n/config";

export default async function EditStreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [s, athletes] = await Promise.all([
    prisma.stream.findUnique({ where: { id } }),
    prisma.athlete.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!s) notFound();

  return (
    <FormShell title={`Edit · ${s.displayName}`} eyebrow="§ Streams / Edit" backHref="/admin/streams">
      <form
        action={async (fd) => {
          "use server";
          await saveStream(id, fd);
        }}
        className="grid gap-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Platform"
            name="platform"
            defaultValue={s.platform}
            options={[
              { value: "TWITCH", label: "Twitch" },
              { value: "YOUTUBE", label: "YouTube" },
              { value: "KICK", label: "Kick" },
            ]}
          />
          <Field label="Channel / Login" name="channel" required defaultValue={s.channel} />
        </div>
        <Field label="Display name" name="displayName" required defaultValue={s.displayName} />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Athlete"
            name="athleteId"
            defaultValue={s.athleteId ?? ""}
            options={[{ value: "", label: "— None —" }, ...athletes.map((a) => ({ value: a.id, label: a.name }))]}
          />
          <Field label="Category" name="category" defaultValue={s.category ?? ""} />
          <Field
            label="Region"
            name="region"
            defaultValue={s.region ?? ""}
            options={[{ value: "", label: "Global" }, ...REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` }))]}
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <CheckField name="featured" label="Featured" defaultChecked={s.featured} />
          <CheckField name="active" label="Active" defaultChecked={s.active} />
        </div>

        <div className="border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
          Live status (read-only)
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
            <div>Status</div><dd className={s.live ? "text-voltra" : "text-text-dim"}>{s.live ? "● LIVE" : "offline"}</dd>
            <div>Viewers</div><dd className="text-text tabular">{s.viewerCount.toLocaleString()}</dd>
            <div>Title</div><dd className="text-text normal-case tracking-normal">{s.title ?? "—"}</dd>
            <div>Game</div><dd className="text-text-muted normal-case tracking-normal">{s.game ?? "—"}</dd>
            <div>Last checked</div><dd className="text-text-muted">{s.lastChecked?.toISOString() ?? "never"}</dd>
          </dl>
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
