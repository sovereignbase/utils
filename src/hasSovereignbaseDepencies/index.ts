export function hasSovereignbaseDepencies(): boolean {
  return (
    typeof window !== 'undefined' &&
    'showDirectoryPicker' in window &&
    window.isSecureContext
  )
}
