import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

import * as esmApi from '../../dist/index.js'

const require = createRequire(import.meta.url)
const cjsApi = require('../../dist/index.cjs')

test('esm and cjs entrypoints expose the same runtime API', () => {
  assert.deepEqual(Object.keys(esmApi).sort(), ['isUuidV7', 'prototype'])
  assert.deepEqual(Object.keys(cjsApi).sort(), ['isUuidV7', 'prototype'])
})

test('esm and cjs entrypoints behave the same', () => {
  const values = [
    null,
    { ok: true },
    [],
    new URL('https://sovereignbase.dev'),
    new Uint8Array([1, 2, 3]),
  ]

  for (const value of values) {
    assert.equal(esmApi.prototype(value), cjsApi.prototype(value))
  }

  const validUuidV7 = '018f0d1e-6c82-7d4b-91c1-8a7b5e2f4a10'
  const invalidUuid = '550e8400-e29b-41d4-a716-446655440000'

  assert.equal(esmApi.isUuidV7(validUuidV7), cjsApi.isUuidV7(validUuidV7))
  assert.equal(esmApi.isUuidV7(invalidUuid), cjsApi.isUuidV7(invalidUuid))
})
