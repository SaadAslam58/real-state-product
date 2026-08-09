import { cookies } from "next/headers";
import type { Role } from "./types";

/**
 * Reads the acting role from a cookie.
 *
 * There is no authentication in this build. This is the seam where a real
 * session read goes — everything downstream (`getSession`, `scopeLeads`) already
 * takes a `Session`, so wiring real auth means changing this file and nothing
 * else. See SECURITY.md.
 */
export async function getRole(): Promise<Role> {
  const store = await cookies();
  return store.get("gehox_role")?.value === "agent" ? "agent" : "owner";
}
