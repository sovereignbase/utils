/**
 * Converts a string to a bigint without throwing for invalid input.
 *
 * This uses the JavaScript `BigInt()` string conversion semantics.
 *
 * @param value The string to convert.
 * @returns `bigint` when conversion succeeds; otherwise, `false`.
 */
export function safeBigIntFromString(value: string): bigint | false {
  try {
    return BigInt(value)
  } catch {
    return false
  }
}
