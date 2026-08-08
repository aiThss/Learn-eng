import { APP_RELEASE } from '@/config/release'

export interface ReleaseManifest {
  version: string
  versionCode: number
  apkName: string
  downloadUrl: string
  sha256: string
  publishedAt: string
}

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

/**
 * Kiểm tra metadata phát hành có timeout ngắn. Mọi lỗi mạng đều im lặng để
 * việc mở bài học offline không bị chặn hay hiện thông báo lỗi không cần thiết.
 */
export async function checkForAppUpdate(): Promise<ReleaseManifest | null> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(APP_RELEASE.updateManifestUrl, {
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!response.ok) return null

    const manifest: unknown = await response.json()
    if (!isReleaseManifest(manifest)) return null

    return manifest.versionCode > APP_RELEASE.versionCode ? manifest : null
  } catch {
    return null
  } finally {
    window.clearTimeout(timeoutId)
  }
}
