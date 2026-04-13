/**
 * Checks whether the current browser environment exposes the APIs required by
 * Sovereignbase browser features.
 *
 * The check requires a secure browser context plus storage, worker,
 * notifications, Web Crypto, and WebAuthn platform authenticator support. It
 * resolves to `false` in non-browser runtimes and unsupported browsers.
 *
 * @returns A promise that resolves to `true` when the required browser
 * dependencies are available; otherwise, `false`.
 */
export async function browserHasSovereignbaseDependencies(): Promise<boolean> {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof navigator !== 'undefined' &&
    typeof navigator.credentials !== 'undefined' &&
    'indexedDB' in window &&
    'BroadcastChannel' in window &&
    'WebSocket' in window &&
    'AbortSignal' in window &&
    'EventTarget' in window &&
    'CustomEvent' in window &&
    'MessageEvent' in window &&
    'DOMException' in window &&
    'locks' in navigator &&
    'onLine' in navigator &&
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
