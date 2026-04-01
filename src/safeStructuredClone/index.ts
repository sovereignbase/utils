/**
 * Attempts to create a structured clone of `value` without throwing.
 *
 * @param value The value to clone.
 * @returns `[true, clone]` when `value` can be cloned with `structuredClone`; otherwise `[false]`.
 */
export function safeStructuredClone<T>(value: T): [true, T] | [false] {
  try {
    return [true, structuredClone(value)]
  } catch {
    return [false]
  }
}
