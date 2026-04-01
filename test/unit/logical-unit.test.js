import test from 'node:test'
import assert from 'node:assert/strict'

import { isUuidV7, prototype, safeStructuredClone } from '../../dist/index.js'

test('prototype classifies common primitives and built-ins', () => {
  assert.equal(prototype(null), 'null')
  assert.equal(prototype(undefined), 'undefined')
  assert.equal(prototype(true), 'boolean')
  assert.equal(prototype('sovereignbase'), 'string')
  assert.equal(prototype(Symbol('tag')), 'symbol')
  assert.equal(prototype(7), 'number')
  assert.equal(prototype(7n), 'bigint')
  assert.equal(
    prototype(() => {}),
    'unknown'
  )
  assert.equal(prototype({ ok: true }), 'record')
  assert.equal(prototype([]), 'array')
  assert.equal(prototype(new Map()), 'map')
  assert.equal(prototype(new Set()), 'set')
  assert.equal(prototype(new WeakMap()), 'unknown')
  assert.equal(prototype(new WeakSet()), 'unknown')
  assert.equal(prototype(new Date(0)), 'date')
  assert.equal(prototype(/utils/u), 'regexp')
  assert.equal(prototype(new Error('boom')), 'error')
  assert.equal(prototype(Promise.resolve()), 'unknown')
  assert.equal(prototype(new ArrayBuffer(8)), 'arraybuffer')
  assert.equal(prototype(new DataView(new ArrayBuffer(8))), 'dataview')
  assert.equal(prototype(new Uint8Array([1, 2, 3])), 'uint8array')
})

test('prototype handles platform objects and unsupported tags', () => {
  assert.equal(prototype(new URL('https://sovereignbase.dev')), 'url')
  assert.equal(prototype(new URLSearchParams('ok=true')), 'urlsearchparams')
  assert.equal(prototype(new Headers({ 'x-test': '1' })), 'unknown')
  assert.equal(prototype(new Request('https://sovereignbase.dev')), 'unknown')
  assert.equal(prototype(new Response('ok')), 'unknown')
  assert.equal(prototype(new FormData()), 'unknown')
  assert.equal(prototype(new Blob(['ok'])), 'blob')
  assert.equal(prototype(new File(['ok'], 'ok.txt')), 'file')
  assert.equal(prototype(new ReadableStream()), 'unknown')
  assert.equal(prototype(new WritableStream()), 'unknown')
  assert.equal(prototype(new TransformStream()), 'unknown')

  const tagged = { [Symbol.toStringTag]: 'ExampleValue' }

  assert.equal(prototype(tagged), 'unknown')
})

test('isUuidV7 accepts only UUID version 7 strings', () => {
  assert.equal(isUuidV7('018f0d1e-6c82-7d4b-91c1-8a7b5e2f4a10'), true)
  assert.equal(isUuidV7('550e8400-e29b-41d4-a716-446655440000'), false)
  assert.equal(isUuidV7('not-a-uuid'), false)
  assert.equal(isUuidV7(null), false)
  assert.equal(isUuidV7(undefined), false)
  assert.equal(isUuidV7(7), false)
})

test('safeStructuredClone returns a deep clone for structured-cloneable values', () => {
  const source = {
    ok: true,
    nested: { count: 1 },
    list: [1, 2, 3],
    bytes: new Uint8Array([1, 2, 3]),
  }

  const result = safeStructuredClone(source)

  assert.equal(result[0], true)
  if (!result[0]) return

  const clone = result[1]

  assert.notEqual(clone, source)
  assert.notEqual(clone.nested, source.nested)
  assert.notEqual(clone.list, source.list)
  assert.notEqual(clone.bytes, source.bytes)
  assert.deepEqual(clone, source)

  clone.nested.count = 2
  clone.list.push(4)
  clone.bytes[0] = 9

  assert.equal(source.nested.count, 1)
  assert.deepEqual(source.list, [1, 2, 3])
  assert.deepEqual(Array.from(source.bytes), [1, 2, 3])
})

test('safeStructuredClone returns false for uncloneable values', () => {
  assert.deepEqual(
    safeStructuredClone(() => {}),
    [false]
  )
})
