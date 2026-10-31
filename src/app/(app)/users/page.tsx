import { IconUsers } from "@tabler/icons-react";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Chip } from "@/components/ui/chip";
import { Field, FormGrid, Input } from "@/components/ui/form";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { inviteStaff, toggleUserActive } from "./actions";

export const metadata = { title: "Team" };

export default async function UsersPage() {
  const me = await requireAdmin();
  const [team, customerLogins] = await Promise.all([
    db.profile.findMany({ where: { role: { in: ["ADMIN", "STAFF"] } }, orderBy: [{ role: "asc" }, { fullName: "asc" }] }),
    db.profile.count({ where: { role: "CUSTOMER" } }),
  ]);

  return (
    <>
      <PageHeader icon={IconUsers} title="Team" />
      <PageBody>
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Since</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {team.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.fullName}</td>
                  <td className="text-ink-2">{u.email}</td>
                  <td>{u.role === "ADMIN" ? <Chip color="purple">Admin</Chip> : <Chip color="blue">Staff</Chip>}</td>
                  <td className="text-ink-3">{formatDate(u.createdAt)}</td>
                  <td>{u.isActive ? <Chip color="green">Active</Chip> : <Chip color="red">Deactivated</Chip>}</td>
                  <td className="text-right">
                    {u.id !== me.id && u.role === "STAFF" && (
                      <ActionButton action={toggleUserActive} fields={{ id: u.id }} variant="ghost" confirm={u.isActive ? `Deactivate ${u.fullName}?` : undefined}>
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-ink-3">{customerLogins.toLocaleString("en-IN")} customers have portal logins. Customers sign up themselves; only admins can add staff.</p>
        <Section title="Invite a staff member" className="max-w-xl">
          <p className="mb-3 text-ink-2">Staff handle customers, quotations, invoices and payments, but cannot change products, plans, taxes, discounts or the team.</p>
          <ActionForm action={inviteStaff} resetOnSuccess>
            <FormGrid>
              <Field label="Full name">
                <Input name="fullName" required />
              </Field>
              <Field label="Email">
                <Input name="email" type="email" required />
              </Field>
            </FormGrid>
            <SubmitButton pendingLabel="Sending invite…">Send invitation</SubmitButton>
          </ActionForm>
        </Section>
      </PageBody>
    </>
  );
}
