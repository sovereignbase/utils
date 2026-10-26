/** Removes the `readonly` modifier from an array or tuple type. */
export type WritableArray<T extends readonly unknown[]> = [...T]
