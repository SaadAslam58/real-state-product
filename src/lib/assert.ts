/**
 * Exhaustiveness guard for discriminated unions.
 *
 * A `switch` over a union that returns ReactNode does NOT error on a missing case
 * — TypeScript happily infers `undefined` into the return type. Ending the switch
 * with `default: return assertNever(x)` is what turns "someone added a Turn kind
 * and forgot the renderer" into a build failure instead of a blank bubble.
 *
 * Required in every switch over `Turn`, `Stage`, `AttentionState`, and
 * `ActivityKind`.
 */
export function assertNever(value: never): never {
  throw new Error(
    `Unhandled union member: ${JSON.stringify(value)}. A case is missing from a switch.`,
  );
}

/**
 * Narrowing helper for `.filter()` so `(T | null)[]` becomes `T[]` without a cast.
 */
export function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
