const ikm = crypto.subtle.importKey(
  'raw',
  new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
  'HKDF',
  false,
  ['deriveBits']
)

/**
 * Derives deterministic, domain-separated bytes with HKDF-SHA-256.
 *
 * The same `base`, `domain`, and `byteLength` always produce the same bytes.
 * Use a distinct domain for each purpose so one base value can safely feed
 * independent derivation contexts. The inputs are not modified.
 *
 * @param base - Salt that namespaces the derivation under a base value.
 * @param domain - HKDF context information identifying the derived value's use.
 * @param byteLength - Number of output bytes to derive.
 * @returns A promise that resolves to exactly `byteLength` derived bytes.
 * @throws A `DOMException` when Web Crypto rejects an unsupported or invalid
 * derivation request, including an invalid output length.
 *
 * @example Derive a 32-byte key for one application domain.
 * ```ts
 * const encoder = new TextEncoder()
 * const bytes = await deriveBytes(
 *   encoder.encode('account-1'),
 *   encoder.encode('profile-encryption'),
 *   32
 * )
 * ```
 */
export async function deriveBytes(
  base: Uint8Array<ArrayBufferLike>,
  domain: Uint8Array<ArrayBufferLike>,
  byteLength: number
): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: base as BufferSource,
        info: domain as BufferSource,
      },
      await ikm,
      byteLength * 8
    )
  )
}
