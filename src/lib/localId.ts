/**
 * Generates an identifier for local-only records.
 * `crypto.randomUUID()` is unavailable on HTTP LAN origins, while Vite Dev
 * Local intentionally runs over HTTP for quick phone/device testing.
 */
export function createLocalId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  // This fallback is for ephemeral local records only; it is never used for
  // credentials, OAuth tokens, or other security-sensitive values.
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}
