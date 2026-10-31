import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { IconUsersGroup } from "@tabler/icons-react";
import { Chip } from "@/components/ui/chip";
import { FilterBar } from "@/components/ui/filter-bar";
import { Field, Input } from "@/components/ui/form";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { PAGE_SIZE, Pagination, pageFrom } from "@/components/ui/pagination";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCustomer } from "./actions";
import { CustomerForm } from "./customer-form";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireBackOffice();
  const params = await searchParams;
  const page = pageFrom(params.page);
  const q = params.q?.trim();
  const where: Prisma.CustomerWhereInput = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] }
    : {};

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      include: { _count: { select: { subscriptions: { where: { state: "ACTIVE" } } } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.customer.count({ where }),
  ]);

  return (
    <>
      <PageHeader icon={IconUsersGroup} title="Customers" />
      <PageBody>
        <div className="card overflow-hidden">
          <FilterBar resetHref="/customers">
            <Field label="Search" className="w-72">
              <Input name="q" defaultValue={q} placeholder="Name, email or company" />
            </Field>
          </FilterBar>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>State</th>
                  <th>Active subscriptions</th>
                  <th>Portal</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/customers/${c.id}`} className="font-medium hover:text-accent">
                        {c.name}
                      </Link>
                    </td>
                    <td>{c.company ?? "—"}</td>
                    <td className="text-ink-2">{c.email}</td>
                    <td>{c.state ?? "—"}</td>
                    <td>{c._count.subscriptions}</td>
                    <td>{c.profileId ? <Chip color="green">Has login</Chip> : <Chip>No login</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} params={{ q }} basePath="/customers" />
        </div>
        <Section title="New customer" className="max-w-2xl">
          <CustomerForm action={createCustomer} />
        </Section>
      </PageBody>
    </>
  );
}
