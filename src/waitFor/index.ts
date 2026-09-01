/**
 * Waits for a duration before resolving.
 *
 * @param milliseconds - Duration to wait in milliseconds.
 * @returns A promise that resolves after the requested duration.
 *
 * @example Wait one second before continuing.
 * ```ts
 * await waitFor(1_000)
 * ```
 */
export async function waitFor(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
