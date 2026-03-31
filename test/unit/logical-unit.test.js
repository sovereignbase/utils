import test from 'node:test'
import assert from 'node:assert/strict'

import { isUuidV7, prototype } from '../../dist/index.js'

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
    'function'
  )
  assert.equal(prototype({ ok: true }), 'record')
  assert.equal(prototype([]), 'array')
  assert.equal(prototype(new Map()), 'map')
  assert.equal(prototype(new Set()), 'set')
  assert.equal(prototype(new Date(0)), 'date')
  assert.equal(prototype(/utils/u), 'regexp')
  assert.equal(prototype(new Error('boom')), 'error')
  assert.equal(prototype(Promise.resolve()), 'promise')
  assert.equal(prototype(new ArrayBuffer(8)), 'arraybuffer')
  assert.equal(prototype(new DataView(new ArrayBuffer(8))), 'dataview')
  assert.equal(prototype(new Uint8Array([1, 2, 3])), 'uint8array')
})

test('prototype handles platform objects and unsupported tags', () => {
  assert.equal(prototype(new URL('https://sovereignbase.dev')), 'url')
  assert.equal(prototype(new URLSearchParams('ok=true')), 'urlsearchparams')
  assert.equal(prototype(new Headers({ 'x-test': '1' })), 'headers')
  assert.equal(prototype(new Request('https://sovereignbase.dev')), 'request')
  assert.equal(prototype(new Response('ok')), 'response')
  assert.equal(prototype(new FormData()), 'formdata')
  assert.equal(prototype(new Blob(['ok'])), 'blob')
  assert.equal(prototype(new File(['ok'], 'ok.txt')), 'file')
  assert.equal(prototype(new ReadableStream()), 'readablestream')
  assert.equal(prototype(new WritableStream()), 'writablestream')
  assert.equal(prototype(new TransformStream()), 'transformstream')

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
