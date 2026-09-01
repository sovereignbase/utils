/**
 * Converts a number of days to milliseconds.
 *
 * @param numberOfDays - Number of 24-hour days to convert.
 * @returns The equivalent duration in milliseconds.
 *
 * @example Convert two days to milliseconds.
 * ```ts
 * daysAsMilliseconds(2) // 172800000
 * ```
 */
export function daysAsMilliseconds(numberOfDays: number): number {
  return 1_000 * 60 * 60 * 24 * numberOfDays
}
