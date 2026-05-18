import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { deleteArticle } from "@/app/actions/admin";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string }>;
}) {
  const sp = await searchParams;
  const showOnly =
    sp.published === "false" ? false : sp.published === "true" ? true : undefined;

  const articles = await prisma.article.findMany({
    where: showOnly === undefined ? {} : { published: showOnly },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 04 / Articles</span>
          <h1 className="mt-3 font-display text-5xl">Editorial</h1>
          <p className="mt-2 text-sm text-text-muted">{articles.length} articles</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter href="/admin/articles" label="All" active={showOnly === undefined} />
          <Filter href="/admin/articles?published=true" label="Live" active={showOnly === true} />
          <Filter href="/admin/articles?published=false" label="Drafts" active={showOnly === false} />
          <Link
            href="/admin/articles/new"
            className="clip-sharp inline-flex items-center gap-2 bg-voltra px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
          >
            + New Article
          </Link>
        </div>
      </header>

      <table className="w-full border-collapse border border-border bg-surface font-mono text-xs">
        <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
          <tr>
            <th className="border-b border-border p-3">Title</th>
            <th className="border-b border-border p-3">Category</th>
            <th className="border-b border-border p-3">Locale</th>
            <th className="border-b border-border p-3">Region</th>
            <th className="border-b border-border p-3">Status</th>
            <th className="border-b border-border p-3">Updated</th>
            <th className="border-b border-border p-3"></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id} className="border-b border-border last:border-b-0">
              <td className="p-3">
                <Link href={`/admin/articles/${a.id}`} className="text-text hover:text-voltra">
                  {a.title}
                </Link>
                <p className="mt-1 text-text-dim normal-case tracking-normal">{a.excerpt}</p>
              </td>
              <td className="p-3 text-text-muted">{a.category}</td>
              <td className="p-3 text-text-muted">{a.locale.toUpperCase()}</td>
              <td className="p-3 text-text-muted">{a.region ?? "—"}</td>
              <td className="p-3">
                <span className={a.published ? "text-voltra" : "text-text-dim"}>
                  {a.published ? "Live" : "Draft"}
                </span>
              </td>
              <td className="p-3 text-text-dim">{a.updatedAt.toISOString().slice(0, 10)}</td>
              <td className="p-3 text-right"><DeleteButton id={a.id} action={deleteArticle} /></td>
            </tr>
          ))}
          {articles.length === 0 && (
            <tr><td colSpan={7} className="p-8 text-center text-text-dim">No articles match this filter.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Filter({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
        active ? "border-voltra bg-voltra/10 text-voltra" : "border-border text-text-muted hover:text-text"
      }`}
    >
      {label}
    </Link>
  );
}
