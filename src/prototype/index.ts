/**
 * Represents the normalized runtime tag returned by {@link prototype}.
 */
export type Prototype =
  | 'null'
  | 'undefined'
  | 'boolean'
  | 'string'
  | 'symbol'
  | 'number'
  | 'bigint'
  | 'function'
  | 'record'
  | 'array'
  | 'map'
  | 'set'
  | 'weakmap'
  | 'weakset'
  | 'date'
  | 'regexp'
  | 'error'
  | 'promise'
  | 'arraybuffer'
  | 'sharedarraybuffer'
  | 'dataview'
  | 'int8array'
  | 'uint8array'
  | 'uint8clampedarray'
  | 'int16array'
  | 'uint16array'
  | 'int32array'
  | 'uint32array'
  | 'float32array'
  | 'float64array'
  | 'bigint64array'
  | 'biguint64array'
  | 'url'
  | 'urlsearchparams'
  | 'headers'
  | 'request'
  | 'response'
  | 'formdata'
  | 'blob'
  | 'file'
  | 'readablestream'
  | 'writablestream'
  | 'transformstream'
  | 'unknown'

const prototypes = new Set<Prototype>([
  'null',
  'undefined',
  'boolean',
  'string',
  'symbol',
  'number',
  'bigint',
  'function',
  'record',
  'array',
  'map',
  'set',
  'weakmap',
  'weakset',
  'date',
  'regexp',
  'error',
  'promise',
  'arraybuffer',
  'sharedarraybuffer',
  'dataview',
  'int8array',
  'uint8array',
  'uint8clampedarray',
  'int16array',
  'uint16array',
  'int32array',
  'uint32array',
  'float32array',
  'float64array',
  'bigint64array',
  'biguint64array',
  'url',
  'urlsearchparams',
  'headers',
  'request',
  'response',
  'formdata',
  'blob',
  'file',
  'readablestream',
  'writablestream',
  'transformstream',
  'unknown',
])

/**
 * Returns a normalized lowercase tag for the runtime category of `value`.
 *
 * Primitive values are classified with `typeof`. Objects and built-in platform
 * values are classified with `Object.prototype.toString`.
 *
 * @param value The value to classify.
 * @returns A normalized runtime tag such as `"string"`, `"record"`, `"url"`, or `"unknown"`.
 */
export function prototype(value: any): Prototype {
  let type: string = typeof value

  if (type === 'object') {
    type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
  }

  if (type === 'object') type = 'record'

  if (!prototypes.has(type as Prototype)) {
    type = 'unknown'
  }

  return type as Prototype
}
