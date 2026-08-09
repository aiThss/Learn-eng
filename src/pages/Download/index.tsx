import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, Download, ExternalLink, QrCode, ShieldCheck, Smartphone } from 'lucide-react'
import { ANDROID_RELEASE } from '@/config/release'
import { useApkUpdate } from '@/components/updates/useApkUpdate'
import { getLatestReleaseManifest } from '@/services/release/updateCheck'

export default function DownloadPage() {
  const apkUpdate = useApkUpdate()
  const [checkingRelease, setCheckingRelease] = useState(false)
  const [releaseError, setReleaseError] = useState<string | null>(null)

  const handleDownload = async () => {
    setCheckingRelease(true)
    setReleaseError(null)
    const release = await getLatestReleaseManifest()
    setCheckingRelease(false)

    if (!release) {
      setReleaseError('Không thể xác minh bản APK mới nhất. Hãy kiểm tra kết nối rồi thử lại.')
      return
    }

    void apkUpdate.startUpdate(release)
  }

  return (
    <div className="min-h-full bg-background px-4 py-6 text-foreground sm:px-6">
      <section className="mx-auto max-w-lg space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Smartphone className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-primary">ENGLISHUP FOR ANDROID</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Tải ứng dụng an toàn</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Quét mã QR bằng camera điện thoại hoặc mở liên kết chính thức bên dưới.
          </p>
        </div>

        <div className="card-elevated p-5 text-center">
          <div className="mx-auto mb-4 flex w-fit rounded-2xl bg-white p-3 shadow-sm">
            <QRCodeSVG
              value={ANDROID_RELEASE.downloadUrl}
              size={200}
              level="M"
              includeMargin
              aria-label="Mã QR tải EnglishUp cho Android"
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            <QrCode className="h-4 w-4 text-primary" aria-hidden="true" />
            Quét để tải EnglishUp v{ANDROID_RELEASE.version}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={checkingRelease || apkUpdate.isDownloading}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Download className="h-5 w-5" aria-hidden="true" />
          {checkingRelease || apkUpdate.isDownloading ? apkUpdate.progressLabel : `Tải và cập nhật APK v${ANDROID_RELEASE.version}`}
        </button>

        {apkUpdate.isDownloading && <p className="text-center text-sm text-muted-foreground">{apkUpdate.progressLabel}</p>}
        {apkUpdate.error && <p className="text-center text-sm leading-6 text-destructive">{apkUpdate.error}</p>}
        {releaseError && <p className="text-center text-sm leading-6 text-destructive">{releaseError}</p>}

        <div className="card-elevated space-y-3 p-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
            Kiểm tra trước khi cài đặt
          </div>
          <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />Chỉ tải từ repository GitHub chính thức của EnglishUp.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />Xác nhận tên tệp: <span className="font-mono text-foreground">{ANDROID_RELEASE.apkName}</span>.</li>
            <li className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />Đối chiếu SHA-256 trong tệp <span className="font-mono text-foreground">.sha256</span> trước khi cài.</li>
          </ul>
          <a
            href={ANDROID_RELEASE.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Mở thư mục phát hành <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  )
}
