import { resolve } from 'node:path'
import { EdgeRuntime } from 'edge-runtime'
import { build } from 'esbuild'
import { ensurePassing, printResults, runUtilsSuite } from '../shared/suite.mjs'

const root = process.cwd()
const esmDistPath = resolve(root, 'dist', 'index.js')

function toExecutableEdgeEsm(bundleCode) {
  if (/\bimport\s+[\s\S]+?\bfrom\b/.test(bundleCode)) {
    throw new Error(
      'edge-runtime esm harness expects a single-file bundled dist/index.js'
    )
  }

  const exportMatch = bundleCode.match(
    /export\s*\{\s*([\s\S]*?)\s*\};\s*(\/\/# sourceMappingURL=.*)?\s*$/
  )
  if (!exportMatch) {
    throw new Error('edge-runtime esm harness could not find bundle exports')
  }

  const exportEntries = exportMatch[1]
    .split(',')
    .map((specifier) => specifier.trim())
    .filter(Boolean)
    .map((specifier) => {
      const [localName, exportedName] = specifier.split(/\s+as\s+/)
      return exportedName
        ? `${JSON.stringify(exportedName)}: ${localName}`
        : localName
    })
    .join(',\n  ')

  const sourceMapComment = exportMatch[2] ? `${exportMatch[2]}\n` : ''
  return (
    bundleCode.slice(0, exportMatch.index) +
    `globalThis.__utilsEsmExports = {\n  ${exportEntries}\n};\n` +
    sourceMapComment
  )
}

const runtime = new EdgeRuntime()
const bundled = await build({
  entryPoints: [esmDistPath],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  splitting: false,
  sourcemap: false,
  write: false,
})
const moduleCode = bundled.outputFiles[0]?.text
if (!moduleCode) {
  throw new Error('edge-runtime esm harness could not bundle dist/index.js')
}
runtime.evaluate(toExecutableEdgeEsm(moduleCode))

const results = await runUtilsSuite(runtime.context.__utilsEsmExports, {
  label: 'edge-runtime esm',
  runtimeGlobals: runtime.context,
})
printResults(results)
ensurePassing(results)
