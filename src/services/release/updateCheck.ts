import { APP_RELEASE } from '@/config/release'

export interface ReleaseManifest {
  version: string
  versionCode: number
  apkName: string
  downloadUrl: string
  sha256: string
  publishedAt: string
}

export type ReleaseCheckResult =
  | { status: 'available'; release: ReleaseManifest }
  | { status: 'up-to-date'; release: ReleaseManifest }
  | { status: 'unavailable' }

const REQUEST_TIMEOUT_MS = 6_000

function isTrustedDownloadUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'raw.githubusercontent.com'
  } catch {
    return false
  }
}

function isReleaseManifest(value: unknown): value is ReleaseManifest {
  if (!value || typeof value !== 'object') return false
  const manifest = value as Partial<ReleaseManifest>
  const versionCode = manifest.versionCode

  return (
    typeof manifest.version === 'string' &&
    typeof versionCode === 'number' &&
    Number.isInteger(versionCode) &&
    versionCode > 0 &&
    typeof manifest.apkName === 'string' &&
    isTrustedDownloadUrl(manifest.downloadUrl) &&
    typeof manifest.sha256 === 'string' &&
    typeof manifest.publishedAt === 'string'
  )
}

/** Fetches and validates the signed-release manifest without comparing its version. */
export async function getLatestReleaseManifest(): Promise<ReleaseManifest | null> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(APP_RELEASE.updateManifestUrl, {
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!response.ok) return null

    const manifest: unknown = await response.json()
    return isReleaseManifest(manifest) ? manifest : null
  } catch {
    return null
  } finally {
    window.clearTimeout(timeoutId)
  }
}

/**
 * Kiểm tra metadata phát hành có timeout ngắn. Mọi lỗi mạng đều im lặng để
 * việc mở bài học offline không bị chặn hay hiện thông báo lỗi không cần thiết.
 */
export async function getReleaseCheckResult(): Promise<ReleaseCheckResult> {
  const manifest = await getLatestReleaseManifest()
  if (!manifest) return { status: 'unavailable' }

  return manifest.versionCode > APP_RELEASE.versionCode
    ? { status: 'available', release: manifest }
    : { status: 'up-to-date', release: manifest }
}

/** Backwards-compatible lightweight check used by the startup prompt. */
export async function checkForAppUpdate(): Promise<ReleaseManifest | null> {
  const result = await getReleaseCheckResult()
  return result.status === 'available' ? result.release : null
}
