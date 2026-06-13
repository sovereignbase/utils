const UINT32_MIN = 0
const UINT32_MAX = 4_294_967_295

/**
 * Determines whether `value` is an unsigned 32-bit integer number.
 *
 * @param value The value to test.
 * @returns `true` if `value` is an integer number in the inclusive range 0 through 2^32 - 1; otherwise, `false`.
 */
export function isUint32(value: unknown): value is number {
  return (
    Number.isSafeInteger(value) &&
    (value as number) >= UINT32_MIN &&
    (value as number) <= UINT32_MAX
  )
}
