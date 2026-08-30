import { performance } from 'node:perf_hooks'

import {
  afterIdleFor,
  getISO31661Alpha2CountryCodeSet,
  isRecord,
  prototype,
  safeStructuredClone,
} from '../dist/index.js'

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
