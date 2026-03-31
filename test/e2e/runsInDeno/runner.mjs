import * as api from '../../../dist/index.js'
import { ensurePassing, printResults, runUtilsSuite } from '../shared/suite.mjs'

const results = await runUtilsSuite(api, {
  label: 'deno esm',
  runtimeGlobals: globalThis,
})
printResults(results)
ensurePassing(results)
