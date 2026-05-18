import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/app/components/admin/DeleteButton";
import { deleteVideo } from "@/app/actions/admin";

export default async function VideosPage() {
  const videos = await prisma.video.findMany({
    orderBy: { publishedAt: "desc" },
    include: { athlete: true },
  });

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-voltra">§ 03 / Videos</span>
          <h1 className="mt-3 font-display text-5xl">Video Archive</h1>
          <p className="mt-2 text-sm text-text-muted">{videos.length} videos</p>
        </div>
        <Link
          href="/admin/videos/new"
          className="clip-sharp inline-flex items-center gap-2 bg-voltra px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-black transition-transform hover:-translate-y-[1px] hover:bg-voltra-acid"
        >
          + Upload Video
        </Link>
      </header>

      <ul className="grid gap-px bg-border lg:grid-cols-2">
        {videos.map((v) => (
          <li key={v.id} className="bg-bg p-6">
            <div className="flex items-start justify-between">
              <Link href={`/admin/videos/${v.id}`}>
                <h2 className="font-display text-2xl">{v.title}</h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  {v.sport ?? "—"} · {v.region ?? "GLOBAL"} {v.athlete && `· ${v.athlete.name}`}
                </p>
              </Link>
              <DeleteButton id={v.id} action={deleteVideo} />
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-text-muted">{v.description}</p>
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.22em] text-voltra hover:underline"
            >
              Open embed →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
