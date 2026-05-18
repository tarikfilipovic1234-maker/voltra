import Image from "next/image";
import type { Product } from "@prisma/client";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Track } from "./Track";

type Props = {
  dict: Dictionary;
  products: Product[];
  region: string;
};

export function ProductLineup({ dict, products, region }: Props) {
  return (
    <section id="products" className="relative border-b border-border bg-bg py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-border pb-10 md:grid-cols-12">
          <div className="md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">
              {dict.lineup.section}
            </span>
          </div>
          <div className="md:col-span-7">
            <h2 className="font-display text-5xl leading-[0.9] tracking-[-0.01em] sm:text-7xl">
              <span className="text-gradient-green">{dict.lineup.title}</span>
              <br />
              <span className="text-text-muted">{dict.lineup.subtitle}</span>
            </h2>
          </div>
          <div className="md:col-span-3 md:text-right">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-dim">
              Region · {region} · {products.length} active
            </span>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="py-24 text-center font-mono text-sm uppercase tracking-[0.22em] text-text-muted">
            No products live in your region yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3 mt-px">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                p={p}
                index={i}
                total={products.length}
                caffeineLabel={dict.hero.caffeine}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ProductCard({
  p,
  index,
  total,
  caffeineLabel,
}: {
  p: Product;
  index: number;
  total: number;
  caffeineLabel: string;
}) {
  return (
    <li className="group relative isolate overflow-hidden bg-bg p-8 transition-colors hover:bg-surface">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-dim">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        {p.badge && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: p.accentColor }}
          >
            {p.badge}
          </span>
        )}
      </div>

      <div className="relative my-10 grid h-56 place-items-center">
        <div
          className="absolute inset-x-1/4 inset-y-0 blur-3xl opacity-30 transition-opacity group-hover:opacity-70"
          style={{ background: p.accentColor }}
        />
        <Image
          src="/logo.svg"
          alt=""
          width={220}
          height={220}
          className="relative h-44 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,255,65,0.45)] transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-[-3deg]"
        />
        <div
          className="absolute -bottom-1 left-1/2 h-6 w-32 -translate-x-1/2 rounded-[50%] opacity-40 blur-md"
          style={{ background: p.accentColor }}
        />
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-4xl leading-none tracking-[-0.01em]">
          {p.name}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
          {p.code}
        </span>
      </div>
      <div
        className="mt-2 h-px w-full transition-all group-hover:h-[2px]"
        style={{
          background: `linear-gradient(90deg, ${p.accentColor}, transparent)`,
        }}
      />
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
        {p.description}
      </p>

      <dl className="mt-6 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
        <div>
          <dt>Flavor</dt>
          <dd className="mt-1 text-text">{p.flavor}</dd>
        </div>
        <div>
          <dt>{caffeineLabel}</dt>
          <dd className="mt-1 text-voltra">{p.caffeineMg}mg</dd>
        </div>
        {p.juicePct > 0 && (
          <div>
            <dt>Juice</dt>
            <dd className="mt-1 text-text">{p.juicePct}%</dd>
          </div>
        )}
      </dl>

      {/* Click tracking overlay — covers the whole card with cursor-pointer */}
      <Track
        kind="FLAVOR_CLICK"
        productId={p.id}
        value={p.flavor}
        className="absolute inset-0 z-10 block cursor-pointer"
      >
        <span className="sr-only">Tap to view {p.name}</span>
      </Track>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <span
          className="block h-px w-1/3 -translate-x-full opacity-0 transition-all duration-700 group-hover:translate-x-[300%] group-hover:opacity-100"
          style={{ background: p.accentColor }}
        />
      </span>
    </li>
  );
}
