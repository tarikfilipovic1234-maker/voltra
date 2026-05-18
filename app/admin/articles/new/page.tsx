import { saveArticle } from "@/app/actions/admin";
import { CheckField, Field } from "@/app/components/admin/Field";
import { FormShell } from "@/app/components/admin/FormShell";
import { LOCALES, REGIONS, REGION_LABELS } from "@/lib/i18n/config";

export default function NewArticlePage() {
  return (
    <FormShell title="New Article" eyebrow="§ Articles / New" backHref="/admin/articles">
      <form
        action={async (fd) => {
          "use server";
          await saveArticle(null, fd);
        }}
        className="grid gap-6"
      >
        <Field label="Title" name="title" required />
        <Field label="Slug" name="slug" placeholder="auto from title" />
        <Field label="Excerpt" name="excerpt" rows={2} required />
        <Field label="Body (Markdown)" name="body" rows={14} required placeholder="# Heading\n\nLead paragraph…" />
        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Category"
            name="category"
            defaultValue="News"
            options={["News", "Athletes", "Esports", "Music", "Motorsport"].map((v) => ({ value: v, label: v }))}
          />
          <Field
            label="Locale"
            name="locale"
            defaultValue="en"
            options={LOCALES.map((l) => ({ value: l, label: l.toUpperCase() }))}
          />
          <Field
            label="Region"
            name="region"
            options={[
              { value: "", label: "Global" },
              ...REGIONS.map((r) => ({ value: r, label: `${r} · ${REGION_LABELS[r]}` })),
            ]}
          />
        </div>
        <Field label="Tags (CSV)" name="tags" placeholder="news, drop016, brewing" />
        <Field label="Cover URL" name="cover" />
        <CheckField name="published" label="Publish immediately" />
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
      <a href="/admin/articles" className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-text">Cancel</a>
    </div>
  );
}
