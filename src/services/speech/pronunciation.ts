import { speak } from './tts'

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

/** Plays a free dictionary recording when available, then uses device TTS. */
export async function playPronunciation(word: string): Promise<void> {
  const audioUrl = await getDictionaryAudio(word)
  if (!audioUrl) {
    speak(word)
    return
  }

  const audio = new Audio(audioUrl)
  audio.addEventListener('error', () => speak(word), { once: true })
  try {
    await audio.play()
  } catch {
    speak(word)
  }
}
