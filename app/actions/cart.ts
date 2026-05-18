"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { addToCart, removeFromCart, updateQuantity, clearCart } from "@/lib/cart";

const ProductIdSchema = z.string().min(1).max(40);

export async function addToCartAction(formData: FormData) {
  const productId = ProductIdSchema.parse(formData.get("productId"));
  const quantity = Math.max(
    1,
    Math.min(99, parseInt(String(formData.get("quantity") ?? "1"), 10) || 1)
  );
  await addToCart(productId, quantity);
  revalidatePath("/cart");
  revalidatePath("/shop");
  redirect((formData.get("redirectTo") as string) || "/cart");
}

export async function updateQuantityAction(formData: FormData) {
  const productId = ProductIdSchema.parse(formData.get("productId"));
  const quantity = parseInt(String(formData.get("quantity") ?? "1"), 10) || 0;
  await updateQuantity(productId, Math.max(0, Math.min(99, quantity)));
  revalidatePath("/cart");
}

export async function removeFromCartAction(formData: FormData) {
  const productId = ProductIdSchema.parse(formData.get("productId"));
  await removeFromCart(productId);
  revalidatePath("/cart");
}

export async function clearCartAction() {
  await clearCart();
  revalidatePath("/cart");
}
