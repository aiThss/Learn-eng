package com.englishup.app;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;
import java.util.UUID;

/**
 * Uses Android's TTS engine rather than the embedded WebView's Web Speech shim.
 * Android WebView can expose speechSynthesis while silently failing to use audio output.
 */
@CapacitorPlugin(name = "NativeTextToSpeech")
public class NativeTextToSpeechPlugin extends Plugin implements TextToSpeech.OnInitListener {
    private TextToSpeech textToSpeech;
    private boolean isReady;
    private String activeUtteranceId;
    private PluginCall activeCall;

    @Override
    public void load() {
        textToSpeech = new TextToSpeech(getContext(), this);
    }

    @Override
    public void onInit(int status) {
        isReady = status == TextToSpeech.SUCCESS;
        if (!isReady || textToSpeech == null) return;

        textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) {
                // Complete the JavaScript promise only after speech is finished.
            }

            @Override
            public void onDone(String utteranceId) {
                getActivity().runOnUiThread(() -> resolveUtterance(utteranceId));
            }

            @Override
            public void onError(String utteranceId) {
                getActivity().runOnUiThread(() -> rejectUtterance(utteranceId, "Không thể phát giọng đọc trên thiết bị.", "TTS_FAILED"));
            }
        });
    }

    @PluginMethod
    public void speak(PluginCall call) {
        final String text = call.getString("text", "").trim();
        if (text.isEmpty()) {
            call.reject("Nội dung cần đọc đang trống.", "TTS_EMPTY_TEXT");
            return;
        }

        call.setKeepAlive(true);
        getActivity().runOnUiThread(() -> {
            if (!isReady || textToSpeech == null) {
                call.setKeepAlive(false);
                call.reject("Giọng đọc của thiết bị chưa sẵn sàng.", "TTS_NOT_READY");
                return;
            }

            rejectActiveCall("Đã chuyển sang câu đọc mới.", "TTS_INTERRUPTED");

            String language = call.getString("lang", "en-US");
            int languageStatus = textToSpeech.setLanguage(Locale.forLanguageTag(language));
            if (languageStatus == TextToSpeech.LANG_MISSING_DATA || languageStatus == TextToSpeech.LANG_NOT_SUPPORTED) {
                textToSpeech.setLanguage(Locale.US);
            }

            textToSpeech.setSpeechRate(clamp(call.getDouble("rate"), 1.0f, 0.5f, 2.0f));
            textToSpeech.setPitch(clamp(call.getDouble("pitch"), 1.0f, 0.5f, 2.0f));

            Bundle params = new Bundle();
            params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, clamp(call.getDouble("volume"), 1.0f, 0.0f, 1.0f));

            String utteranceId = UUID.randomUUID().toString();
            activeCall = call;
            activeUtteranceId = utteranceId;
            int result = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId);
            if (result == TextToSpeech.ERROR) {
                rejectUtterance(utteranceId, "Không thể bắt đầu giọng đọc trên thiết bị.", "TTS_START_FAILED");
            }
        });
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (textToSpeech != null) textToSpeech.stop();
            rejectActiveCall("Đã dừng giọng đọc.", "TTS_STOPPED");
            call.resolve();
        });
    }

    private float clamp(Double value, float fallback, float min, float max) {
        float number = value == null ? fallback : value.floatValue();
        return Math.max(min, Math.min(max, number));
    }

    private void resolveUtterance(String utteranceId) {
        if (!utteranceId.equals(activeUtteranceId) || activeCall == null) return;
        PluginCall call = activeCall;
        activeCall = null;
        activeUtteranceId = null;
        call.setKeepAlive(false);
        call.resolve();
    }

    private void rejectUtterance(String utteranceId, String message, String code) {
        if (!utteranceId.equals(activeUtteranceId)) return;
        rejectActiveCall(message, code);
    }

    private void rejectActiveCall(String message, String code) {
        if (activeCall == null) return;
        PluginCall call = activeCall;
        activeCall = null;
        activeUtteranceId = null;
        call.setKeepAlive(false);
        call.reject(message, code);
    }
}
