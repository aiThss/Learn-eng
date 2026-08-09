package com.englishup.app;

import android.app.Activity;
import android.content.Intent;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;

/** Native Google account selector for the signed Android APK. */
@CapacitorPlugin(name = "NativeGoogleAuth")
public class NativeGoogleAuthPlugin extends Plugin {
    private GoogleSignInClient googleSignInClient;

    @PluginMethod
    public void signIn(PluginCall call) {
        GoogleSignInOptions options = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestProfile()
            .build();

        googleSignInClient = GoogleSignIn.getClient(getContext(), options);

        // Clear the app's prior selection only. The user's Google account remains
        // signed in on Android, while the next learner can choose any account.
        googleSignInClient.signOut().addOnCompleteListener(task -> {
            if (!task.isSuccessful()) {
                call.reject("Không thể chuẩn bị chọn tài khoản Google.", "GOOGLE_SIGN_OUT_FAILED");
                return;
            }

            getActivity().runOnUiThread(() ->
                startActivityForResult(call, googleSignInClient.getSignInIntent(), "handleGoogleSignIn")
            );
        });
    }

    @ActivityCallback
    private void handleGoogleSignIn(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() == Activity.RESULT_CANCELED) {
            call.reject("Bạn đã hủy đăng nhập Google.", "GOOGLE_SIGN_IN_CANCELLED");
            return;
        }

        try {
            GoogleSignInAccount account = GoogleSignIn
                .getSignedInAccountFromIntent(result.getData())
                .getResult(ApiException.class);

            if (account == null || account.getId() == null) {
                call.reject("Không nhận được hồ sơ Google hợp lệ.", "GOOGLE_PROFILE_INVALID");
                return;
            }

            String name = account.getDisplayName();
            if (name == null || name.trim().isEmpty()) name = account.getEmail();
            if (name == null || name.trim().isEmpty()) name = "Người học Google";

            JSObject profile = new JSObject();
            profile.put("id", "google:" + account.getId());
            profile.put("name", name);
            if (account.getEmail() != null) profile.put("email", account.getEmail());
            if (account.getPhotoUrl() != null) profile.put("avatar", account.getPhotoUrl().toString());
            call.resolve(profile);
        } catch (ApiException error) {
            call.reject("Đăng nhập Google thất bại (mã " + error.getStatusCode() + ").", "GOOGLE_SIGN_IN_FAILED", error);
        }
    }
}
