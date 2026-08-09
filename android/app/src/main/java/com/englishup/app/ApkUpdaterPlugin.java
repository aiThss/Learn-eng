package com.englishup.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/** Downloads a checked EnglishUp APK inside the Capacitor app and hands it to Android's installer. */
@CapacitorPlugin(name = "ApkUpdater")
public class ApkUpdaterPlugin extends Plugin {
    private static final String TRUSTED_HOST = "raw.githubusercontent.com";
    private static final String TRUSTED_PATH_PREFIX = "/aiThss/Learn-eng/main/releases/";
    private static final int BUFFER_SIZE = 32 * 1024;
    private final AtomicBoolean downloading = new AtomicBoolean(false);
    private final ExecutorService downloadExecutor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        final String url = call.getString("url");
        final String checksum = call.getString("sha256");
        final String fileName = call.getString("fileName");

        if (!isTrustedReleaseUrl(url)) {
            call.reject("Nguồn tải APK không hợp lệ.", "UNTRUSTED_DOWNLOAD_URL");
            return;
        }

        if (checksum == null || !checksum.matches("(?i)^[a-f0-9]{64}$")) {
            call.reject("Mã kiểm tra APK không hợp lệ.", "INVALID_CHECKSUM");
            return;
        }

        if (fileName == null || !fileName.matches("^[A-Za-z0-9._-]+\\.apk$")) {
            call.reject("Tên tệp APK không hợp lệ.", "INVALID_FILE_NAME");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
            openInstallPermissionSettings();
            call.reject("Hãy cho phép EnglishUp cài ứng dụng từ nguồn này, rồi nhấn Cập nhật lại.", "INSTALL_PERMISSION_REQUIRED");
            return;
        }

        if (!downloading.compareAndSet(false, true)) {
            call.reject("Một bản cập nhật đang được tải.", "DOWNLOAD_IN_PROGRESS");
            return;
        }

        downloadExecutor.execute(() -> downloadVerifyAndInstall(call, url, checksum, fileName));
    }

    private void downloadVerifyAndInstall(PluginCall call, String url, String expectedChecksum, String fileName) {
        HttpURLConnection connection = null;
        File temporaryFile = null;

        try {
            File updateDirectory = new File(getContext().getCacheDir(), "updates");
            if (!updateDirectory.exists() && !updateDirectory.mkdirs()) {
                throw new IOException("Không tạo được vùng lưu APK tạm thời.");
            }

            File apkFile = new File(updateDirectory, fileName);
            temporaryFile = new File(updateDirectory, fileName + ".download");
            if (temporaryFile.exists() && !temporaryFile.delete()) {
                throw new IOException("Không thể dọn tệp tải dở trước đó.");
            }

            connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(15_000);
            connection.setReadTimeout(30_000);
            connection.setInstanceFollowRedirects(false);
            connection.setRequestProperty("Accept", "application/vnd.android.package-archive,application/octet-stream");

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("Máy chủ trả về lỗi " + responseCode + ".");
            }

            long totalBytes = connection.getContentLengthLong();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            long downloadedBytes = 0;
            long lastProgressBytes = 0;

            try (
                BufferedInputStream input = new BufferedInputStream(connection.getInputStream());
                BufferedOutputStream output = new BufferedOutputStream(new FileOutputStream(temporaryFile))
            ) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int read;
                while ((read = input.read(buffer)) != -1) {
                    output.write(buffer, 0, read);
                    digest.update(buffer, 0, read);
                    downloadedBytes += read;

                    if (downloadedBytes - lastProgressBytes >= BUFFER_SIZE || (totalBytes > 0 && downloadedBytes == totalBytes)) {
                        notifyProgress(downloadedBytes, totalBytes);
                        lastProgressBytes = downloadedBytes;
                    }
                }
            }

            String actualChecksum = toHex(digest.digest());
            if (!MessageDigest.isEqual(
                actualChecksum.getBytes(java.nio.charset.StandardCharsets.US_ASCII),
                expectedChecksum.toUpperCase(Locale.ROOT).getBytes(java.nio.charset.StandardCharsets.US_ASCII)
            )) {
                throw new ChecksumMismatchException();
            }

            if (apkFile.exists() && !apkFile.delete()) {
                throw new IOException("Không thể thay thế tệp APK cũ.");
            }
            if (!temporaryFile.renameTo(apkFile)) {
                throw new IOException("Không hoàn tất được tệp APK.");
            }
            temporaryFile = null;

            JSObject result = new JSObject();
            result.put("fileName", fileName);
            result.put("sizeBytes", downloadedBytes);
            result.put("sha256", actualChecksum);
            call.resolve(result);
            openPackageInstaller(apkFile);
        } catch (ChecksumMismatchException error) {
            call.reject("Tệp APK không khớp mã kiểm tra.", "CHECKSUM_MISMATCH", error);
        } catch (NoSuchAlgorithmException error) {
            call.reject("Thiết bị không hỗ trợ kiểm tra SHA-256.", "CHECKSUM_UNAVAILABLE", error);
        } catch (IOException error) {
            call.reject("Không thể tải APK: " + error.getMessage(), "DOWNLOAD_FAILED", error);
        } finally {
            if (connection != null) connection.disconnect();
            if (temporaryFile != null && temporaryFile.exists()) temporaryFile.delete();
            downloading.set(false);
        }
    }

    private void notifyProgress(long downloadedBytes, long totalBytes) {
        JSObject progress = new JSObject();
        progress.put("bytesDownloaded", downloadedBytes);
        progress.put("totalBytes", totalBytes);
        progress.put("percent", totalBytes > 0 ? Math.min(100, (int) ((downloadedBytes * 100) / totalBytes)) : 0);
        notifyListeners("downloadProgress", progress);
    }

    private void openInstallPermissionSettings() {
        getActivity().runOnUiThread(() -> {
            try {
                Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                settingsIntent.setData(Uri.parse("package:" + getContext().getPackageName()));
                getActivity().startActivity(settingsIntent);
            } catch (ActivityNotFoundException ignored) {
                // The JavaScript call explains the required permission if this settings page is unavailable.
            }
        });
    }

    private void openPackageInstaller(File apkFile) {
        getActivity().runOnUiThread(() -> {
            try {
                Uri apkUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    apkFile
                );
                Intent installIntent = new Intent(Intent.ACTION_VIEW);
                installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                getActivity().startActivity(installIntent);
            } catch (ActivityNotFoundException ignored) {
                // Android package installers are expected on supported devices; keep the verified file in cache if absent.
            }
        });
    }

    private boolean isTrustedReleaseUrl(String value) {
        if (value == null) return false;
        Uri uri = Uri.parse(value);
        return "https".equalsIgnoreCase(uri.getScheme())
            && TRUSTED_HOST.equalsIgnoreCase(uri.getHost())
            && uri.getPath() != null
            && uri.getPath().startsWith(TRUSTED_PATH_PREFIX)
            && uri.getPath().endsWith(".apk");
    }

    private String toHex(byte[] bytes) {
        StringBuilder output = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) output.append(String.format(Locale.ROOT, "%02X", value));
        return output.toString();
    }

    private static class ChecksumMismatchException extends Exception {}
}
