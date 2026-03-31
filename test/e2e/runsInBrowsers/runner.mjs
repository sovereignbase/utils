import * as api from '/dist/index.js'
import { printResults, runUtilsSuite } from '../shared/suite.mjs'

const results = await runUtilsSuite(api, {
  label: 'browser esm',
  runtimeGlobals: globalThis,
})
printResults(results)
window.__UTILS_RESULTS__ = results
const status = document.getElementById('status')
if (status) {
  status.textContent = results.ok ? 'ok' : `failed: ${results.errors.length}`
}
