import { Capacitor, registerPlugin } from '@capacitor/core'

export type NativeTtsOptions = {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}

interface NativeTextToSpeechPlugin {
  speak(options: NativeTtsOptions & { text: string }): Promise<void>
  stop(): Promise<void>
}

const NativeTextToSpeech = registerPlugin<NativeTextToSpeechPlugin>('NativeTextToSpeech')

/** Android's engine works even when the embedded WebView advertises but cannot play Web Speech. */
export function supportsNativeTextToSpeech(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

/** Resolves true when the device completed the utterance. */
export async function speakWithNativeTextToSpeech(text: string, options?: NativeTtsOptions): Promise<boolean> {
  if (!supportsNativeTextToSpeech() || !text.trim()) return false

  try {
    await NativeTextToSpeech.speak({ text, ...options })
    return true
  } catch {
    return false
  }
}

export function stopNativeTextToSpeech(): void {
  if (!supportsNativeTextToSpeech()) return
  void NativeTextToSpeech.stop().catch(() => undefined)
}
