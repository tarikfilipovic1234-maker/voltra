import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { trackPageView } from "@/lib/analytics";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { CommentBlock } from "@/app/components/community/CommentBlock";

// Tiny markdown shim — handles # / ## / ### headings + paragraphs + bold/italic.
// Real markdown libs are overkill for our short article bodies.
function renderMarkdown(src: string): React.ReactNode {
  const blocks = src.split(/\n{2,}/);
  return blocks.map((b, i) => {
    const trimmed = b.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-8 font-display text-2xl text-text">
          {inline(trimmed.slice(4))}
        </h3>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-10 font-display text-3xl text-text">
          {inline(trimmed.slice(3))}
        </h2>
      );
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={i} className="mt-12 font-display text-4xl text-gradient-green">
          {inline(trimmed.slice(2))}
        </h1>
      );
    }
    return (
      <p key={i} className="mt-5 text-base leading-relaxed text-text-muted">
        {inline(trimmed)}
      </p>
    );
  });
}

function inline(text: string): React.ReactNode {
  // Bold **x**, italic *x*
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const m = match[0];
    if (m.startsWith("**")) {
      parts.push(<strong key={key++} className="text-text">{m.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={key++} className="italic">{m.slice(1, -1)}</em>);
    }
    last = match.index + m.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";

  const [article, session] = await Promise.all([
    prisma.article.findUnique({
      where: { slug },
      include: { author: { select: { name: true, image: true, tier: true } } },
    }),
    auth(),
  ]);
  if (!article || !article.published) notFound();

  void trackPageView({
    path: `/${lang}/articles/${slug}`,
    articleId: article.id,
    userId: session?.user?.id,
  });

  const related = await prisma.article.findMany({
    where: {
      published: true,
      category: article.category,
      id: { not: article.id },
      locale: article.locale,
    },
    take: 4,
    orderBy: { publishedAt: "desc" },
  });

  const tags = (article.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/logo.svg"
                alt=""
                fill
                sizes="40px"
                className="object-contain drop-shadow-[0_0_10px_rgba(0,255,65,0.55)]"
              />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              VOLTRA<span className="text-voltra">/</span>Article
            </span>
          </Link>
          <Link
            href={`/${locale}/search?type=articles`}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:text-voltra"
          >
            ← All Articles
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-[1100px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em]">
          <span className="text-voltra">§ {article.category}</span>
          <span className="text-text-dim">/</span>
          <span className="text-text-muted">
            {article.publishedAt?.toISOString().slice(0, 10) ??
              article.createdAt.toISOString().slice(0, 10)}
          </span>
          {article.region && (
            <>
              <span className="text-text-dim">·</span>
              <span className="text-text-muted">{article.region}</span>
            </>
          )}
        </div>

        <h1 className="mt-6 font-display text-[clamp(3rem,9vw,8rem)] leading-[0.86] tracking-[-0.02em]">
          <span className="text-gradient-green">{article.title}</span>
        </h1>

        <p className="mt-8 max-w-3xl text-xl leading-relaxed text-text">
          {article.excerpt}
        </p>

        {article.author && (
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
            By <span className="text-text">{article.author.name}</span>
            {article.author.tier && (
              <span className="text-voltra"> · {article.author.tier}</span>
            )}
          </p>
        )}

        {article.cover && (
          <div className="mt-12 relative aspect-[16/9] border border-border bg-surface">
            <Image
              src={article.cover}
              alt={article.title}
              fill
              sizes="(min-width: 1100px) 1100px, 100vw"
              className="object-contain p-12 drop-shadow-[0_0_50px_rgba(0,255,65,0.4)]"
              priority
            />
          </div>
        )}

        <div className="prose-voltra mt-12 max-w-3xl">
          {renderMarkdown(article.body)}
        </div>

        {tags.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
            {tags.map((t) => (
              <li key={t}>
                <Link
                  href={`/${locale}/search?q=${encodeURIComponent(t)}&type=articles`}
                  className="border border-border bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:border-voltra hover:text-voltra"
                >
                  #{t}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {related.length > 0 && (
          <section className="mt-20 border-t border-border pt-12">
            <h2 className="font-display text-3xl">
              <span className="text-voltra">§ More from</span>{" "}
              <span className="text-text">{article.category}</span>
            </h2>
            <ul className="mt-6 grid gap-px bg-border sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.id} className="bg-bg p-5">
                  <Link href={`/${locale}/articles/${r.slug}`} className="block">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                      {r.publishedAt?.toISOString().slice(0, 10) ?? "—"}
                    </div>
                    <h3 className="mt-2 font-display text-2xl leading-tight">{r.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-text-muted">{r.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <CommentBlock
          targetType="ARTICLE"
          targetId={article.id}
          redirectTo={`/${locale}/articles/${slug}`}
          locale={locale}
        />
      </article>
    </div>
  );
}
