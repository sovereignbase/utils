import fs from 'node:fs/promises'

import * as prettier from 'prettier'

function incrementSubtag(value) {
  const characters = [...value]

  for (let index = characters.length - 1; index >= 0; index--) {
    const character = characters[index]
    const first = character === character.toUpperCase() ? 'A' : 'a'
    const last = character === character.toUpperCase() ? 'Z' : 'z'

    if (character !== last) {
      characters[index] = String.fromCodePoint(character.codePointAt(0) + 1)
      return characters.join('')
    }

    characters[index] = first
  }

  throw new Error(`Cannot increment ${value}`)
}

function expandSubtag(value) {
  if (!value.includes('..')) return [value]

  const [start, end] = value.split('..')
  const values = []
  let current = start

  while (true) {
    values.push(current)
    if (current === end) return values
    current = incrementSubtag(current)
  }
}

export async function fetchBCP47LanguageTag() {
  const response = await fetch(
    'https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry'
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch BCP 47 subtags: ${response.status}`)
  }
  const registry = (await response.text()).replaceAll('\r\n', '\n').trim()
  const records = registry.split('\n%%\n')
  const tags = []

  for (const record of records) {
    const type = /^Type: (.+)$/mu.exec(record)?.[1]
    const subtag = /^Subtag: (.+)$/mu.exec(record)?.[1]
    const tag = /^Tag: (.+)$/mu.exec(record)?.[1]

    if (type === 'language' && subtag) tags.push(...expandSubtag(subtag))
    if ((type === 'grandfathered' || type === 'redundant') && tag) {
      tags.push(tag)
    }
  }

  return [...new Set(tags)]
}

function union(name, values) {
  return `${name} = ${values.map(JSON.stringify).join(' | ')}`
}

async function main() {
  const tags = await fetchBCP47LanguageTag()
  const source = [
    "import type { UnicodeLocaleIdentifier } from '../UnicodeLocaleIdentifier/index.js'",
    '/** Represents an IANA-registered or Unicode CLDR BCP 47 language tag. */',
    `${union('export type BCP47LanguageTag', tags)} | UnicodeLocaleIdentifier`,
  ].join('\n\n')
  const prettierOptions =
    (await prettier.resolveConfig('src/BCP47LanguageTag/index.ts')) ?? {}
  const file = await prettier.format(source, {
    ...prettierOptions,
    parser: 'typescript',
  })

  await fs.mkdir('src/BCP47LanguageTag/', { recursive: true })
  await fs.writeFile('src/BCP47LanguageTag/index.ts', file)

  const exportLine = await prettier.format(
    `export { type BCP47LanguageTag } from './BCP47LanguageTag/index.js'`,
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
