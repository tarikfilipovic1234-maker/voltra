import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { addToCartAction } from "@/app/actions/cart";
import { formatMoney } from "@/lib/cart";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { trackPageView } from "@/lib/analytics";
import { auth } from "@/lib/auth";
import { ReviewBlock } from "@/app/components/community/ReviewBlock";

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";

  const [product, session] = await Promise.all([
    prisma.merchProduct.findUnique({ where: { slug } }),
    auth(),
  ]);
  if (!product || !product.active) notFound();
  void trackPageView({ path: `/${lang}/shop/${slug}`, userId: session?.user?.id });

  const available = Math.max(0, product.stock - product.reserved);
  const soldOut = available <= 0;

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href={`/${locale}/shop`} className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:text-voltra">
            ← Shop
          </Link>
          <Link href={`/${locale}/cart`} className="clip-tag border border-border bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:border-voltra hover:text-voltra">
            Cart
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10 lg:py-20">
        <div className="grid gap-16 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              {product.category} · {product.featured && "Featured"}
            </span>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,6rem)] leading-[0.85] tracking-[-0.02em]">
              {product.name}
            </h1>
            <div className="relative mt-10 isolate aspect-square border border-border bg-surface">
              <div className="absolute inset-1/4 blur-3xl opacity-30 bg-voltra" />
              <Image
                src={product.imageUrl ?? "/logo.svg"}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-contain p-16 drop-shadow-[0_0_50px_rgba(0,255,65,0.55)]"
              />
            </div>
          </section>

          <aside className="lg:col-span-5">
            <p className="text-base leading-relaxed text-text-muted sm:text-lg">{product.description}</p>

            <div className="mt-10 clip-tag border border-border bg-surface p-8">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Price</div>
                  <div className="font-display text-5xl text-gradient-green tabular">
                    {formatMoney(product.priceCents, product.currency)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Available</div>
                  <div className={`font-display text-4xl tabular ${soldOut ? "text-red-400" : "text-text"}`}>
                    {available}
                  </div>
                </div>
              </div>

              {soldOut ? (
                <div className="mt-6 clip-tag border border-red-500/40 bg-red-500/10 p-4 font-mono text-[11px] uppercase tracking-[0.18em] text-red-300">
                  Sold out. Sign up for the newsletter to hear about restock.
                </div>
              ) : (
                <form action={addToCartAction} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="redirectTo" value={`/${locale}/cart`} />
                  <label className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Qty</span>
                    <input
                      type="number"
                      name="quantity"
                      defaultValue={1}
                      min={1}
                      max={Math.min(available, 99)}
                      className="mt-2 block w-24 border border-border bg-bg px-3 py-2.5 font-mono text-base text-text focus:border-voltra focus:outline-none"
                    />
                  </label>
                  <button
                    type="submit"
                    className="clip-sharp w-full sm:flex-1 inline-flex items-center justify-center gap-3 bg-voltra px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
                  >
                    Add to Cart →
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              <div className="border border-border p-3">
                <div className="text-text-dim">Ships</div>
                <div className="mt-1 text-text">2-5 business days · Worldwide</div>
              </div>
              <div className="border border-border p-3">
                <div className="text-text-dim">Returns</div>
                <div className="mt-1 text-text">30 days · Free in the US</div>
              </div>
            </div>
          </aside>
        </div>

        <ReviewBlock
          targetType="PRODUCT"
          targetId={product.id}
          redirectTo={`/${locale}/shop/${slug}`}
          locale={locale}
        />
      </main>
    </div>
  );
}
