import "server-only";
import type { Prisma } from "@prisma/client";
import { db, type Tx } from "@/lib/db";
import { DomainError } from "./subscriptions";

/**
 * Builds a subscription line. The plan's own product is priced at the plan price; other
 * products (add-ons) at their sales price. A variant adds its price extra on top.
 */
export async function buildLine(
  plan: { productId: string; price: number },
  input: { productId: string; variantId?: string | null; quantity: number },
  tx: Tx | typeof db = db,
): Promise<Omit<Prisma.SubscriptionLineCreateManyInput, "subscriptionId"> & { taxIds: string[] }> {
  const product = await tx.product.findUnique({ where: { id: input.productId }, include: { taxes: { where: { isActive: true } } } });
  if (!product || !product.isActive) throw new DomainError("That product is not available.");
  const variant = input.variantId ? await tx.productVariant.findUnique({ where: { id: input.variantId } }) : null;
  if (variant && variant.productId !== product.id) throw new DomainError("That variant belongs to another product.");
  if (input.quantity < 1) throw new DomainError("Quantity must be at least 1.");

  const base = product.id === plan.productId ? plan.price : product.salesPrice;
  return {
    productId: product.id,
    variantId: variant?.id ?? null,
    description: variant ? `${product.name} (${variant.attribute}: ${variant.value})` : product.name,
    quantity: input.quantity,
    unitPrice: base + (variant?.priceExtra ?? 0),
    taxIds: product.taxes.map((t) => t.id),
  };
}

export async function createLine(subscriptionId: string, line: Awaited<ReturnType<typeof buildLine>>, tx: Tx | typeof db = db) {
  const { taxIds, ...data } = line;
  return tx.subscriptionLine.create({ data: { ...data, subscriptionId, taxes: { connect: taxIds.map((id) => ({ id })) } } });
}
