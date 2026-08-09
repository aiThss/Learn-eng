import { useCallback, useState } from 'react'
import type { ReleaseManifest } from '@/services/release/updateCheck'
import {
  downloadAndInstallApk,
  getApkUpdateErrorMessage,
  type DownloadProgress,
} from '@/services/release/apkUpdater'

export function useApkUpdate() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startUpdate = useCallback(async (release: Pick<ReleaseManifest, 'downloadUrl' | 'sha256' | 'apkName'>) => {
    setIsDownloading(true)
    setProgress(null)
    setError(null)

    try {
      return await downloadAndInstallApk(release, setProgress)
    } catch (updateError) {
      setError(getApkUpdateErrorMessage(updateError))
      return null
    } finally {
      setIsDownloading(false)
    }
  }, [])

  const progressLabel = progress && progress.totalBytes > 0
    ? `Đang tải bản cập nhật… ${progress.percent}%`
    : 'Đang chuẩn bị tải bản cập nhật…'

  return { error, isDownloading, progressLabel, startUpdate }
}
