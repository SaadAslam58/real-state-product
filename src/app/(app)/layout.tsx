import { Spine, MobileTabBar, RoleSwitcher } from "@/components/spine/Spine";
import { getRole } from "@/lib/session";
import { getSession, getDashboardSummary, getAgency } from "@/lib/data";
import { Avatar } from "@/components/ui/Primitives";
import { PauseBanner } from "@/components/ui/Interactive";

/**
 * The app shell. Spine on the left (bottom tab bar on a phone), a thin top bar,
 * and the page. Only three things here are client components: the spine (needs
 * the current path), the tab bar, and the role switcher. Everything else renders
 * on the server.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getRole();
  const session = await getSession(role);

  // Badge counts live in the shell so they are visible from every screen — an
  // overdue handoff you can only see on the dashboard is an overdue handoff you
  // will miss.
  const [summary, agency] = await Promise.all([
    getDashboardSummary(session).catch(() => null),
    getAgency().catch(() => null),
  ]);

  return (
    <div className="flex min-h-screen">
      <Spine
        role={role}
        overdueCount={summary?.overdueHandoffs ?? 0}
        pendingCorrections={summary?.pendingCorrections ?? 0}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 shrink-0 flex items-center justify-end gap-3 px-4 sm:px-6 border-b border-hairline bg-canvas/85 backdrop-blur-sm sticky top-0 z-30">
          <RoleSwitcher role={role} />
          <div className="flex items-center gap-2.5 pl-3 border-l border-hairline">
            <Avatar name={session.agent.name} size={28} />
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-semibold text-ink">{session.agent.name}</p>
              <p className="text-2xs text-muted capitalize">{session.agent.role}</p>
            </div>
          </div>
        </header>

        {agency?.aiPaused ? <PauseBanner /> : null}

        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 md:pb-8 min-w-0">
          {children}
        </main>
      </div>

      <MobileTabBar
        role={role}
        overdueCount={summary?.overdueHandoffs ?? 0}
        pendingCorrections={summary?.pendingCorrections ?? 0}
      />
    </div>
  );
}
