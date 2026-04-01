import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

import * as esmApi from '../../dist/index.js'

const require = createRequire(import.meta.url)
const cjsApi = require('../../dist/index.cjs')

test('esm and cjs entrypoints expose the same runtime API', () => {
  assert.deepEqual(Object.keys(esmApi).sort(), [
    'isUuidV7',
    'prototype',
    'safeStructuredClone',
  ])
  assert.deepEqual(Object.keys(cjsApi).sort(), [
    'isUuidV7',
    'prototype',
    'safeStructuredClone',
  ])
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

  const cloneable = { ok: true, nested: { count: 1 } }
  const esmClone = esmApi.safeStructuredClone(cloneable)
  const cjsClone = cjsApi.safeStructuredClone(cloneable)

  assert.equal(esmClone[0], true)
  assert.equal(cjsClone[0], true)

  if (esmClone[0] && cjsClone[0]) {
    assert.deepEqual(esmClone[1], cjsClone[1])
    assert.notEqual(esmClone[1], cloneable)
    assert.notEqual(cjsClone[1], cloneable)
  }

  assert.deepEqual(
    esmApi.safeStructuredClone(() => {}),
    [false]
  )
  assert.deepEqual(
    cjsApi.safeStructuredClone(() => {}),
    [false]
  )
})
