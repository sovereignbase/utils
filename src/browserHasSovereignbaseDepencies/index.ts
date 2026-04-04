export async function browserHasSovereignbaseDepencies(): Promise<boolean> {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof navigator !== 'undefined' &&
    navigator.credentials &&
    'showDirectoryPicker' in window &&
    'PublicKeyCredential' in window &&
    (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) &&
    typeof crypto !== 'undefined' &&
    crypto.subtle &&
    typeof crypto.getRandomValues === 'function' &&
    'indexedDB' in window
  )
}
