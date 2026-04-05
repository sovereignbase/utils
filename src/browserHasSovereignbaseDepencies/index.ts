export async function browserHasSovereignbaseDepencies(): Promise<boolean> {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof navigator !== 'undefined' &&
    typeof navigator.credentials !== 'undefined' &&
    'showDirectoryPicker' in window &&
    'indexedDB' in window &&
    'BroadcastChannel' in window &&
    'WebSocket' in window &&
    'EventTarget' in window &&
    'CustomEvent' in window &&
    'Worker' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    typeof crypto !== 'undefined' &&
    !!crypto.subtle &&
    typeof crypto.randomUUID === 'function' &&
    typeof crypto.getRandomValues === 'function' &&
    'PublicKeyCredential' in window &&
    typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
      'function' &&
    (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
  )
}
