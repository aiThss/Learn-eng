/**
 * Nguồn phát hành APK chính thức. App Android đọc manifest này khi khởi động
 * để chỉ hiện lời mời cập nhật khi versionCode trên GitHub mới hơn bản đang dùng.
 */
export const APP_RELEASE = {
  version: '0.1.4',
  versionCode: 6,
  updateManifestUrl:
    'https://raw.githubusercontent.com/aiThss/Learn-eng/main/releases/latest.json',
} as const

/** Thông tin một nguồn phát hành APK duy nhất, dùng cho QR và trang tải xuống. */
export const ANDROID_RELEASE = {
  version: APP_RELEASE.version,
  apkName: 'EnglishUp-v0.1.4.apk',
  downloadUrl:
    'https://raw.githubusercontent.com/aiThss/Learn-eng/main/releases/EnglishUp-v0.1.4.apk',
  releaseUrl: 'https://github.com/aiThss/Learn-eng/tree/main/releases',
} as const
