import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { MerchProduct } from "@prisma/client";

const COOKIE = "voltra.cart";
const COOKIE_OPTS = {
  path: "/",
  sameSite: "lax" as const,
  httpOnly: false,
  maxAge: 60 * 60 * 24 * 30,
};

export type CartItem = { productId: string; quantity: number };
export type CartLine = {
  productId: string;
  quantity: number;
  product: MerchProduct;
  subtotalCents: number;
  available: number;
  oversold: boolean;
};
export type Cart = {
  items: CartItem[];
  lines: CartLine[];
  subtotalCents: number;
  itemCount: number;
  currency: string;
};

function parse(raw: string | undefined): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.productId === "string" && Number.isFinite(x.quantity))
      .map((x) => ({
        productId: String(x.productId),
        quantity: Math.max(1, Math.min(99, Math.floor(x.quantity))),
      }));
  } catch {
    return [];
  }
}

export async function readCartItems(): Promise<CartItem[]> {
  const c = await cookies();
  return parse(c.get(COOKIE)?.value);
}

async function writeCartItems(items: CartItem[]) {
  const c = await cookies();
  if (items.length === 0) {
    c.delete(COOKIE);
  } else {
    c.set(COOKIE, JSON.stringify(items), COOKIE_OPTS);
  }
}

export async function getCart(): Promise<Cart> {
  const items = await readCartItems();
  if (items.length === 0) {
    return { items: [], lines: [], subtotalCents: 0, itemCount: 0, currency: "USD" };
  }
  const products = await prisma.merchProduct.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const lines: CartLine[] = [];
  let subtotalCents = 0;
  for (const i of items) {
    const product = productMap.get(i.productId);
    if (!product) continue; // dropped from catalog
    const available = Math.max(0, product.stock - product.reserved);
    lines.push({
      productId: i.productId,
      quantity: i.quantity,
      product,
      subtotalCents: product.priceCents * i.quantity,
      available,
      oversold: i.quantity > available,
    });
    subtotalCents += product.priceCents * i.quantity;
  }
  const currency = lines[0]?.product.currency ?? "USD";
  return {
    items,
    lines,
    subtotalCents,
    itemCount: lines.reduce((a, l) => a + l.quantity, 0),
    currency,
  };
}

export async function addToCart(productId: string, quantity = 1) {
  const items = await readCartItems();
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity);
  } else {
    items.push({ productId, quantity: Math.max(1, Math.min(99, quantity)) });
  }
  await writeCartItems(items);
}

export async function updateQuantity(productId: string, quantity: number) {
  const items = await readCartItems();
  const next = items
    .map((i) => (i.productId === productId ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0);
  await writeCartItems(next);
}

export async function removeFromCart(productId: string) {
  const items = await readCartItems();
  await writeCartItems(items.filter((i) => i.productId !== productId));
}

export async function clearCart() {
  await writeCartItems([]);
}

export function formatMoney(cents: number, currency: string = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(0)}`;
  }
}
