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

## Tests

- Latest local `npm run test` run passed on Node `v22.14.0`.
- Node unit suite: `9/9` passed.
- Node integration suite: `2/2` passed.
- Coverage: `100%` statements, branches, functions, and lines.
- Runtime E2E: Node ESM `11/11` passed.
- Runtime E2E: Node CJS `11/11` passed.
- Runtime E2E: Bun ESM `11/11` passed.
- Runtime E2E: Bun CJS `11/11` passed.
- Runtime E2E: Deno ESM `11/11` passed.
- Runtime E2E: Cloudflare Workers ESM `11/11` passed.
- Runtime E2E: Edge Runtime ESM `11/11` passed.
- Browser E2E: `5/5` Playwright projects passed (`chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari`).

## Benchmarks

- Latest local `npm run bench` run: Node `v22.14.0` on `win32 x64`.
- `prototype(record)`: `4,882,423 ops/sec` (`409.6 ms`).
- `prototype(url)`: `2,626,656 ops/sec` (`761.4 ms`).
- `isUuidV7(valid)`: `2,366,821 ops/sec` (`422.5 ms`).
- `isUuidV7(invalid)`: `2,970,958 ops/sec` (`336.6 ms`).
- `getISO31661Alpha2CountryCodeSet()`: `35,059 ops/sec` (`1426.2 ms`).
- `safeStructuredClone(record)`: `57,335 ops/sec` (`4360.4 ms`).
- `safeStructuredClone(function)`: `12,678 ops/sec` (`19718.8 ms`).
- Results vary by machine.

## License

Apache-2.0
