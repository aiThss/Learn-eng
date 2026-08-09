import { isSpeechSynthesisSupported, speak } from './tts'

const FREE_DICTIONARY_ENDPOINT = 'https://api.dictionaryapi.dev/api/v2/entries/en/'
const audioCache = new Map<string, string | null>()

interface DictionaryEntry {
  phonetics?: Array<{ audio?: string }>
}

function normaliseAudioUrl(value: string): string {
  return value.startsWith('//') ? `https:${value}` : value
}

async function getDictionaryAudio(word: string): Promise<string | null> {
  const key = word.trim().toLowerCase()
  if (!key || key.includes('/')) return null
  if (audioCache.has(key)) return audioCache.get(key) ?? null

  try {
    const response = await fetch(`${FREE_DICTIONARY_ENDPOINT}${encodeURIComponent(key)}`)
    if (!response.ok) throw new Error('Dictionary lookup failed')
    const entries = await response.json() as DictionaryEntry[]
    const audio = entries
      .flatMap((entry) => entry.phonetics ?? [])
      .map((phonetic) => phonetic.audio?.trim() ?? '')
      .find(Boolean)

    const result = audio ? normaliseAudioUrl(audio) : null
    audioCache.set(key, result)
    return result
  } catch {
    audioCache.set(key, null)
    return null
  }
}

/** Uses unlimited device speech first; dictionary audio is a browser-support fallback. */
export async function playPronunciation(word: string): Promise<void> {
  if (isSpeechSynthesisSupported()) {
    speak(word)
    return
  }

  const audioUrl = await getDictionaryAudio(word)
  if (!audioUrl) {
    return
  }

  const audio = new Audio(audioUrl)
  audio.addEventListener('error', () => undefined, { once: true })
  try {
    await audio.play()
  } catch { /* Device does not expose a speech service or audio player. */ }
}
