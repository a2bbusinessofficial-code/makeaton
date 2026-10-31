import Link from "next/link";
import { IconFileText } from "@tabler/icons-react";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTemplate } from "./actions";
import { TemplateForm } from "./template-form";

export const metadata = { title: "Quotation templates" };

export default async function TemplatesPage() {
  const user = await requireBackOffice();
  const [templates, plans, terms] = await Promise.all([
    db.quotationTemplate.findMany({ include: { plan: true, paymentTerm: true, _count: { select: { lines: true, subscriptions: true } } }, orderBy: { name: "asc" } }),
    db.plan.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    db.paymentTerm.findMany({ orderBy: { dueDays: "asc" } }),
  ]);

  return (
    <>
      <PageHeader icon={IconFileText} title="Quotation templates" />
      <PageBody>
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Template</th>
                <th>Plan</th>
                <th>Valid for</th>
                <th>Payment terms</th>
                <th>Lines</th>
                <th>Used</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link href={`/templates/${t.id}`} className="font-medium hover:text-accent">
                      {t.name}
                    </Link>
                  </td>
                  <td>{t.plan.name}</td>
                  <td>{t.validityDays} days</td>
                  <td>{t.paymentTerm?.name ?? "Default"}</td>
                  <td>{t._count.lines}</td>
                  <td>{t._count.subscriptions}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {user.role === "ADMIN" && (
          <Section title="New template" className="max-w-2xl">
            <TemplateForm action={createTemplate} plans={plans} terms={terms} />
          </Section>
        )}
      </PageBody>
    </>
  );
}
