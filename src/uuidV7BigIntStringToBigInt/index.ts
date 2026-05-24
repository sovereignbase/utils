import { isUuidV7BigInt } from '../isUuidV7BigInt/index.js'
import { safeBigIntFromString } from '../safeBigIntFromString/index.js'

/**
 * Converts a bigint string to a UUID v7 bigint without throwing for invalid input.
 *
 * This uses the JavaScript `BigInt()` string conversion semantics, then validates
 * the resulting bigint as a UUID v7 bit layout.
 *
 * @param value The value to convert.
 * @returns A UUID v7 bigint when conversion and validation succeed; otherwise, `false`.
 */
export function uuidV7BigIntStringToBigInt(value: unknown): bigint | false {
  if (typeof value !== 'string') return false
  const bigInt = safeBigIntFromString(value)
  return isUuidV7BigInt(bigInt) ? bigInt : false
}
