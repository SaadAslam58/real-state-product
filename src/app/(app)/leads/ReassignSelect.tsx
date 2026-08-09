"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { assignLead } from "@/lib/data";
import { Avatar } from "@/components/ui/Primitives";

/**
 * Inline reassign.
 *
 * New leads are assigned round-robin across active agents, but the override has
 * to be one click from the table — an owner scanning for a cold lead wants to
 * move it now, not open the lead, find a menu, and come back.
 */
export function ReassignSelect({
  leadId,
  current,
  agents,
}: {
  leadId: string;
  current: string | null;
  agents: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(current ?? "");
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  const selected = agents.find((a) => a.id === value);

  async function change(next: string) {
    const previous = value;
    setValue(next); // optimistic
    setPending(true);
    try {
      await assignLead(leadId, next);
      startTransition(() => router.refresh());
    } catch {
      setValue(previous); // roll back rather than lie about it
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      {selected ? <Avatar name={selected.name} size={22} /> : null}
      <span className="relative inline-flex items-center">
        <label className="sr-only" htmlFor={`assign-${leadId}`}>
          Assigned agent
        </label>
        <select
          id={`assign-${leadId}`}
          value={value}
          disabled={pending}
          onChange={(e) => change(e.target.value)}
          className="appearance-none bg-transparent text-sm text-ink-soft pr-5 py-1 rounded cursor-pointer hover:text-ink disabled:opacity-50 max-w-[13ch] truncate"
        >
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="absolute right-0 pointer-events-none text-muted"
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </span>
  );
}
