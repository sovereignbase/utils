import * as prettier from 'prettier'
import fs from 'fs/promises'
import { readFile } from 'fs'

export async function fetchISO31661Alpha2() {
  const raw = await fetch('https://datahub.io/core/country-list/r/data.csv')
  const csv = (await raw.text()).trim()
  const rows = csv.split('\n')
  void rows.shift()
  return rows
}

async function main() {
  let union = `export type ISO31661Alpha2 = `
  let set = `export function getISO31661Alpha2CountryCodeSet():Set<ISO31661Alpha2>{return new Set([`
  const codes = await fetchISO31661Alpha2()
  let times = codes.length
  for (const code of codes) {
    times--
    const popped = code.split(',').pop()
    union += `"${popped}"${times === 0 ? '' : ' | '}`
    set += `"${popped}"${times === 0 ? '' : ', '}`
  }
  const file = union + '\n\n' + set + '])}'
  const pretty = await prettier.format(file, { parser: 'typescript' })
  await fs.mkdir('src/ISO31661Alpha2/', { recursive: true })
  await fs.writeFile('src/ISO31661Alpha2/index.ts', pretty)

  const exportLine = await prettier.format(
    `export { type ISO31661Alpha2, getISO31661Alpha2CountryCodeSet } from './ISO31661Alpha2/index.js'`,
    { parser: 'typescript' }
  )
  let exports = await fs.readFile('src/index.ts')
  if (!exports.includes(exportLine)) {
    exports += exportLine
    await fs.writeFile('src/index.ts', exports)
  }
}

main().catch((err) => console.error(err))
