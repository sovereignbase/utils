export type UtilsErrorCode = 'EXAMPLE_ERROR_CODE'

export class UtilsError extends Error {
  readonly code: UtilsErrorCode

  constructor(code: UtilsErrorCode, message?: string) {
    const detail = message ?? code
    super(`{@sovereignbase/utils} ${detail}`)
    this.code = code
    this.name = 'UtilsError'
  }
}
