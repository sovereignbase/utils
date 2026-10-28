/**
 * Removes the `readonly` modifier from an array or tuple type.
 *
 * Preserves the element types and tuple structure without modifying
 * the readonly modifiers of nested values.
 *
 * @typeParam T The array or tuple type to make writable.
 */
export type WritableArray<T extends readonly unknown[]> = [...T]

/**
 * Removes the `readonly` modifier from the properties of an object type.
 *
 * Preserves property types and optional modifiers. Nested properties
 * retain their original readonly modifiers.
 *
 * @typeParam T The object type to make writable.
 */
export type WritableObject<T extends object> = {
  -readonly [K in keyof T]: T[K]
}

/**
 * Recursively makes all properties of a type readonly.
 *
 * Applies to nested objects, arrays, and tuples. Function types are
 * preserved without modification.
 *
 * This is a compile-time constraint and does not prevent runtime mutations.
 *
 * @typeParam T The type to make deeply readonly.
 */
export type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T
