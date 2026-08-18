"use client";

import { AdminHeader, AdminTable, Panel, Td } from "@/components/admin/AdminUi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { ADMIN_ROLES } from "@/lib/admin";
import { CITIES } from "@/lib/constants";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { useMemo, useState } from "react";

export default function AdminUsersPage() {
  const {
    users,
    currentUser,
    adminCreateUser,
    adminUpdateUser,
    adminSetSuspended,
  } = useStore();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Toronto",
    roles: ["buyer"] as Role[],
  });

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      const hay = `${u.name} ${u.email} ${u.city} ${u.roles.join(" ")}`.toLowerCase();
      if (query && !hay.includes(query)) return false;
      if (role !== "all" && !u.roles.includes(role)) return false;
      return true;
    });
  }, [users, q, role]);

  function toggleRole(id: string, r: Role, current: Role[]) {
    const next = current.includes(r)
      ? current.filter((x) => x !== r)
      : [...current, r];
    if (!next.length) return;
    adminUpdateUser(id, { roles: next });
  }

  function create(e: React.FormEvent) {
    e.preventDefault();
    const res = adminCreateUser(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError("");
    setForm({
      name: "",
      email: "",
      phone: "",
      city: "Toronto",
      roles: ["buyer"],
    });
  }

  return (
    <div>
      <AdminHeader
        eyebrow="Directory"
        title="People"
        body="Roles, city, suspend, or add a demo person."
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <Panel
          title={`${rows.length} accounts`}
          action={
            <div className="flex gap-2">
              <Input
                compact
                placeholder="Search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-44"
              />
              <Select
                compact
                value={role}
                onChange={(e) => setRole(e.target.value as "all" | Role)}
                className="w-28"
              >
                <option value="all">All roles</option>
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
          }
        >
          <AdminTable columns={["Person", "Roles", "City", ""]}>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-line/70 last:border-0">
                <Td>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-ink-soft">{u.email}</p>
                  {u.suspended ? (
                    <Badge tone="cream" className="mt-1">
                      Suspended
                    </Badge>
                  ) : null}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {ADMIN_ROLES.map((r) => {
                      const on = u.roles.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleRole(u.id, r, u.roles)}
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            on
                              ? "bg-forest text-cream"
                              : "bg-sage text-ink-soft"
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </Td>
                <Td>
                  <Select
                    compact
                    value={u.city}
                    onChange={(e) =>
                      adminUpdateUser(u.id, { city: e.target.value })
                    }
                    className="w-32"
                  >
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  {u.id === currentUser?.id ? (
                    <span className="text-xs text-ink-soft">You</span>
                  ) : (
                    <Button
                      size="sm"
                      variant={u.suspended ? "outline" : "danger"}
                      className="h-8"
                      onClick={() => adminSetSuspended(u.id, !u.suspended)}
                    >
                      {u.suspended ? "Restore" : "Suspend"}
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
          </AdminTable>
        </Panel>

        <Panel title="Add a person">
          <form onSubmit={create} className="space-y-2.5">
            <Field label="Name">
              <Input
                compact
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </Field>
            <Field label="Email">
              <Input
                compact
                type="text"
                inputMode="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </Field>
            <Field label="Phone">
              <Input
                compact
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </Field>
            <Field label="City">
              <Select
                compact
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
              >
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Roles" hint="Password starts as demo123">
              <div className="flex flex-wrap gap-1">
                {ADMIN_ROLES.map((r) => {
                  const on = form.roles.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          roles: on
                            ? f.roles.filter((x) => x !== r)
                            : [...f.roles, r],
                        }))
                      }
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        on ? "bg-forest text-cream" : "bg-sage text-ink-soft"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </Field>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" size="sm" className="w-full">
              Create account
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
