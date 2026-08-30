/**
 * Small, runtime-portable utilities shared by Sovereignbase packages.
 *
 * The package exposes focused helpers for type inspection, deterministic byte
 * derivation, browser capability checks, cloning, and
 * scheduling without introducing runtime-specific state.
 *
 * @packageDocumentation
 */
export { deriveBytes } from './deriveBytes/index.js'
export { prototype, type Prototype } from './prototype/index.js'
export { safeStructuredClone } from './safeStructuredClone/index.js'
export {
  type ISO31661Alpha2,
  getISO31661Alpha2CountryCodeSet,
} from './ISO31661Alpha2/index.js'
export { browserHasSovereignbaseDependencies } from './browserHasSovereignbaseDependencies/index.js'
export { afterIdleFor } from './afterIdleFor/index.js'
export { isRecord } from './isRecord/index.js'
export { type BCP47LanguageTag } from './BCP47LanguageTag/index.js'
export { type UnicodeLocaleIdentifier } from './UnicodeLocaleIdentifier/index.js'
export { type OpenGraphLocale } from './OpenGraphLocale/index.js'
export {
  LanguageBroker,
  type LanguageEventListener,
  type LanguageEventListenerFor,
  type LanguageEventMap,
} from './LanguageBroker/index.js'
