import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { deleteStream } from "@/app/actions/admin-loyalty";

export default async function StreamsAdminPage() {
  const streams = await prisma.stream.findMany({
    orderBy: [{ live: "desc" }, { featured: "desc" }],
  });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 11 / Streams</span>
          <h1 className="mt-3 font-display text-5xl">Tracked Channels</h1>
          <p className="mt-2 text-sm text-text-muted">
            Polled every 60s from Twitch / YouTube / Kick. {streams.filter((s) => s.live).length} live now.
          </p>
        </div>
        <Link href="/admin/streams/new" className="clip-sharp inline-flex items-center gap-2 bg-voltra px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black hover:bg-voltra-acid">
          + Track Channel
        </Link>
      </header>

      <table className="w-full border-collapse border border-border bg-surface font-mono text-xs">
        <thead className="bg-bg text-left uppercase tracking-[0.18em] text-text-dim">
          <tr>
            <th className="border-b border-border p-3">Platform</th>
            <th className="border-b border-border p-3">Channel</th>
            <th className="border-b border-border p-3">Status</th>
            <th className="border-b border-border p-3">Title / Game</th>
            <th className="border-b border-border p-3">Viewers</th>
            <th className="border-b border-border p-3">Last Check</th>
            <th className="border-b border-border p-3"></th>
          </tr>
        </thead>
        <tbody>
          {streams.map((s) => (
            <tr key={s.id} className="border-b border-border last:border-b-0">
              <td className="p-3 text-text-muted">{s.platform}</td>
              <td className="p-3">
                <Link href={`/admin/streams/${s.id}`} className="text-text hover:text-voltra">
                  {s.displayName}
                </Link>
                <p className="mt-1 text-text-dim normal-case tracking-normal">{s.channel}</p>
              </td>
              <td className="p-3">
                {s.live ? (
                  <span className="text-voltra">● LIVE</span>
                ) : (
                  <span className="text-text-dim">offline</span>
                )}
              </td>
              <td className="p-3 text-text-muted normal-case tracking-normal">
                {s.live ? s.title ?? "—" : "—"}
                {s.game && <span className="text-text-dim"> · {s.game}</span>}
              </td>
              <td className="p-3 text-text tabular">{s.viewerCount.toLocaleString()}</td>
              <td className="p-3 text-text-dim">{s.lastChecked ? s.lastChecked.toISOString().slice(11, 19) : "never"}</td>
              <td className="p-3 text-right"><DeleteButton id={s.id} action={deleteStream} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
