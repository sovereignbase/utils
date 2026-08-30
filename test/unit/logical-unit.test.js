import assert from 'node:assert/strict'
import { runInNewContext } from 'node:vm'
import { test } from 'vitest'

import {
  afterIdleFor,
  browserHasSovereignbaseDependencies,
  deriveBytes,
  getISO31661Alpha2CountryCodeSet,
  isRecord,
  LanguageBroker,
  prototype,
  safeStructuredClone,
} from '../../dist/index.js'

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  )
}

const BROWSER_GLOBAL_NAMES = [
  'window',
  'navigator',
  'crypto',
  'PublicKeyCredential',
]

function createBrowserEnvironment(overrides = {}) {
  const PublicKeyCredentialValue =
    overrides.PublicKeyCredential ??
    class PublicKeyCredential {
      static async isUserVerifyingPlatformAuthenticatorAvailable() {
        return true
      }
    }

  const windowValue = {
    isSecureContext: true,
    indexedDB: {},
    BroadcastChannel: class BroadcastChannel {},
    WebSocket: class WebSocket {},
    AbortSignal: class AbortSignal {},
    EventTarget: class EventTarget {},
    CustomEvent: class CustomEvent {},
    MessageEvent: class MessageEvent {},
    DOMException: class DOMException extends Error {},
    Worker: class Worker {},
    PushManager: class PushManager {},
    Notification: class Notification {},
    PublicKeyCredential: PublicKeyCredentialValue,
    ...(overrides.window ?? {}),
  }

  const navigatorValue = {
    credentials: {},
    locks: {},
    onLine: true,
    serviceWorker: {},
    ...(overrides.navigator ?? {}),
  }

  const cryptoValue = {
    subtle: {},
    randomUUID() {
      return '018f0d1e-6c82-7d4b-91c1-8a7b5e2f4a10'
    },
    getRandomValues(value) {
      return value
    },
    ...(overrides.crypto ?? {}),
  }

  return {
    window: windowValue,
    navigator: navigatorValue,
    crypto: cryptoValue,
    PublicKeyCredential: PublicKeyCredentialValue,
  }
}

function without(object, property) {
  const copy = { ...object }
  delete copy[property]
  return copy
}

async function withMockedBrowserGlobals(mockedGlobals, fn) {
  const originalDescriptors = new Map(
    BROWSER_GLOBAL_NAMES.map((name) => [
      name,
      Object.getOwnPropertyDescriptor(globalThis, name),
    ])
  )

  try {
    for (const [name, value] of Object.entries(mockedGlobals)) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        enumerable: true,
        writable: true,
        value,
      })
    }

    return await fn()
  } finally {
    for (const [name, descriptor] of originalDescriptors) {
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor)
        continue
      }

      Reflect.deleteProperty(globalThis, name)
    }
  }
}

function waitFor(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

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

test('isRecord accepts only plain object records', () => {
  class Example {}

  assert.equal(isRecord({ ok: true }), true)
  assert.equal(isRecord({}), true)
  assert.equal(isRecord(runInNewContext('({ ok: true })')), true)
  assert.equal(isRecord(Object.create(null)), false)
  assert.equal(isRecord(new Example()), false)
  assert.equal(isRecord([]), false)
  assert.equal(isRecord(new Map()), false)
  assert.equal(isRecord(null), false)
  assert.equal(isRecord(undefined), false)
  assert.equal(isRecord('record'), false)
})

test('deriveBytes matches a stable HKDF-SHA-256 test vector', async () => {
  const bytes = await deriveBytes(
    new Uint8Array([10, 11, 12]),
    new Uint8Array([13, 14, 15]),
    32
  )

  assert.equal(bytes.byteLength, 32)
  assert.equal(
    toHex(bytes),
    'aadcc1865ab67c377b2cbceef2578cb09806ac4833f0dd026b7bc97667189121'
  )
})

test('deriveBytes separates domains and rejects invalid lengths', async () => {
  const base = new Uint8Array([1, 2, 3])
  const first = await deriveBytes(base, new Uint8Array([4]), 16)
  const second = await deriveBytes(base, new Uint8Array([5]), 16)

  assert.notDeepEqual(first, second)
  await assert.rejects(deriveBytes(base, new Uint8Array([4]), -1))
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

test('getISO31661Alpha2CountryCodeSet returns a fresh set of country codes', () => {
  const first = getISO31661Alpha2CountryCodeSet()
  const second = getISO31661Alpha2CountryCodeSet()

  assert.equal(first instanceof Set, true)
  assert.equal(first.size, 249)
  assert.equal(first.has('FI'), true)
  assert.equal(first.has('US'), true)
  assert.equal(first.has('XX'), false)
  assert.notEqual(first, second)
  assert.deepEqual([...first], [...second])
})

test('LanguageBroker stores language changes and invokes its callback', () => {
  const changes = []
  const broker = new LanguageBroker('en-US', ['en-US', 'fi-FI'], (language) => {
    changes.push(language)
  })

  assert.equal(broker.get(), 'en-US')
  assert.deepEqual([...broker.list()], ['en-US', 'fi-FI'])

  broker.set('fi-FI')

  assert.equal(broker.get(), 'fi-FI')
  assert.deepEqual(changes, ['fi-FI'])
})

test('LanguageBroker dispatches typed change events until removal', () => {
  const broker = new LanguageBroker('en', ['en', 'fi', 'sv'])
  const changes = []
  const listener = (event) => {
    changes.push(event.detail)
  }

  broker.addEventListener('change', listener)
  broker.set('fi')
  broker.removeEventListener('change', listener)
  broker.set('sv')

  assert.deepEqual(changes, ['fi'])
})

test('LanguageBroker ignores removal of an unregistered listener', () => {
  const broker = new LanguageBroker('en', ['en', 'fi'])
  let calls = 0
  const listener = () => {
    calls += 1
  }

  broker.addEventListener('change', listener)
  broker.removeEventListener('change', () => {})
  broker.set('fi')

  assert.equal(calls, 1)
})

test('LanguageBroker ignores unsupported runtime language changes', () => {
  const changes = []
  const broker = new LanguageBroker('en', ['en', 'fi'], (language) => {
    changes.push(language)
  })

  broker.set('sv')

  assert.equal(broker.get(), 'en')
  assert.deepEqual(changes, [])
})

test('afterIdleFor runs the callback after the idle timeout', async () => {
  let calls = 0
  const afterIdle = afterIdleFor(10, () => {
    calls += 1
  })

  afterIdle()

  assert.equal(calls, 0)
  await waitFor(20)
  assert.equal(calls, 1)
})

test('afterIdleFor restarts the timer on every call', async () => {
  let calls = 0
  const afterIdle = afterIdleFor(20, () => {
    calls += 1
  })

  afterIdle()
  await waitFor(10)
  afterIdle()
  await waitFor(10)
  afterIdle()
  await waitFor(10)

  assert.equal(calls, 0)

  await waitFor(20)
  assert.equal(calls, 1)
})

test('browserHasSovereignbaseDependencies returns false outside browser runtimes', async () => {
  assert.equal(await browserHasSovereignbaseDependencies(), false)
})

test('browserHasSovereignbaseDependencies returns true when all required browser APIs exist', async () => {
  const mockedGlobals = createBrowserEnvironment()

  assert.equal(
    await withMockedBrowserGlobals(mockedGlobals, () =>
      browserHasSovereignbaseDependencies()
    ),
    true
  )
})

test('browserHasSovereignbaseDependencies returns false when a required browser dependency is missing', async () => {
  const base = createBrowserEnvironment()
  const failureCases = [
    ['window missing', { ...base, window: undefined }],
    [
      'secure context missing',
      { ...base, window: { ...base.window, isSecureContext: false } },
    ],
    ['navigator missing', { ...base, navigator: undefined }],
    [
      'navigator.credentials missing',
      { ...base, navigator: without(base.navigator, 'credentials') },
    ],
    [
      'indexedDB missing',
      { ...base, window: without(base.window, 'indexedDB') },
    ],
    [
      'BroadcastChannel missing',
      { ...base, window: without(base.window, 'BroadcastChannel') },
    ],
    [
      'WebSocket missing',
      { ...base, window: without(base.window, 'WebSocket') },
    ],
    [
      'AbortSignal missing',
      { ...base, window: without(base.window, 'AbortSignal') },
    ],
    [
      'EventTarget missing',
      { ...base, window: without(base.window, 'EventTarget') },
    ],
    [
      'CustomEvent missing',
      { ...base, window: without(base.window, 'CustomEvent') },
    ],
    [
      'MessageEvent missing',
      { ...base, window: without(base.window, 'MessageEvent') },
    ],
    [
      'DOMException missing',
      { ...base, window: without(base.window, 'DOMException') },
    ],
    [
      'navigator.locks missing',
      { ...base, navigator: without(base.navigator, 'locks') },
    ],
    [
      'navigator.onLine missing',
      { ...base, navigator: without(base.navigator, 'onLine') },
    ],
    ['Worker missing', { ...base, window: without(base.window, 'Worker') }],
    [
      'navigator.serviceWorker missing',
      { ...base, navigator: without(base.navigator, 'serviceWorker') },
    ],
    [
      'PushManager missing',
      { ...base, window: without(base.window, 'PushManager') },
    ],
    [
      'Notification missing',
      { ...base, window: without(base.window, 'Notification') },
    ],
    ['crypto missing', { ...base, crypto: undefined }],
    [
      'crypto.subtle missing',
      { ...base, crypto: { ...base.crypto, subtle: undefined } },
    ],
    [
      'crypto.randomUUID missing',
      { ...base, crypto: { ...base.crypto, randomUUID: undefined } },
    ],
    [
      'crypto.getRandomValues missing',
      { ...base, crypto: { ...base.crypto, getRandomValues: undefined } },
    ],
    [
      'PublicKeyCredential missing',
      { ...base, window: without(base.window, 'PublicKeyCredential') },
    ],
    [
      'platform authenticator API missing',
      {
        ...base,
        ...createBrowserEnvironment({
          PublicKeyCredential: class PublicKeyCredential {},
        }),
      },
    ],
    [
      'platform authenticator unavailable',
      {
        ...base,
        ...createBrowserEnvironment({
          PublicKeyCredential: class PublicKeyCredential {
            static async isUserVerifyingPlatformAuthenticatorAvailable() {
              return false
            }
          },
        }),
      },
    ],
  ]

  for (const [name, mockedGlobals] of failureCases) {
    assert.equal(
      await withMockedBrowserGlobals(mockedGlobals, () =>
        browserHasSovereignbaseDependencies()
      ),
      false,
      name
    )
  }
})
