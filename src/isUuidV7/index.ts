import { version as uuidVersion } from 'uuid'

/**
 * Determines whether `value` is a UUID version 7 string.
 *
 * @param value The value to test.
 * @returns `true` if `value` is a syntactically valid UUID whose version nibble is `7`; otherwise, `false`.
 */
export function isUuidV7(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    return uuidVersion(value) === 7
  } catch {
    return false
  }
}
