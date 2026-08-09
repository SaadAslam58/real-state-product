import { DataError } from "../types";

/**
 * State scenarios — the `?scenario=` switch.
 *
 * This UI specifies a loading, empty, error, and partial state for nearly every
 * surface. With static fixtures most of those are unreachable by hand, which means
 * nobody can check them and they quietly rot. This makes all of them viewable:
 *
 *   /leads?scenario=empty     → the no-data empty state
 *   /leads?scenario=error     → the inline retry surface
 *   /?scenario=slow           → skeletons (2s delay on every read)
 *   /listings?scenario=partial-sync
 *   /?scenario=fresh          → a brand-new agency, nothing set up yet
 *
 * It is read at the `lib/data` boundary only — no component knows it exists.
 * In a real deployment this is the seam where the fetch adapter goes, and the
 * scenario switch simply stops being wired up.
 */

export const SCENARIOS = [
  "default",
  "empty",
  "error",
  "slow",
  "partial-sync",
  "fresh",
] as const;

export type Scenario = (typeof SCENARIOS)[number];

export function parseScenario(value: string | string[] | undefined): Scenario {
  const raw = Array.isArray(value) ? value[0] : value;
  return (SCENARIOS as readonly string[]).includes(raw ?? "")
    ? (raw as Scenario)
    : "default";
}

/**
 * Applied by every read in `lib/data/*`. Keeping the delay and the throw in one
 * place is what stops "sometimes there's a loading state" from becoming a
 * per-screen accident.
 */
export async function applyScenario(scenario: Scenario): Promise<void> {
  if (scenario === "slow") {
    await new Promise((r) => setTimeout(r, 2000));
  }
  if (scenario === "error") {
    throw new DataError(
      "network",
      "Couldn't reach the server.",
      "Simulated by ?scenario=error",
    );
  }
}

export function isEmptyScenario(scenario: Scenario): boolean {
  return scenario === "empty" || scenario === "fresh";
}
