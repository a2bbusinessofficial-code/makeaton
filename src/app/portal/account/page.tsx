import { AccountSettings } from "@/components/account/account-settings";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Account" };

export default async function PortalAccountPage() {
  const user = await requireRole("CUSTOMER");
  return (
    <>
      <h1 className="text-lg font-semibold">Account</h1>
      <AccountSettings user={user} />
    </>
  );
}
