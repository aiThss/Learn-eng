import { useEffect, useState } from 'react'
import { Download, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { checkForAppUpdate, type ReleaseManifest } from '@/services/release/updateCheck'
import { supportsDailyStudyReminder } from '@/services/notifications/dailyReminder'
import { useApkUpdate } from './useApkUpdate'

/** Hiện một lần mỗi lần mở APK khi GitHub có bản Android mới hơn. */
export default function UpdateChecker() {
  const [availableRelease, setAvailableRelease] = useState<ReleaseManifest | null>(null)
  const apkUpdate = useApkUpdate()

  useEffect(() => {
    if (!supportsDailyStudyReminder()) return

    let isMounted = true
    const checkUpdate = async () => {
      const release = await checkForAppUpdate()
      if (isMounted) setAvailableRelease(release)
    }

    void checkUpdate()
    return () => {
      isMounted = false
    }
  }, [])

  if (!availableRelease) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/35 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:items-center sm:justify-center sm:pb-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-title"
        className="w-full max-w-md rounded-[1.5rem] border border-border bg-card p-5 text-foreground shadow-elevated"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
            <RefreshCw className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={() => setAvailableRelease(null)}
            className="-mr-2 -mt-2 flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Để sau"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <h2 id="update-title" className="text-xl font-bold tracking-tight">
          Có bản EnglishUp mới
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          v{availableRelease.version} đã sẵn sàng. Cập nhật để nhận các cải tiến và bản sửa lỗi mới nhất.
        </p>

        <button
          type="button"
          onClick={() => void apkUpdate.startUpdate(availableRelease)}
          disabled={apkUpdate.isDownloading}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-700"
        >
          <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          {apkUpdate.isDownloading ? apkUpdate.progressLabel : `Tải và cập nhật v${availableRelease.version}`}
        </button>

        {apkUpdate.isDownloading && <p className="mt-3 text-center text-xs text-muted-foreground">{apkUpdate.progressLabel}</p>}
        {apkUpdate.error && <p className="mt-3 text-xs leading-5 text-destructive">{apkUpdate.error}</p>}

        <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
          Android sẽ giữ dữ liệu học khi bạn cài đè bằng đúng APK EnglishUp chính thức.
        </p>
      </section>
    </div>
  )
}
