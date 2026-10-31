import { IconUserCircle } from "@tabler/icons-react";
import { AccountSettings } from "@/components/account/account-settings";
import { PageBody, PageHeader } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireBackOffice();
  return (
    <>
      <PageHeader icon={IconUserCircle} title="Account" />
      <PageBody>
        <AccountSettings user={user} />
      </PageBody>
    </>
  );
}
