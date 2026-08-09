import type { Metadata } from "next";
import { getRole } from "@/lib/session";
import { getAgentStats, getTeam } from "@/lib/data";
import { parseScenario } from "@/lib/data/scenarios";
import {
  Avatar,
  Card,
  EmptyState,
  ErrorSurface,
  Mono,
  Table,
  TableShell,
  Td,
  Th,
  CardList,
} from "@/components/ui/Primitives";
import { AddAgentButton, RemoveAgentButton } from "./TeamControls";
import { formatPhone } from "@/lib/format";
import { isDataError } from "@/lib/types";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const scenario = parseScenario(sp.scenario);
  const role = await getRole();

  if (role !== "owner") {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <EmptyState
            variant="not-authorized"
            title="Only the agency owner manages the team"
            body="Ask your owner if someone needs adding or removing."
          />
        </Card>
      </div>
    );
  }

  let team, stats;
  try {
    [team, stats] = await Promise.all([getTeam(scenario), getAgentStats(scenario)]);
  } catch (e) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <ErrorSurface
            title="Couldn't load your team"
            body={isDataError(e) ? e.message : "Something went wrong on our side."}
            retryHref="/team"
          />
        </Card>
      </div>
    );
  }

  const statFor = (id: string) => stats.find((s) => s.agentId === id);
  const activeCount = team.filter((a) => a.active).length;

  return (
    <div className="max-w-[880px] mx-auto flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="t-eyebrow mb-1.5">Who leads get assigned to</p>
          <h1 className="t-display text-xl text-ink">Team</h1>
        </div>
        <AddAgentButton />
      </div>

      <p className="text-sm text-muted max-w-[62ch] leading-relaxed">
        New leads are shared out round-robin across active agents. Anyone can be
        reassigned by hand from the leads table. Making someone inactive keeps their
        history but takes them out of the rotation.
      </p>

      {team.length <= 1 ? (
        <Card>
          <EmptyState
            variant="no-data"
            title="It's just you so far"
            body="Add your agents so incoming leads have someone to go to from day one."
            action={<AddAgentButton />}
            icon={
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="9" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            }
          />
        </Card>
      ) : (
        <TableShell>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Contact</Th>
                <Th align="right">Assigned</Th>
                <Th align="right">Avg reply</Th>
                <Th align="right" />
              </tr>
            </thead>
            <tbody>
              {team.map((a) => {
                const s = statFor(a.id);
                return (
                  <tr
                    key={a.id}
                    className="border-b border-hairline last:border-0 hover:bg-sunk/60 transition-colors"
                  >
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={a.name} size={30} />
                        <span className="min-w-0">
                          <span className="block font-semibold text-ink truncate-1">
                            {a.name}
                          </span>
                          {!a.active ? (
                            <span className="text-2xs text-muted">
                              Inactive — not in rotation
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs capitalize">{a.role}</span>
                    </Td>
                    <Td>
                      <span className="block text-xs truncate-1 max-w-[24ch]">{a.email}</span>
                      <Mono>{formatPhone(a.phone)}</Mono>
                    </Td>
                    <Td align="right">{s?.assignedCount ?? 0}</Td>
                    <Td align="right">
                      <span className="t-mono text-sm text-ink">
                        {s?.avgResponseMinutes == null ? "—" : `${s.avgResponseMinutes}m`}
                      </span>
                    </Td>
                    <Td align="right">
                      {a.role === "owner" ? (
                        <span className="text-xs text-muted">Owner</span>
                      ) : (
                        <RemoveAgentButton
                          id={a.id}
                          name={a.name}
                          assigned={s?.assignedCount ?? 0}
                          lastActive={activeCount <= 1}
                        />
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <CardList>
            {team.map((a) => {
              const s = statFor(a.id);
              return (
                <li key={a.id} className="px-4 py-3.5 flex items-center gap-3">
                  <Avatar name={a.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-ink truncate-1">{a.name}</p>
                    <p className="text-xs text-muted truncate-1">{a.email}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {s?.assignedCount ?? 0} assigned ·{" "}
                      {s?.avgResponseMinutes == null ? "no replies yet" : `${s.avgResponseMinutes}m avg`}
                    </p>
                  </div>
                  {a.role !== "owner" ? (
                    <RemoveAgentButton
                      id={a.id}
                      name={a.name}
                      assigned={s?.assignedCount ?? 0}
                      lastActive={activeCount <= 1}
                    />
                  ) : null}
                </li>
              );
            })}
          </CardList>
        </TableShell>
      )}
    </div>
  );
}
