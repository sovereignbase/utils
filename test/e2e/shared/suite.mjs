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
  'function',
  'record',
  'array',
  'map',
  'set',
  'weakmap',
  'weakset',
  'date',
  'regexp',
  'error',
  'promise',
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
  'headers',
  'request',
  'response',
  'formdata',
  'blob',
  'file',
  'readablestream',
  'writablestream',
  'transformstream',
  'unknown',
])

export async function runUtilsSuite(api, options = {}) {
  const { label = 'runtime' } = options
  const runtimeGlobals = options.runtimeGlobals ?? globalThis
  const results = { label, ok: true, errors: [], tests: [] }

  const { prototype, isUuidV7 } = api

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
    assert(typeof prototype === 'function', 'prototype export missing')
    assert(typeof isUuidV7 === 'function', 'isUuidV7 export missing')
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
      'function'
    )
  })

  await runTest('prototype classifies built-ins', () => {
    assertEqual(prototype({ ok: true }), 'record')
    assertEqual(prototype(Object.create(null)), 'record')
    assertEqual(prototype([]), 'array')
    assertEqual(prototype(new Map()), 'map')
    assertEqual(prototype(new Set()), 'set')
    assertEqual(prototype(new Date(0)), 'date')
    assertEqual(prototype(/utils/u), 'regexp')
    assertEqual(prototype(new Error('boom')), 'error')
    assertEqual(prototype(Promise.resolve()), 'promise')
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
