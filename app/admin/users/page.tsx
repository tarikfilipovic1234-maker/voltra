import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { UserRoleSelect } from "@/app/components/admin/UserRoleSelect";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ newsletter?: string }>;
}) {
  await requireRole("ADMIN");
  const sp = await searchParams;
  const onlyNewsletter = sp.newsletter === "true";

  const users = await prisma.user.findMany({
    where: onlyNewsletter ? { newsletter: true } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-10">
      <header className="border-b border-border pb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 06 / Users</span>
        <h1 className="mt-3 font-display text-5xl">Community</h1>
        <p className="mt-2 text-sm text-text-muted">
          {users.length} {onlyNewsletter ? "newsletter subscribers" : "members"} · Admin role required to view.
        </p>
      </header>

      <table className="w-full border-collapse border border-border bg-surface font-mono text-xs">
        <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
          <tr>
            <th className="border-b border-border p-3">Name / Email</th>
            <th className="border-b border-border p-3">Role</th>
            <th className="border-b border-border p-3">Tier</th>
            <th className="border-b border-border p-3">Region</th>
            <th className="border-b border-border p-3">Points</th>
            <th className="border-b border-border p-3">News</th>
            <th className="border-b border-border p-3">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border last:border-b-0">
              <td className="p-3">
                <div className="text-text">{u.name ?? "—"}</div>
                <div className="text-text-dim normal-case tracking-normal">{u.email}</div>
              </td>
              <td className="p-3"><UserRoleSelect id={u.id} role={u.role} /></td>
              <td className="p-3 text-voltra">{u.tier}</td>
              <td className="p-3 text-text-muted">{u.region}</td>
              <td className="p-3 text-text tabular">{u.rewardPoints.toLocaleString()}</td>
              <td className="p-3">
                <span className={u.newsletter ? "text-voltra" : "text-text-dim"}>
                  {u.newsletter ? "Yes" : "—"}
                </span>
              </td>
              <td className="p-3 text-text-dim">{u.createdAt.toISOString().slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
