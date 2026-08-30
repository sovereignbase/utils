import fs from 'node:fs/promises'

import * as prettier from 'prettier'

export async function fetchUnicodeLocaleIdentifier() {
  const [availableLocalesResponse, defaultContentResponse] = await Promise.all([
    fetch(
      'https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-core/availableLocales.json'
    ),
    fetch(
      'https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-core/defaultContent.json'
    ),
  ])

  if (!availableLocalesResponse.ok) {
    throw new Error(
      `Failed to fetch CLDR locales: ${availableLocalesResponse.status}`
    )
  }
  if (!defaultContentResponse.ok) {
    throw new Error(
      `Failed to fetch CLDR default locales: ${defaultContentResponse.status}`
    )
  }

  const availableLocales = await availableLocalesResponse.json()
  const defaultContent = await defaultContentResponse.json()

  return [
    ...new Set([
      ...availableLocales.availableLocales.full,
      ...defaultContent.defaultContent,
    ]),
  ]
}

async function main() {
  const locales = await fetchUnicodeLocaleIdentifier()
  const source = `/** Represents a locale identifier backed by Unicode CLDR locale data. */\nexport type UnicodeLocaleIdentifier = ${locales.map(JSON.stringify).join(' | ')}`
  const outputFile = 'src/UnicodeLocaleIdentifier/index.ts'
  const prettierOptions = (await prettier.resolveConfig(outputFile)) ?? {}
  const file = await prettier.format(source, {
    ...prettierOptions,
    parser: 'typescript',
  })

  await fs.mkdir('src/UnicodeLocaleIdentifier/', { recursive: true })
  await fs.writeFile(outputFile, file)

  const exportLine = await prettier.format(
    `export { type UnicodeLocaleIdentifier } from './UnicodeLocaleIdentifier/index.js'`,
    { ...prettierOptions, parser: 'typescript' }
  )
  let exports = await fs.readFile('src/index.ts', 'utf8')

  if (!exports.includes(exportLine)) {
    exports += exportLine
    await fs.writeFile('src/index.ts', exports)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
