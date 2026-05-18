import Image from "next/image";
import Link from "next/link";

import { formatMoney, getCart } from "@/lib/cart";
import { isStripeConfigured } from "@/lib/stripe";
import { removeFromCartAction, updateQuantityAction, clearCartAction } from "@/app/actions/cart";
import { isLocale, type Locale } from "@/lib/i18n/config";

export default async function CartPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const cart = await getCart();
  const stripeOn = isStripeConfigured();

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <Link href={`/${locale}/shop`} className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:text-voltra">
            ← Shop
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            Cart · <span className="text-voltra">{cart.itemCount}</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-12 lg:px-10 lg:py-20">
        <div className="grid items-end gap-6 border-b border-border pb-8 md:grid-cols-12">
          <div className="md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ Cart / 01</span>
          </div>
          <div className="md:col-span-10">
            <h1 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.85] tracking-[-0.02em]">
              Your <span className="text-gradient-green">cart.</span>
            </h1>
          </div>
        </div>

        {cart.lines.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-display text-5xl text-gradient-green">Empty.</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-text-muted">
              Nothing here yet. The shop is loud.
            </p>
            <Link
              href={`/${locale}/shop`}
              className="clip-sharp mt-8 inline-block bg-voltra px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid"
            >
              → Browse the Shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            <ul className="lg:col-span-8 divide-y divide-border border-y border-border">
              {cart.lines.map((line) => (
                <li key={line.productId} className="grid grid-cols-[80px_1fr_auto] items-center gap-6 py-6">
                  <div className="relative h-20 w-20 border border-border bg-surface">
                    <Image
                      src={line.product.imageUrl ?? "/logo.svg"}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div>
                    <Link href={`/${locale}/shop/${line.product.slug}`} className="font-display text-2xl hover:text-voltra">
                      {line.product.name}
                    </Link>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                      {formatMoney(line.product.priceCents, line.product.currency)} each
                    </p>
                    {line.oversold && (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-red-400">
                        Only {line.available} in stock — adjust quantity
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <form action={updateQuantityAction}>
                        <input type="hidden" name="productId" value={line.productId} />
                        <input
                          type="number"
                          name="quantity"
                          defaultValue={line.quantity}
                          min={1}
                          max={Math.min(line.available, 99)}
                          className="w-16 border border-border bg-bg px-2 py-1 font-mono text-xs text-text focus:border-voltra focus:outline-none"
                          onInput={undefined}
                        />
                        <button
                          type="submit"
                          className="ml-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted hover:text-voltra"
                        >
                          Update
                        </button>
                      </form>
                      <form action={removeFromCartAction}>
                        <input type="hidden" name="productId" value={line.productId} />
                        <button className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-red-400">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl text-gradient-green tabular">
                      {formatMoney(line.subtotalCents, line.product.currency)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start">
              <div className="clip-tag border border-border bg-surface p-6">
                <dl className="space-y-2 font-mono text-xs uppercase tracking-[0.18em]">
                  <Row label="Subtotal" value={formatMoney(cart.subtotalCents, cart.currency)} />
                  <Row label="Shipping" value="Calc'd at checkout" />
                  <Row label="Tax" value="Calc'd at checkout" />
                </dl>
                <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">Total</span>
                  <span className="font-display text-4xl text-gradient-green tabular">
                    {formatMoney(cart.subtotalCents, cart.currency)}
                  </span>
                </div>

                <form action="/api/checkout" method="POST" className="mt-6">
                  <button
                    type="submit"
                    disabled={cart.lines.some((l) => l.oversold)}
                    className="clip-sharp inline-flex w-full items-center justify-center gap-3 bg-voltra px-7 py-4 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {stripeOn ? "Checkout with Stripe →" : "Demo Checkout →"}
                  </button>
                  {!stripeOn && (
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
                      Stripe keys are blank — checkout will run in demo mode and immediately mark the order paid.
                    </p>
                  )}
                </form>

                <form action={clearCartAction} className="mt-3">
                  <button className="w-full font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim hover:text-red-400">
                    Empty cart
                  </button>
                </form>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-dim">{label}</dt>
      <dd className="text-text">{value}</dd>
    </div>
  );
}
