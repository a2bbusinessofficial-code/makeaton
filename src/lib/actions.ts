import "server-only";
import { unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import type { ActionState } from "@/components/ui/action-form";
import { BillingError } from "@/domain/billing";
import { DomainError } from "@/domain/subscriptions";

/**
 * Runs a server action body and converts expected failures (validation, business rules,
 * unique constraints) into a friendly message. Unexpected errors are logged, not leaked.
 */
export async function runAction(fn: () => Promise<string | void>, revalidate?: string | string[]): Promise<ActionState> {
  try {
    const message = await fn();
    for (const path of [revalidate ?? []].flat()) revalidatePath(path);
    return { success: message || "Saved" };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof DomainError || error instanceof BillingError) return { error: error.message };
    if (error instanceof ZodError) return { error: error.issues[0]?.message ?? "Invalid input" };
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "A record with these details already exists." };
    console.error("[action] unexpected error", error);
    return { error: "Something went wrong. Please try again." };
  }
}
