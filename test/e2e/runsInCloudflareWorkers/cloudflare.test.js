import { expect, test } from 'vitest'

import * as api from '../../../dist/index.js'
import { runUtilsSuite } from '../shared/suite.mjs'

test('runs the public API in Cloudflare Workers', async () => {
  const results = await runUtilsSuite(api, {
    label: 'cloudflare-workers esm',
    runtimeGlobals: globalThis,
  })

  expect(results.errors).toEqual([])
  expect(results.ok).toBe(true)
})
