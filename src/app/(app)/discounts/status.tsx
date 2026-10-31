import type { Discount } from "@prisma/client";
import { Chip } from "@/components/ui/chip";
import { today } from "@/lib/dates";

export function DiscountStatus({ discount }: { discount: Discount }) {
  const now = today();
  if (!discount.isActive) return <Chip>Archived</Chip>;
  if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) return <Chip color="orange">Used up</Chip>;
  if (now > discount.endDate) return <Chip color="gray">Expired</Chip>;
  if (now < discount.startDate) return <Chip color="blue">Scheduled</Chip>;
  return <Chip color="green">Active</Chip>;
}
