const TEST_TIMEOUT_MS = 5000
const VALID_UUID_V7 = '018f0d1e-6c82-7d4b-91c1-8a7b5e2f4a10'
const VALID_UUID_V4 = '550e8400-e29b-41d4-a716-446655440000'
const KNOWN_PROTOTYPES = new Set([
  'null',
  'undefined',
  'boolean',
  'string',
  'symbol',
  'number',
  'bigint',
  'record',
  'array',
  'map',
  'set',
  'date',
  'regexp',
  'error',
  'arraybuffer',
  'sharedarraybuffer',
  'dataview',
  'int8array',
  'uint8array',
  'uint8clampedarray',
  'int16array',
  'uint16array',
  'int32array',
  'uint32array',
  'float32array',
  'float64array',
  'bigint64array',
  'biguint64array',
  'url',
  'urlsearchparams',
  'blob',
  'file',
  'unknown',
])

export async function runUtilsSuite(api, options = {}) {
  const { label = 'runtime' } = options
  const runtimeGlobals = options.runtimeGlobals ?? globalThis
  const results = { label, ok: true, errors: [], tests: [] }

  const {
    afterIdleFor,
    browserHasSovereignbaseDependencies,
    deriveBytes,
    getISO31661Alpha2CountryCodeSet,
    isRecord,
    isUint32,
    prototype,
    isUuidV7,
    isUuidV7BigInt,
    safeBigIntFromString,
    safeStructuredClone,
    uuidV7BigIntStringToBigInt,
  } = api

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'assertion failed')
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `expected ${String(actual)} to equal ${String(expected)}`
      )
    }
  }

  function expectedPrototype(value) {
    let type = typeof value

    if (type === 'object') {
      type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
    }

    if (type === 'object') return 'record'
    return KNOWN_PROTOTYPES.has(type) ? type : 'unknown'
  }

  async function withTimeout(promise, ms, name) {
    let timer
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`timeout after ${ms}ms${name ? `: ${name}` : ''}`))
      }, ms)
      timer.unref?.()
    })
    return Promise.race([promise.finally(() => clearTimeout(timer)), timeout])
  }

  async function runTest(name, fn) {
    try {
      await withTimeout(Promise.resolve().then(fn), TEST_TIMEOUT_MS, name)
      results.tests.push({ name, ok: true })
    } catch (error) {
      results.ok = false
      results.tests.push({ name, ok: false })
      results.errors.push({ name, message: String(error) })
    }
  }

  await runTest('exports shape', () => {
    assert(
      typeof browserHasSovereignbaseDependencies === 'function',
      'browserHasSovereignbaseDependencies export missing'
    )
    assert(typeof afterIdleFor === 'function', 'afterIdleFor export missing')
    assert(typeof deriveBytes === 'function', 'deriveBytes export missing')
    assert(
      typeof getISO31661Alpha2CountryCodeSet === 'function',
      'getISO31661Alpha2CountryCodeSet export missing'
    )
    assert(typeof prototype === 'function', 'prototype export missing')
    assert(typeof isRecord === 'function', 'isRecord export missing')
    assert(typeof isUint32 === 'function', 'isUint32 export missing')
    assert(typeof isUuidV7 === 'function', 'isUuidV7 export missing')
    assert(
      typeof isUuidV7BigInt === 'function',
      'isUuidV7BigInt export missing'
    )
    assert(
      typeof safeBigIntFromString === 'function',
      'safeBigIntFromString export missing'
    )
    assert(
      typeof safeStructuredClone === 'function',
      'safeStructuredClone export missing'
    )
    assert(
      typeof uuidV7BigIntStringToBigInt === 'function',
      'uuidV7BigIntStringToBigInt export missing'
    )
  })

  await runTest('prototype classifies primitives', () => {
    assertEqual(prototype(null), 'null')
    assertEqual(prototype(undefined), 'undefined')
    assertEqual(prototype(true), 'boolean')
    assertEqual(prototype('utils'), 'string')
    assertEqual(prototype(Symbol('utils')), 'symbol')
    assertEqual(prototype(7), 'number')
    assertEqual(prototype(7n), 'bigint')
    assertEqual(
      prototype(() => {}),
      'unknown'
    )
  })

  await runTest('prototype classifies built-ins', () => {
    assertEqual(prototype({ ok: true }), 'record')
    assertEqual(prototype(Object.create(null)), 'record')
    assertEqual(prototype([]), 'array')
    assertEqual(prototype(new Map()), 'map')
    assertEqual(prototype(new Set()), 'set')
    assertEqual(prototype(new WeakMap()), 'unknown')
    assertEqual(prototype(new WeakSet()), 'unknown')
    assertEqual(prototype(new Date(0)), 'date')
    assertEqual(prototype(/utils/u), 'regexp')
    assertEqual(prototype(new Error('boom')), 'error')
    assertEqual(prototype(Promise.resolve()), 'unknown')
    assertEqual(prototype(new ArrayBuffer(8)), 'arraybuffer')
    assertEqual(prototype(new DataView(new ArrayBuffer(8))), 'dataview')
    assertEqual(prototype(new Uint8Array([1, 2, 3])), 'uint8array')
  })

  await runTest('prototype classifies platform objects when available', () => {
    if (typeof runtimeGlobals.SharedArrayBuffer === 'function') {
      const value = new runtimeGlobals.SharedArrayBuffer(8)
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.URL === 'function') {
      const value = new runtimeGlobals.URL('https://sovereignbase.dev')
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.URLSearchParams === 'function') {
      const value = new runtimeGlobals.URLSearchParams('ok=true')
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.Headers === 'function') {
      const value = new runtimeGlobals.Headers({ 'x-test': '1' })
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.Request === 'function') {
      const value = new runtimeGlobals.Request('https://sovereignbase.dev')
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.Response === 'function') {
      const value = new runtimeGlobals.Response('ok')
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.FormData === 'function') {
      const value = new runtimeGlobals.FormData()
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.Blob === 'function') {
      const value = new runtimeGlobals.Blob(['ok'])
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.File === 'function') {
      const value = new runtimeGlobals.File(['ok'], 'ok.txt')
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.ReadableStream === 'function') {
      const value = new runtimeGlobals.ReadableStream()
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.WritableStream === 'function') {
      const value = new runtimeGlobals.WritableStream()
      assertEqual(prototype(value), expectedPrototype(value))
    }

    if (typeof runtimeGlobals.TransformStream === 'function') {
      const value = new runtimeGlobals.TransformStream()
      assertEqual(prototype(value), expectedPrototype(value))
    }
  })

  await runTest('prototype returns unknown for unsupported tags', () => {
    const tagged = { [Symbol.toStringTag]: 'ExampleValue' }

    assertEqual(prototype(tagged), 'unknown')
  })

  await runTest('isUuidV7 accepts version 7 uuids', () => {
    assertEqual(isUuidV7(VALID_UUID_V7), true)
  })

  await runTest('isUuidV7 rejects non-version-7 values', () => {
    assertEqual(isUuidV7(VALID_UUID_V4), false)
    assertEqual(isUuidV7('not-a-uuid'), false)
    assertEqual(isUuidV7('018f0d1e6c827d4b91c18a7b5e2f4a10'), false)
    assertEqual(isUuidV7(null), false)
    assertEqual(isUuidV7(undefined), false)
    assertEqual(isUuidV7(7), false)
  })

  await runTest('isUuidV7BigInt accepts version 7 UUID bigints', () => {
    assertEqual(isUuidV7BigInt(0x018f0d1e6c827d4b91c18a7b5e2f4a10n), true)
  })

  await runTest('isUuidV7BigInt rejects non-version-7 bigint values', () => {
    assertEqual(isUuidV7BigInt(0x550e8400e29b41d4a716446655440000n), false)
    assertEqual(isUuidV7BigInt(0x018f0d1e6c826d4b91c18a7b5e2f4a10n), false)
    assertEqual(isUuidV7BigInt(0x018f0d1e6c827d4b71c18a7b5e2f4a10n), false)
    assertEqual(isUuidV7BigInt(-1n), false)
    assertEqual(isUuidV7BigInt(0x100000000000000000000000000000000n), false)
    assertEqual(isUuidV7BigInt('018f0d1e6c827d4b91c18a7b5e2f4a10'), false)
    assertEqual(isUuidV7BigInt(null), false)
  })

  await runTest('isRecord accepts only plain object records', () => {
    class Example {}

    assertEqual(isRecord({ ok: true }), true)
    assertEqual(isRecord({}), true)
    assertEqual(isRecord(Object.create(null)), false)
    assertEqual(isRecord(new Example()), false)
    assertEqual(isRecord([]), false)
    assertEqual(isRecord(new Map()), false)
    assertEqual(isRecord(null), false)
    assertEqual(isRecord(undefined), false)
    assertEqual(isRecord('record'), false)
  })

  await runTest('isUint32 accepts only unsigned 32-bit integer numbers', () => {
    assertEqual(isUint32(0), true)
    assertEqual(isUint32(-0), true)
    assertEqual(isUint32(4_294_967_295), true)
    assertEqual(isUint32(-1), false)
    assertEqual(isUint32(4_294_967_296), false)
    assertEqual(isUint32(1.5), false)
    assertEqual(isUint32(Number.NaN), false)
    assertEqual(isUint32('1'), false)
    assertEqual(isUint32(1n), false)
    assertEqual(isUint32(null), false)
  })

  await runTest('safeBigIntFromString returns parsed bigints', () => {
    const zero = safeBigIntFromString('0')
    const large = safeBigIntFromString('9007199254740993')
    const hexadecimal = safeBigIntFromString('0x10')
    const invalid = safeBigIntFromString('not-a-bigint')

    assertEqual(zero, 0n)
    assertEqual(large, 9007199254740993n)
    assertEqual(hexadecimal, 16n)
    assertEqual(invalid, false)
  })

  await runTest(
    'deriveBytes derives deterministic domain-separated bytes',
    async () => {
      const base = new Uint8Array([10, 11, 12])
      const domain = new Uint8Array([13, 14, 15])
      const first = await deriveBytes(base, domain, 32)
      const second = await deriveBytes(base, domain, 32)
      const separated = await deriveBytes(base, new Uint8Array([16]), 32)

      assertEqual(first.byteLength, 32)
      assertEqual(Array.from(first).join(','), Array.from(second).join(','))
      assert(
        Array.from(first).join(',') !== Array.from(separated).join(','),
        'expected different domains to derive different bytes'
      )
    }
  )

  await runTest(
    'uuidV7BigIntStringToBigInt returns only valid UUID v7 bigints',
    () => {
      const valid = 0x018f0d1e6c827d4b91c18a7b5e2f4a10n
      const invalidVersion = 0x018f0d1e6c826d4b91c18a7b5e2f4a10n
      const invalidVariant = 0x018f0d1e6c827d4b71c18a7b5e2f4a10n

      assertEqual(uuidV7BigIntStringToBigInt(valid.toString()), valid)
      assertEqual(uuidV7BigIntStringToBigInt(`0x${valid.toString(16)}`), valid)
      assertEqual(uuidV7BigIntStringToBigInt(invalidVersion.toString()), false)
      assertEqual(uuidV7BigIntStringToBigInt(invalidVariant.toString()), false)
      assertEqual(uuidV7BigIntStringToBigInt('not-a-bigint'), false)
      assertEqual(uuidV7BigIntStringToBigInt(valid), false)
      assertEqual(uuidV7BigIntStringToBigInt(null), false)
    }
  )

  await runTest('safeStructuredClone clones supported values', () => {
    if (typeof runtimeGlobals.structuredClone !== 'function') {
      assertEqual(safeStructuredClone({ ok: true })[0], false)
      return
    }

    const source = {
      ok: true,
      nested: { count: 1 },
      list: [1, 2, 3],
      bytes: new Uint8Array([1, 2, 3]),
    }

    const result = safeStructuredClone(source)

    assertEqual(result[0], true)
    if (!result[0]) return

    const clone = result[1]

    assert(clone !== source, 'expected a new object')
    assert(
      clone.nested !== source.nested,
      'expected nested object to be cloned'
    )
    assert(clone.list !== source.list, 'expected array to be cloned')
    assert(clone.bytes !== source.bytes, 'expected typed array to be cloned')
    assertEqual(clone.nested.count, 1)
    assertEqual(clone.list.length, 3)
    assertEqual(clone.bytes[0], 1)

    clone.nested.count = 2
    clone.list.push(4)
    clone.bytes[0] = 9

    assertEqual(source.nested.count, 1)
    assertEqual(source.list.length, 3)
    assertEqual(source.bytes[0], 1)
  })

  await runTest(
    'safeStructuredClone returns false for unsupported values',
    () => {
      assertEqual(safeStructuredClone(() => {})[0], false)
    }
  )

  await runTest(
    'getISO31661Alpha2CountryCodeSet returns a fresh set of country codes',
    () => {
      const first = getISO31661Alpha2CountryCodeSet()
      const second = getISO31661Alpha2CountryCodeSet()

      assertEqual(Object.prototype.toString.call(first), '[object Set]')
      assertEqual(first.size, 249)
      assertEqual(first.has('FI'), true)
      assertEqual(first.has('US'), true)
      assertEqual(first.has('XX'), false)
      assert(first !== second, 'expected a fresh Set per call')
      assertEqual([...first].join(','), [...second].join(','))
    }
  )

  await runTest('afterIdleFor waits until calls stop', async () => {
    let calls = 0
    const afterIdle = afterIdleFor(10, () => {
      calls += 1
    })

    afterIdle()
    afterIdle()

    assertEqual(calls, 0)
    await new Promise((resolve) => setTimeout(resolve, 20))
    assertEqual(calls, 1)
  })

  await runTest(
    'browserHasSovereignbaseDependencies reports runtime support',
    async () => {
      const supported = await browserHasSovereignbaseDependencies()

      assertEqual(typeof supported, 'boolean')

      if (typeof runtimeGlobals.window === 'undefined') {
        assertEqual(supported, false)
      }
    }
  )

  return results
}

export function printResults(results) {
  const passed = results.tests.filter((test) => test.ok).length
  console.log(`${results.label}: ${passed}/${results.tests.length} passed`)
  if (!results.ok) {
    for (const error of results.errors) {
      console.error(`  - ${error.name}: ${error.message}`)
    }
  }
}

export function ensurePassing(results) {
  if (results.ok) return
  throw new Error(
    `${results.label} failed with ${results.errors.length} failing tests`
  )
}
