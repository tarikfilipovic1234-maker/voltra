import { notFound } from "next/navigation";

import { saveArticle } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { LOCALES, REGIONS, REGION_LABELS } from "@/lib/i18n/config";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await prisma.article.findUnique({ where: { id } });
  if (!a) notFound();

  return (
    <FormShell title={`Edit · ${a.title}`} eyebrow="§ Articles / Edit" backHref="/admin/articles">
      <form
        action={async (fd) => {
          "use server";
          await saveArticle(id, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Title" name="title" required defaultValue={a.title} />
        <Field label="Slug" name="slug" defaultValue={a.slug} />
        <Field label="Excerpt" name="excerpt" rows={2} required defaultValue={a.excerpt} />
        <Field label="Body (Markdown)" name="body" rows={14} required defaultValue={a.body} />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Category"
            name="category"
            defaultValue={a.category}
            options={["News", "Athletes", "Esports", "Music", "Motorsport"].map((v) => ({ value: v, label: v }))}
          />
          <Field
            label="Locale"
            name="locale"
            defaultValue={a.locale}
            options={LOCALES.map((l) => ({ value: l, label: l.toUpperCase() }))}
          />
          <Field
            label="Region"
            name="region"
            defaultValue={a.region ?? ""}
            options={[
              { value: "", label: "Global" },
              ...REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` })),
            ]}
          />
        </div>
        <Field label="Tags (CSV)" name="tags" defaultValue={a.tags} />
        <Field label="Cover URL" name="cover" defaultValue={a.cover ?? ""} />
        <CheckField name="published" label="Published" defaultChecked={a.published} />

        <div className="flex items-center gap-3 border-t border-border pt-6">
          <button
            type="submit"
            className="clip-sharp inline-flex items-center gap-3 bg-voltra px-7 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
          >
            Save →
          </button>
          <a href="/admin/articles" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
        </div>
      </form>
    </FormShell>
  );
}
