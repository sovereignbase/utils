import {
  daysAsMilliseconds,
  deriveBytes,
  getISO31661Alpha2CountryCodeSet,
  isRecord,
  LanguageBroker,
  prototype,
  safeStructuredClone,
  type BCP47LanguageTag,
  type ISO31661Alpha2,
  type OpenGraphLocale,
  type Prototype,
  type UnicodeLocaleIdentifier,
  waitFor,
} from '../../src/index.js'

const milliseconds: number = daysAsMilliseconds(2)
const waiting: Promise<void> = waitFor(0)
const bytes: Promise<Uint8Array<ArrayBuffer>> = deriveBytes(
  new Uint8Array(),
  new Uint8Array(),
  32
)
const countryCodes: Set<ISO31661Alpha2> = getISO31661Alpha2CountryCodeSet()
const languageBroker = new LanguageBroker(
  'en-US',
  ['en-US', 'fi-FI'],
  (language) => {
    const changedLanguage: 'en-US' | 'fi-FI' = language
    void changedLanguage
  }
)
const currentLanguage: 'en-US' | 'fi-FI' = languageBroker.get()
const supportedLanguages: SetIterator<'en-US' | 'fi-FI'> = languageBroker.list()
const detectedLanguage: string = 'fi-FI'
if (languageBroker.has(detectedLanguage)) {
  const supportedLanguage: 'en-US' | 'fi-FI' = detectedLanguage
  languageBroker.set(supportedLanguage)
}
languageBroker.addEventListener('change', (event) => {
  const changedLanguage: 'en-US' | 'fi-FI' = event.detail
  void changedLanguage
})
languageBroker.set('fi-FI')
// @ts-expect-error the language is valid BCP 47 but is not supported by this broker
languageBroker.set('sv-SE')
const fallbackLanguage: 'en-US' | 'fi-FI' = new LanguageBroker('sv-SE', [
  'en-US',
  'fi-FI',
]).get()
// @ts-expect-error at least one supported language is required
new LanguageBroker('en-US', [])
const languageTag: BCP47LanguageTag = 'fi'
const regionalLanguageTag: BCP47LanguageTag = 'en-US'
const privateUseLanguageTag: BCP47LanguageTag = 'qaa'
const numericRegionLanguageTag: BCP47LanguageTag = 'es-419'
const scriptAndRegionLanguageTag: BCP47LanguageTag = 'sr-Latn-RS'
const variantLanguageTag: BCP47LanguageTag = 'ca-ES-valencia'
const grandfatheredLanguageTag: BCP47LanguageTag = 'i-klingon'
// @ts-expect-error unknown regions are not BCP 47 region subtags
const invalidRegionalLanguageTag: BCP47LanguageTag = 'en-USA'
const locale: UnicodeLocaleIdentifier = 'en-US'
const regionalLocale: UnicodeLocaleIdentifier = 'fi-FI'
const scriptAndRegionLocale: UnicodeLocaleIdentifier = 'zh-Hant-TW'
// @ts-expect-error grandfathered BCP 47 tags are not Unicode locale identifiers
const grandfatheredLocale: UnicodeLocaleIdentifier = 'i-klingon'
const openGraphLocale: OpenGraphLocale = 'en_US'
const finnishOpenGraphLocale: OpenGraphLocale = 'fi_FI'
// @ts-expect-error Open Graph locales use an underscore
const invalidOpenGraphLocale: OpenGraphLocale = 'en-US'
// @ts-expect-error Open Graph locales contain only language and territory
const invalidScriptOpenGraphLocale: OpenGraphLocale = 'zh_Hant_TW'
const tag: Prototype = prototype(countryCodes)
const unknownValue: unknown = tag

if (isRecord(unknownValue)) unknownValue.example

void bytes
void milliseconds
void waiting
void currentLanguage
void fallbackLanguage
void supportedLanguages
void languageTag
void regionalLanguageTag
void privateUseLanguageTag
void numericRegionLanguageTag
void scriptAndRegionLanguageTag
void variantLanguageTag
void grandfatheredLanguageTag
void invalidRegionalLanguageTag
void locale
void regionalLocale
void scriptAndRegionLocale
void grandfatheredLocale
void openGraphLocale
void finnishOpenGraphLocale
void invalidOpenGraphLocale
void invalidScriptOpenGraphLocale
void safeStructuredClone(countryCodes)
