[![npm version](https://img.shields.io/npm/v/@sovereignbase/utils)](https://www.npmjs.com/package/@sovereignbase/utils)
[![JSR](https://jsr.io/badges/@sovereignbase/utils)](https://jsr.io/@sovereignbase/utils)
[![CI](https://github.com/sovereignbase/utils/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/sovereignbase/utils/actions/workflows/ci.yaml)
[![codecov](https://codecov.io/gh/sovereignbase/utils/branch/master/graph/badge.svg)](https://codecov.io/gh/sovereignbase/utils)
[![license](https://img.shields.io/npm/l/@sovereignbase/utils)](LICENSE)

# utils

Shared TypeScript utilities for removing repeated code across Sovereignbase codebases.

## Compatibility

- Runtimes: modern JavaScript runtimes; the repository includes runtime compatibility tests for Node, Bun, Deno, Cloudflare Workers, Edge Runtime, and browsers.
- Module format: ESM and CommonJS.
- Required globals / APIs: Web Crypto is required by `deriveBytes()`,
  `EventTarget` and `CustomEvent` are required by `LanguageBroker`, and
  `structuredClone` is required for successful `safeStructuredClone()` results.
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

### `deriveBytes()`

```ts
import { deriveBytes } from '@sovereignbase/utils'

const encoder = new TextEncoder()
const bytes = await deriveBytes(
  encoder.encode('account-1'),
  encoder.encode('profile-encryption'),
  32
)
```

Derives a deterministic number of domain-separated bytes with HKDF-SHA-256.
Identical base, domain, and length inputs produce identical output. Use a
distinct domain for each purpose.

### `prototype()`

```ts
import { prototype } from '@sovereignbase/utils'

prototype(null) // 'null'
prototype({ ok: true }) // 'record'
prototype(new URL('https://sovereignbase.dev')) // 'url'
```

Returns a normalized lowercase runtime tag for common primitives, serializable built-ins, and selected platform objects.

### `isRecord()`

```ts
import { isRecord } from '@sovereignbase/utils'

const value: unknown = { ok: true }

if (isRecord(value)) {
  value.ok // unknown
}
```

Checks that a value is a plain object record: non-null, not an array, and backed by an `Object` constructor prototype.

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
} from '@sovereignbase/utils'

function epicFunction1(countryCode: ISO31661Alpha2) {
  const countryCodes = getISO31661Alpha2CountryCodeSet()
  const isCountryCode = countryCodes.has(countryCode)
  if (!isCountryCode) throw new Error('THAT IS NOT A COUNTRY CODE DUDE!')
  console.log('EPIC COUNTRY CODE MOMENT:', countryCode)
}
```

Returns a fresh `Set` containing all supported ISO 3166-1 alpha-2 country codes.

### `BCP47LanguageTag`

```ts
import { type BCP47LanguageTag } from '@sovereignbase/utils'

function setDocumentLanguage(languageTag: BCP47LanguageTag) {
  document.documentElement.lang = languageTag
}

setDocumentLanguage('en-US')
```

Provides IANA-registered standalone language tags and Unicode CLDR locale tags, including region, script, and variant forms, without adding runtime code to the package.

### `LanguageBroker`

```ts
import { LanguageBroker } from '@sovereignbase/utils'

const languages = new LanguageBroker(
  'en-US',
  ['en-US', 'fi-FI'],
  (language) => {
    document.documentElement.lang = language
  }
)

languages.addEventListener('change', (event) => {
  console.log(`Language changed to ${event.detail}`)
})

languages.set('fi-FI')
languages.get() // 'fi-FI'
[...languages.list()] // ['en-US', 'fi-FI']
```

Keeps the current BCP 47 language tag within an inferred set of supported languages and reports updates through an optional callback and typed `change` events. `get()`, `set()`, `list()`, callbacks, and event details all preserve the supported-language union.

### `UnicodeLocaleIdentifier`

```ts
import { type UnicodeLocaleIdentifier } from '@sovereignbase/utils'

function formatDate(locale: UnicodeLocaleIdentifier, date: Date) {
  return new Intl.DateTimeFormat(locale).format(date)
}

formatDate('fi-FI', new Date())
```

Provides the locale identifiers backed by Unicode CLDR locale data, including default-content identifiers such as `en-US`.

### `OpenGraphLocale`

```ts
import { type OpenGraphLocale } from '@sovereignbase/utils'

function localeMeta(locale: OpenGraphLocale) {
  return `<meta property="og:locale" content="${locale}">`
}

localeMeta('fi_FI')
```

Provides CLDR-backed Open Graph locales in the protocol's `language_TERRITORY` format.

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

- Unit and integration tests in Vitest with 100% statement, branch, function,
  and line coverage.
- Public TypeScript API typechecks under the package's strict configuration.
- Browser E2E tests in Chromium, Firefox, WebKit, Mobile Chromium, Mobile
  Firefox, and Mobile WebKit.
- Runtime E2E tests in Node.js ESM and CommonJS, Bun ESM and CommonJS, Deno,
  Vercel Edge Runtime, and Cloudflare Workers (`workerd`).

## API documentation

TypeDoc documentation is generated into `docs/` by `npm run build:docs` and as
part of the normal build.

## Benchmarks

Run `npm run bench` to benchmark the synchronous utility paths on the current
machine.

## License

Apache-2.0
