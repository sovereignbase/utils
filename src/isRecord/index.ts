/**
 * Determines whether `value` is a plain object record.
 *
 * @param value The value to test.
 * @returns `true` if `value` is a non-null, non-array object whose prototype is backed by the `Object` constructor; otherwise, `false`.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value) as {
    constructor?: unknown
  } | null

  return (
    prototype !== null &&
    Object.prototype.hasOwnProperty.call(prototype, 'constructor') &&
    typeof prototype.constructor === 'function' &&
    prototype.constructor.name === 'Object'
  )
}
