import Image from "next/image";
import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { signOutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", code: "00", group: "Overview" },
  { href: "/admin/analytics", label: "Analytics", code: "01", group: "Overview" },

  { href: "/admin/athletes", label: "Athletes", code: "02", group: "Content" },
  { href: "/admin/products", label: "Products", code: "03", group: "Content" },
  { href: "/admin/videos", label: "Videos", code: "04", group: "Content" },
  { href: "/admin/articles", label: "Articles", code: "05", group: "Content" },
  { href: "/admin/events", label: "Events", code: "06", group: "Content" },
  { href: "/admin/streams", label: "Streams", code: "07", group: "Content" },

  { href: "/admin/promo-codes", label: "Promo Codes", code: "08", group: "Commerce" },
  { href: "/admin/rewards", label: "Rewards", code: "09", group: "Commerce" },
  { href: "/admin/merch", label: "Merch", code: "10", group: "Commerce" },
  { href: "/admin/orders", label: "Orders", code: "11", group: "Commerce" },

  { href: "/admin/users", label: "Users", code: "12", group: "Community" },
  { href: "/admin/reviews", label: "Reviews", code: "13", group: "Community" },
  { href: "/admin/comments", label: "Comments", code: "14", group: "Community" },
  { href: "/admin/reports", label: "Reports", code: "15", group: "Community" },
];

const NAV_GROUPS = ["Overview", "Content", "Commerce", "Community"] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("EDITOR");

  return (
    <div className="relative min-h-screen bg-bg">
      <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 lg:px-10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.svg"
                alt=""
                fill
                sizes="32px"
                className="object-contain drop-shadow-[0_0_10px_rgba(0,255,65,0.55)]"
              />
            </div>
            <span className="font-display text-xl tracking-[-0.01em]">
              VOLTRA<span className="text-voltra">.Console</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim transition-colors hover:text-voltra"
            >
              ← Front of House
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {session.user.name ?? session.user.email}{" "}
              <span className="text-voltra">· {session.user.role}</span>
            </span>
            <form action={signOutAction}>
              <button className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim transition-colors hover:text-voltra">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-px bg-border lg:grid-cols-[240px_1fr]">
        <aside className="bg-bg p-6 lg:min-h-[calc(100vh-64px)]">
          {NAV_GROUPS.map((group) => (
            <div key={group} className="mb-6">
              <div className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.32em] text-text-dim">
                {group}
              </div>
              <ul className="space-y-1">
                {NAV.filter((n) => n.group === group).map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className="group flex items-center justify-between border border-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:border-border hover:bg-surface hover:text-text"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-voltra/70 group-hover:text-voltra">{n.code}</span>
                        {n.label}
                      </span>
                      <span aria-hidden className="text-text-dim group-hover:text-voltra">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-10 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-text-dim">
            <p>Build · VOLTRA CMS v1</p>
            <p className="mt-2">All edits hot-publish to the live site.</p>
          </div>
        </aside>

        <main className="bg-bg p-8 lg:p-12">{children}</main>
      </div>
    </div>
  );
}
