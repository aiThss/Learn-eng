import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core'
import type { ReleaseManifest } from './updateCheck'

interface DownloadProgress {
  bytesDownloaded: number
  totalBytes: number
  percent: number
}

interface ApkInstallResult {
  fileName: string
  sizeBytes: number
  sha256: string
}

interface ApkUpdaterPlugin {
  downloadAndInstall(options: {
    url: string
    sha256: string
    fileName: string
  }): Promise<ApkInstallResult>
  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (progress: DownloadProgress) => void
  ): Promise<PluginListenerHandle>
}

const ApkUpdater = registerPlugin<ApkUpdaterPlugin>('ApkUpdater')

export function supportsInAppApkUpdate(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

/**
 * Android downloads the verified APK to its private cache, then invokes the
 * system package installer. Browsers/PWAs retain the ordinary direct-download
 * fallback because no native package installer is available there.
 */
export async function downloadAndInstallApk(
  release: Pick<ReleaseManifest, 'downloadUrl' | 'sha256' | 'apkName'>,
  onProgress: (progress: DownloadProgress) => void
): Promise<'native-installer-opened' | 'browser-download-started'> {
  if (!supportsInAppApkUpdate()) {
    window.location.assign(release.downloadUrl)
    return 'browser-download-started'
  }

  let listener: PluginListenerHandle | undefined

  try {
    listener = await ApkUpdater.addListener('downloadProgress', onProgress)
    await ApkUpdater.downloadAndInstall({
      url: release.downloadUrl,
      sha256: release.sha256,
      fileName: release.apkName,
    })
    return 'native-installer-opened'
  } finally {
    await listener?.remove()
  }
}

export function getApkUpdateErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('INSTALL_PERMISSION_REQUIRED')) {
    return 'Hãy cho phép EnglishUp cài ứng dụng từ nguồn này, rồi nhấn Cập nhật lại.'
  }

  if (message.includes('CHECKSUM_MISMATCH')) {
    return 'Tệp tải về không khớp mã kiểm tra. Bản cập nhật đã bị hủy để bảo vệ thiết bị.'
  }

  if (message.includes('DOWNLOAD_IN_PROGRESS')) {
    return 'Một bản cập nhật khác đang được tải.'
  }

  return 'Không thể tải bản cập nhật. Hãy kiểm tra kết nối rồi thử lại.'
}

export type { DownloadProgress }
