import assert from 'node:assert/strict'
import { test, vi } from 'vitest'

import { generateOTC } from '../../dist/index.js'

test('generateOTC defaults to eight characters from the code alphabet', () => {
  assert.match(generateOTC(), /^[A-HJ-NP-Z2-9]{8}$/u)
  assert.match(generateOTC(undefined), /^[A-HJ-NP-Z2-9]{8}$/u)
})

test('generateOTC supports custom lengths, including zero and the Web Crypto limit', () => {
  for (const length of [0, 1, 12, 65_536]) {
    const code = generateOTC(length)

    assert.equal(code.length, length)
    assert.match(code, /^[A-HJ-NP-Z2-9]*$/u)
  }
})

test('generateOTC maps random bytes uniformly across all 32 characters', () => {
  const random = vi
    .spyOn(globalThis.crypto, 'getRandomValues')
    .mockImplementation((bytes) => {
      assert.equal(bytes.byteLength, 256)
      bytes.set(Array.from({ length: 256 }, (_, index) => index))
      return bytes
    })

  try {
    const code = generateOTC(256)
    const counts = new Map()

    for (const character of code) {
      counts.set(character, (counts.get(character) ?? 0) + 1)
    }

    assert.equal(random.mock.calls.length, 1)
    assert.equal(code.length, 256)
    assert.equal(
      [...counts.keys()].join(''),
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    )
    assert.deepEqual([...counts.values()], Array(32).fill(8))
  } finally {
    random.mockRestore()
  }
})

test('generateOTC propagates invalid length and Web Crypto quota errors', () => {
  assert.throws(() => generateOTC(-1), RangeError)
  assert.throws(() => generateOTC(Infinity), RangeError)
  assert.throws(() => generateOTC(65_537), { name: 'QuotaExceededError' })
})
