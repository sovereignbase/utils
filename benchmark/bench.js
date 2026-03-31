import { performance } from 'node:perf_hooks'

import { isUuidV7, prototype } from '../dist/index.js'

const validUuidV7 = '018f0d1e-6c82-7d4b-91c1-8a7b5e2f4a10'
const invalidUuid = '550e8400-e29b-41d4-a716-446655440000'
const recordValue = { ok: true, count: 3 }
const urlValue = new URL('https://sovereignbase.dev')

function benchmark(name, iterations, fn) {
  for (let index = 0; index < 10_000; index++) fn()

  const startedAt = performance.now()
  for (let index = 0; index < iterations; index++) fn()
  const durationMs = performance.now() - startedAt
  const opsPerSec = Math.round(iterations / (durationMs / 1000))

  return {
    Benchmark: name,
    'Ops/sec': opsPerSec.toLocaleString('en-US'),
    'Duration (ms)': durationMs.toFixed(1),
  }
}

const results = [
  benchmark('prototype(record)', 2_000_000, () => prototype(recordValue)),
  benchmark('prototype(url)', 2_000_000, () => prototype(urlValue)),
  benchmark('isUuidV7(valid)', 1_000_000, () => isUuidV7(validUuidV7)),
  benchmark('isUuidV7(invalid)', 1_000_000, () => isUuidV7(invalidUuid)),
]

console.log(
  `Environment: Node ${process.version} (${process.platform} ${process.arch})`
)
console.table(results)
console.log('Results vary by machine.')
