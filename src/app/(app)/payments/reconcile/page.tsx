import { IconBuildingBank } from "@tabler/icons-react";
import { PageBody, PageHeader } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { ReconcileClient } from "./reconcile-client";

export const metadata = { title: "Bank reconciliation" };

/** Replaces "matching payments by scrolling through bank statements". */
export default async function ReconcilePage() {
  await requireBackOffice();
  return (
    <>
      <PageHeader icon={IconBuildingBank} crumbs={[{ label: "Payments", href: "/payments" }]} title="Bank reconciliation" />
      <PageBody>
        <p className="max-w-2xl text-ink-2">
          Upload your bank statement as CSV. Each credit is matched to an outstanding invoice: by invoice number in the narration, by amount and customer name, or by a unique amount. Review the
          suggestions and record them all in one click.
        </p>
        <ReconcileClient />
      </PageBody>
    </>
  );
}
