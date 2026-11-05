import { Bytes } from '@sovereignbase/bytecodec'

/**
 * Generates a cryptographically random one-time code.
 *
 * Uses the 32-character alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, excluding
 * `I`, `O`, `0`, and `1`. Each character carries five bits of randomness, so
 * the default eight-character code has 40 bits of entropy.
 *
 * @param length - Number of characters, defaulting to eight. Use a non-negative
 * integer no greater than 65,536, the Web Crypto random-byte limit.
 * @returns A random code, or an empty string when `length` is zero.
 * @throws When the byte length is invalid or Web Crypto rejects the request.
 *
 * @example Generate a twelve-character code.
 * ```ts
 * const code = generateOTC(12)
 * ```
 */
export function generateOTC(length = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(Bytes.generate(length), (byte) => alphabet[byte & 31]).join(
    ''
  )
}
