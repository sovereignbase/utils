[![npm version](https://img.shields.io/npm/v/@sovereignbase/utils)](https://www.npmjs.com/package/@sovereignbase/utils)
[![CI](https://github.com/sovereignbase/utils/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/sovereignbase/utils/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/sovereignbase/utils/branch/master/graph/badge.svg)](https://codecov.io/gh/sovereignbase/utils)
[![license](https://img.shields.io/npm/l/@sovereignbase/utils)](LICENSE)

# utils

Shared TypeScript utilities for removing repeated code across Sovereignbase codebases.

## Compatibility

- Runtimes: modern JavaScript runtimes; the repository includes runtime compatibility tests for Node, Bun, Deno, Cloudflare Workers, Edge Runtime, and browsers.
- Module format: ESM and CommonJS.
- Required globals / APIs: no special platform APIs are required by the current exports.
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

## Tests

- Latest local `npm run test` run passed on Node `v22.14.0`.
- Node unit suite: `3/3` passed.
- Node integration suite: `2/2` passed.
- Coverage: `100%` statements, branches, functions, and lines.
- Runtime E2E: Node ESM `7/7` passed.
- Runtime E2E: Node CJS `7/7` passed.
- Runtime E2E: Bun ESM `7/7` passed.
- Runtime E2E: Bun CJS `7/7` passed.
- Runtime E2E: Deno ESM `7/7` passed.
- Runtime E2E: Cloudflare Workers ESM `7/7` passed.
- Runtime E2E: Edge Runtime ESM `7/7` passed.
- Browser E2E: `5/5` Playwright projects passed (`chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari`).

## Benchmarks

- Latest local `npm run bench` run: Node `v22.14.0` on `win32 x64`.
- `prototype(record)`: `12,833,527 ops/sec` (`155.8 ms`).
- `prototype(url)`: `5,451,708 ops/sec` (`366.9 ms`).
- `isUuidV7(valid)`: `5,656,844 ops/sec` (`176.8 ms`).
- `isUuidV7(invalid)`: `6,134,702 ops/sec` (`163.0 ms`).
- Results vary by machine.

## License

Apache-2.0
