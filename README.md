[![npm version](https://img.shields.io/npm/v/@sovereignbase/utils)](https://www.npmjs.com/package/@sovereignbase/utils)
[![CI](https://github.com/sovereignbase/utils/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/sovereignbase/utils/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/sovereignbase/utils/branch/master/graph/badge.svg)](https://codecov.io/gh/sovereignbase/utils)
[![license](https://img.shields.io/npm/l/@sovereignbase/utils)](LICENSE)

# utils

Shared TypeScript utilities for removing repeated code across Sovereignbase codebases.

## Compatibility

- Runtimes: modern JavaScript runtimes; the repository includes runtime compatibility tests for Node, Bun, Deno, Cloudflare Workers, Edge Runtime, and browsers.
- Module format: ESM and CommonJS.
- Required globals / APIs: `structuredClone` is required for successful `safeStructuredClone()` results.
- Browser capability checks: `browserHasSovereignbaseDependencies()` resolves to `false` outside secure browser contexts and when required browser APIs are missing.
- TypeScript: bundled types.

## Goals

- Remove repeated utility code from Sovereignbase repositories.
- Keep shared helpers small, explicit, and side-effect free.
- Validate behavior across the runtimes used in Sovereignbase projects.

## Installation

```sh
npm install @sovereignbase/utils
# or
pnpm add @sovereignbase/utils
# or
yarn add @sovereignbase/utils
# or
bun add @sovereignbase/utils
# or
deno add jsr:@sovereignbase/utils
# or
vlt install jsr:@sovereignbase/utils
```

## Usage

### `prototype()`

```ts
import { prototype } from '@sovereignbase/utils'

prototype(null) // 'null'
prototype({ ok: true }) // 'record'
prototype(new URL('https://sovereignbase.dev')) // 'url'
```

Returns a normalized lowercase runtime tag for common primitives, serializable built-ins, and selected platform objects.

### `isUuidV7()`

```ts
import { isUuidV7 } from '@sovereignbase/utils'

const value = '018f0d1e-6c82-7d4b-91c1-8a7b5e2f4a10'

if (isUuidV7(value)) {
  value // string, confirmed UUID v7
}
```

Checks that a value is a syntactically valid UUID version 7 string.

### `isUuidV7BigInt()`

```ts
import { isUuidV7BigInt } from '@sovereignbase/utils'

const value = 0x018f0d1e6c827d4b91c18a7b5e2f4a10n

if (isUuidV7BigInt(value)) {
  value // bigint, confirmed UUID v7 bit layout
}
```

Checks that a bigint is inside the 128-bit UUID range and has UUID version 7 and RFC 4122 variant bits.

### `isRecord()`

```ts
import { isRecord } from '@sovereignbase/utils'

const value: unknown = { ok: true }

if (isRecord(value)) {
  value.ok // unknown
}
```

Checks that a value is a plain object record: non-null, not an array, and backed by an `Object` constructor prototype.

### `isUint32()`

```ts
import {
  isUint32,
  UINT32_MIN,
  UINT32_MAX,
  UINT32_SIZE,
} from '@sovereignbase/utils'

const value: unknown = 4_294_967_295

if (isUint32(value)) {
  value // number, confirmed unsigned 32-bit integer
}
```

Checks that a value is a JavaScript number representing an integer in the inclusive unsigned 32-bit range, `0` through `2^32 - 1`.

### `safeBigIntFromString()`

```ts
import { safeBigIntFromString } from '@sovereignbase/utils'

const result = safeBigIntFromString('9007199254740993')

if (result !== false) {
  result // 9007199254740993n
}
```

Converts a string to a bigint using JavaScript `BigInt()` string conversion semantics and returns `false` instead of throwing for invalid input.

### `uuidV7BigIntStringToBigInt()`

```ts
import { uuidV7BigIntStringToBigInt } from '@sovereignbase/utils'

const value = uuidV7BigIntStringToBigInt(
  '2071992528307252230503468673270762000'
)

if (value !== false) {
  value // bigint, confirmed UUID v7 bit layout
}
```

Converts a bigint string to a bigint and returns it only when the resulting value has a UUID v7 bit layout.

### `safeStructuredClone()`

```ts
import { safeStructuredClone } from '@sovereignbase/utils'

const result = safeStructuredClone({ ok: true, nested: { count: 1 } })

if (result[0]) {
  const clone = result[1]
  clone // deep cloned value
}
```

Attempts a structured clone and returns a tuple instead of throwing on unsupported values.

### `getISO31661Alpha2CountryCodeSet()`

```ts
import {
  type ISO31661Alpha2,
  getISO31661Alpha2CountryCodeSet,
} from '@sovereignbase/country-codes'

function epicFunction1(countryCode: ISO31661Alpha2) {
  const countryCodes = getISO31661Alpha2CountryCodeSet()
  const isCountryCode = countryCodes.has(countryCode)
  if (!isCountryCode) throw new Error('THAT IS NOT A COUNTRY CODE DUDE!')
  console.log('EPIC COUNTRY CODE MOMENT:', countryCode)
}
```

Returns a fresh `Set` containing all supported ISO 3166-1 alpha-2 country codes.

### `browserHasSovereignbaseDependencies()`

```ts
import { browserHasSovereignbaseDependencies } from '@sovereignbase/utils'

if (await browserHasSovereignbaseDependencies()) {
  console.log('browser runtime supports Sovereignbase dependencies')
}
```

Checks whether the current browser environment exposes the secure-context, storage, worker, notification, Web Crypto, and WebAuthn APIs required by Sovereignbase browser features.

### `afterIdleFor()`

```ts
import { afterIdleFor } from '@sovereignbase/utils'

const saveAfterTypingStops = afterIdleFor(500, () => {
  console.log('save draft')
})

document.addEventListener('input', saveAfterTypingStops)
```

Creates a function that resets a timer on every call and runs the callback after the requested idle timeout.

## Tests

- Latest local `npm exec --yes --package deno -- npm run test` run passed on Node `v24.16.0`.
- Node unit suite: `16/16` passed.
- Node integration suite: `2/2` passed.
- Coverage: `100%` statements, branches, functions, and lines.
- Runtime E2E: Node ESM `18/18` passed.
- Runtime E2E: Node CJS `18/18` passed.
- Runtime E2E: Bun ESM `18/18` passed.
- Runtime E2E: Bun CJS `18/18` passed.
- Runtime E2E: Deno ESM `18/18` passed.
- Runtime E2E: Cloudflare Workers ESM `18/18` passed.
- Runtime E2E: Edge Runtime ESM `18/18` passed.
- Browser E2E: `5/5` Playwright projects passed (`chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari`).

## Benchmarks

- Latest local `npm run bench` run: Node `v24.16.0` on `win32 x64`.
  | Function / scenario | ops/sec | ms/op |
  | ----------------------------------- | ----------: | ----------: |
  | `prototype(record)` | 10,048,999 | 0.000099512 |
  | `prototype(url)` | 4,919,298 | 0.000203281 |
  | `isRecord(record)` | 22,128,887 | 0.000045190 |
  | `isRecord(array)` | 135,978,570 | 0.000007354 |
  | `isUint32(valid)` | 143,928,381 | 0.000006948 |
  | `isUint32(invalid)` | 148,897,045 | 0.000006716 |
  | `isUuidV7(valid)` | 4,852,110 | 0.000206096 |
  | `isUuidV7(invalid)` | 5,036,241 | 0.000198561 |
  | `isUuidV7BigInt(valid)` | 17,177,054 | 0.000058217 |
  | `isUuidV7BigInt(invalid)` | 26,694,821 | 0.000037460 |
  | `safeBigIntFromString(valid)` | 10,009,579 | 0.000099904 |
  | `safeBigIntFromString(invalid)` | 101,179 | 0.009883494 |
  | `uuidV7BigIntStringToBigInt(valid)` | 5,583,083 | 0.000179113 |
  | `uuidV7BigIntStringToBigInt(invalid)` | 5,467,959 | 0.000182884 |
  | `getISO31661Alpha2CountryCodeSet()` | 108,364 | 0.009228138 |
  | `safeStructuredClone(record)` | 226,794 | 0.004409285 |
  | `safeStructuredClone(function)` | 47,082 | 0.021239342 |
  | `afterIdleFor(callback)` | 2,602,432 | 0.000384256 |

- Results vary by machine.

## License

Apache-2.0
