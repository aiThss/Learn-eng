/**
 * Nguồn phát hành APK chính thức. App Android đọc manifest này khi khởi động
 * để chỉ hiện lời mời cập nhật khi versionCode trên GitHub mới hơn bản đang dùng.
 */
export const APP_RELEASE = {
  version: '0.0.2',
  versionCode: 5,
  updateManifestUrl:
    'https://raw.githubusercontent.com/aiThss/Learn-eng/main/releases/latest.json',
} as const

/** Thông tin bản APK chính thức duy nhất của dòng ký phát hành hiện tại. */
export const ANDROID_RELEASE = {
  version: APP_RELEASE.version,
  apkName: 'EnglishUp-v0.0.2.apk',
  downloadUrl:
    'https://raw.githubusercontent.com/aiThss/Learn-eng/main/releases/EnglishUp-v0.0.2.apk',
  releaseUrl: 'https://github.com/aiThss/Learn-eng/tree/main/releases',
} as const
