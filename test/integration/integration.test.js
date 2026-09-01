import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test } from 'vitest'

import * as esmApi from '../../dist/index.js'

const require = createRequire(import.meta.url)
const cjsApi = require('../../dist/index.cjs')

const runtimeExports = [
  'LanguageBroker',
  'afterIdleFor',
  'browserHasSovereignbaseDependencies',
  'daysAsMilliseconds',
  'deriveBytes',
  'getISO31661Alpha2CountryCodeSet',
  'isRecord',
  'prototype',
  'safeStructuredClone',
  'waitFor',
]

test('esm and cjs entrypoints expose the same runtime API', () => {
  assert.deepEqual(Object.keys(esmApi).sort(), runtimeExports)
  assert.deepEqual(Object.keys(cjsApi).sort(), runtimeExports)
})

test('esm and cjs entrypoints behave the same', async () => {
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

  assert.equal(esmApi.isRecord({ ok: true }), cjsApi.isRecord({ ok: true }))
  assert.equal(esmApi.isRecord([]), cjsApi.isRecord([]))

  const esmLanguages = new esmApi.LanguageBroker('en', ['en', 'fi'])
  const cjsLanguages = new cjsApi.LanguageBroker('en', ['en', 'fi'])

  esmLanguages.set('fi')
  cjsLanguages.set('fi')

  assert.equal(esmLanguages.get(), cjsLanguages.get())
  assert.deepEqual([...esmLanguages.list()], [...cjsLanguages.list()])

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

  const esmCountryCodes = esmApi.getISO31661Alpha2CountryCodeSet()
  const cjsCountryCodes = cjsApi.getISO31661Alpha2CountryCodeSet()

  assert.equal(esmCountryCodes.size, cjsCountryCodes.size)
  assert.equal(esmCountryCodes.has('FI'), cjsCountryCodes.has('FI'))
  assert.equal(esmCountryCodes.has('US'), cjsCountryCodes.has('US'))
  assert.equal(esmCountryCodes.has('XX'), cjsCountryCodes.has('XX'))

  assert.equal(
    await esmApi.browserHasSovereignbaseDependencies(),
    await cjsApi.browserHasSovereignbaseDependencies()
  )

  assert.equal(typeof esmApi.afterIdleFor(1, () => {}), 'function')
  assert.equal(typeof cjsApi.afterIdleFor(1, () => {}), 'function')

  assert.equal(esmApi.daysAsMilliseconds(2), cjsApi.daysAsMilliseconds(2))

  await Promise.all([esmApi.waitFor(0), cjsApi.waitFor(0)])

  const base = new Uint8Array([1, 2, 3])
  const domain = new Uint8Array([4, 5, 6])
  assert.deepEqual(
    await esmApi.deriveBytes(base, domain, 16),
    await cjsApi.deriveBytes(base, domain, 16)
  )
})
