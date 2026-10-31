import { NavigationProgress } from "@/components/layout/navigation-progress";
import { Sidebar } from "@/components/layout/sidebar";
import { requireBackOffice } from "@/lib/auth";

/** Back office shell for admins and staff (customers are redirected to the portal). */
export default async function BackOfficeLayout({ children }: { children: React.ReactNode }) {
  const user = await requireBackOffice();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <NavigationProgress />
      <Sidebar name={user.fullName} role={user.role as "ADMIN" | "STAFF"} />
      <main className="min-w-0 flex-1 md:py-2 md:pr-2">
        <div className="min-h-full rounded-lg border border-line bg-white md:min-h-[calc(100vh-1rem)]">{children}</div>
      </main>
    </div>
  );
}
