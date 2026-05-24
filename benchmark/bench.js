import { performance } from 'node:perf_hooks'

import {
  afterIdleFor,
  getISO31661Alpha2CountryCodeSet,
  isRecord,
  isUuidV7,
  isUuidV7BigInt,
  safeBigIntFromString,
  prototype,
  safeStructuredClone,
  uuidV7BigIntStringToBigInt,
} from '../dist/index.js'

const validUuidV7 = '018f0d1e-6c82-7d4b-91c1-8a7b5e2f4a10'
const invalidUuid = '550e8400-e29b-41d4-a716-446655440000'
const validUuidV7BigInt = 0x018f0d1e6c827d4b91c18a7b5e2f4a10n
const invalidUuidBigInt = 0x550e8400e29b41d4a716446655440000n
const validUuidV7BigIntString = validUuidV7BigInt.toString()
const invalidUuidBigIntString = invalidUuidBigInt.toString()
const validBigInt = '9007199254740993'
const invalidBigInt = 'not-a-bigint'
const recordValue = { ok: true, count: 3 }
const urlValue = new URL('https://sovereignbase.dev')
const cloneValue = {
  ok: true,
  nested: { count: 1 },
  list: [1, 2, 3],
  bytes: new Uint8Array([1, 2, 3]),
}
const afterIdleCallback = afterIdleFor(1, () => {})

function benchmark(name, iterations, fn) {
  for (let index = 0; index < 10_000; index++) fn()

  const startedAt = performance.now()
  for (let index = 0; index < iterations; index++) fn()
  const durationMs = performance.now() - startedAt
  const opsPerSec = Math.round(iterations / (durationMs / 1000))
  const millisecondsPerOperation = durationMs / iterations

  return {
    Benchmark: name,
    'Ops/sec': opsPerSec.toLocaleString('en-US'),
    'Ms/op': millisecondsPerOperation.toFixed(9),
  }
}

const results = [
  benchmark('prototype(record)', 2_000_000, () => prototype(recordValue)),
  benchmark('prototype(url)', 2_000_000, () => prototype(urlValue)),
  benchmark('isRecord(record)', 2_000_000, () => isRecord(recordValue)),
  benchmark('isRecord(array)', 2_000_000, () => isRecord([])),
  benchmark('isUuidV7(valid)', 1_000_000, () => isUuidV7(validUuidV7)),
  benchmark('isUuidV7(invalid)', 1_000_000, () => isUuidV7(invalidUuid)),
  benchmark('isUuidV7BigInt(valid)', 2_000_000, () =>
    isUuidV7BigInt(validUuidV7BigInt)
  ),
  benchmark('isUuidV7BigInt(invalid)', 2_000_000, () =>
    isUuidV7BigInt(invalidUuidBigInt)
  ),
  benchmark('safeBigIntFromString(valid)', 1_000_000, () =>
    safeBigIntFromString(validBigInt)
  ),
  benchmark('safeBigIntFromString(invalid)', 250_000, () =>
    safeBigIntFromString(invalidBigInt)
  ),
  benchmark('uuidV7BigIntStringToBigInt(valid)', 1_000_000, () =>
    uuidV7BigIntStringToBigInt(validUuidV7BigIntString)
  ),
  benchmark('uuidV7BigIntStringToBigInt(invalid)', 1_000_000, () =>
    uuidV7BigIntStringToBigInt(invalidUuidBigIntString)
  ),
  benchmark('getISO31661Alpha2CountryCodeSet()', 50_000, () =>
    getISO31661Alpha2CountryCodeSet()
  ),
  benchmark('safeStructuredClone(record)', 250_000, () =>
    safeStructuredClone(cloneValue)
  ),
  benchmark('safeStructuredClone(function)', 250_000, () =>
    safeStructuredClone(() => {})
  ),
  benchmark('afterIdleFor(callback)', 100_000, () => afterIdleCallback()),
]

await new Promise((resolve) => setTimeout(resolve, 1))

console.log(
  `Environment: Node ${process.version} (${process.platform} ${process.arch})`
)
console.table(results)
console.log('Results vary by machine.')
