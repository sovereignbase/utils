import {
  deriveBytes,
  getISO31661Alpha2CountryCodeSet,
  isRecord,
  isUint32,
  isUuidV7,
  isUuidV7BigInt,
  prototype,
  safeBigIntFromString,
  safeStructuredClone,
  type ISO31661Alpha2,
  type Prototype,
} from '../../src/index.js'

const bytes: Promise<Uint8Array<ArrayBuffer>> = deriveBytes(
  new Uint8Array(),
  new Uint8Array(),
  32
)
const countryCodes: Set<ISO31661Alpha2> = getISO31661Alpha2CountryCodeSet()
const tag: Prototype = prototype(countryCodes)
const unknownValue: unknown = tag

if (isRecord(unknownValue)) unknownValue.example
if (isUint32(unknownValue)) unknownValue.toFixed()
if (isUuidV7(unknownValue)) unknownValue.toUpperCase()
if (isUuidV7BigInt(unknownValue)) unknownValue.toString()

void bytes
void safeBigIntFromString('42')
void safeStructuredClone(countryCodes)
