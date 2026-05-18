import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { deleteAthlete } from "@/app/actions/admin";

export default async function AthletesPage() {
  const athletes = await prisma.athlete.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 01 / Athletes</span>
          <h1 className="mt-3 font-display text-5xl">Athlete Roster</h1>
          <p className="mt-2 text-sm text-text-muted">{athletes.length} total · {athletes.filter(a => a.active).length} active</p>
        </div>
        <Link
          href="/admin/athletes/new"
          className="clip-sharp inline-flex items-center gap-2 bg-voltra px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
        >
          + New Athlete
        </Link>
      </header>

      <table className="w-full border-collapse border border-border bg-surface font-mono text-xs">
        <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
          <tr>
            <th className="border-b border-border p-3">Name</th>
            <th className="border-b border-border p-3">Sport</th>
            <th className="border-b border-border p-3">Region</th>
            <th className="border-b border-border p-3">Country</th>
            <th className="border-b border-border p-3">Status</th>
            <th className="border-b border-border p-3"></th>
          </tr>
        </thead>
        <tbody>
          {athletes.map((a) => (
            <tr key={a.id} className="border-b border-border last:border-b-0 hover:bg-bg/60">
              <td className="p-3">
                <Link href={`/admin/athletes/${a.id}`} className="text-text hover:text-voltra">
                  {a.name}
                </Link>
              </td>
              <td className="p-3 text-text-muted">{a.sport}{a.discipline ? ` · ${a.discipline}` : ""}</td>
              <td className="p-3 text-text-muted">{a.region}</td>
              <td className="p-3 text-text-muted">{a.country}</td>
              <td className="p-3">
                <span className={a.active ? "text-voltra" : "text-text-dim"}>
                  {a.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="p-3 text-right">
                <DeleteButton id={a.id} action={deleteAthlete} label="Delete" />
              </td>
            </tr>
          ))}
          {athletes.length === 0 && (
            <tr><td colSpan={6} className="p-8 text-center text-text-dim">No athletes yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
