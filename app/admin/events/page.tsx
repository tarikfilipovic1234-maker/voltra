import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { deleteEvent } from "@/app/actions/admin";

export default async function EventsPage() {
  const events = await prisma.event.findMany({ orderBy: { startsAt: "asc" } });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 05 / Events</span>
          <h1 className="mt-3 font-display text-5xl">Event Calendar</h1>
          <p className="mt-2 text-sm text-text-muted">{events.length} events scheduled</p>
        </div>
        <Link
          href="/admin/events/new"
          className="clip-sharp inline-flex items-center gap-2 bg-voltra px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
        >
          + New Event
        </Link>
      </header>

      <table className="w-full border-collapse border border-border bg-surface font-mono text-xs">
        <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
          <tr>
            <th className="border-b border-border p-3">Date</th>
            <th className="border-b border-border p-3">Title</th>
            <th className="border-b border-border p-3">Location</th>
            <th className="border-b border-border p-3">Region</th>
            <th className="border-b border-border p-3">Sport</th>
            <th className="border-b border-border p-3"></th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="border-b border-border last:border-b-0">
              <td className="p-3 text-text">{e.startsAt.toISOString().slice(0, 10)}</td>
              <td className="p-3">
                <Link href={`/admin/events/${e.id}`} className="text-text hover:text-voltra">
                  {e.title}
                </Link>
              </td>
              <td className="p-3 text-text-muted">{e.location}</td>
              <td className="p-3 text-text-muted">{e.region}</td>
              <td className="p-3 text-text-muted">{e.sport ?? "—"}</td>
              <td className="p-3 text-right"><DeleteButton id={e.id} action={deleteEvent} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
