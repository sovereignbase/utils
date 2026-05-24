const UUID_128_MIN = 0n
const UUID_128_MAX = 0xffffffffffffffffffffffffffffffffn

const UUID_VERSION_MASK = 0x000000000000f0000000000000000000n
const UUID_V7_VERSION = 0x00000000000070000000000000000000n

const UUID_VARIANT_MASK = 0x0000000000000000c000000000000000n
const UUID_RFC4122_VARIANT = 0x00000000000000008000000000000000n

/**
 * Determines whether `value` is a bigint representation of a UUID version 7.
 *
 * @param value The value to test.
 * @returns `true` if `value` is inside the 128-bit UUID range and contains UUID v7 version and RFC 4122 variant bits; otherwise, `false`.
 */
export function isUuidV7BigInt(value: unknown): value is bigint {
  if (typeof value !== 'bigint') return false

  return (
    value >= UUID_128_MIN &&
    value <= UUID_128_MAX &&
    (value & UUID_VERSION_MASK) === UUID_V7_VERSION &&
    (value & UUID_VARIANT_MASK) === UUID_RFC4122_VARIANT
  )
}
