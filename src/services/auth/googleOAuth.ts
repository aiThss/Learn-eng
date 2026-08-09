/**
 * Google OAuth for a local-first profile.
 *
 * The access token is used once to read the selected Google profile and is
 * never persisted. Learning data remains on the device until a sync backend
 * is introduced.
 */
import { Capacitor, registerPlugin } from '@capacitor/core'

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'
// OAuth Client IDs are public identifiers. An environment value can override
// this production default for another deployment without exposing any secret.
const DEFAULT_WEB_GOOGLE_CLIENT_ID = '894898478385-l9s6m4lov7djasfe267haedfuj74f393.apps.googleusercontent.com'

interface GoogleTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface GoogleUserInfo {
  sub?: string
  name?: string
  email?: string
  picture?: string
  email_verified?: boolean
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void
}

interface GoogleIdentityApi {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        callback: (response: GoogleTokenResponse) => void
        error_callback?: (error: { type?: string; message?: string }) => void
      }) => GoogleTokenClient
      revoke?: (token: string, callback?: () => void) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityApi
  }
}

export interface GoogleOAuthProfile {
  id: string
  name: string
  email?: string
  avatar?: string
}

interface NativeGoogleAuthPlugin {
  signIn(): Promise<GoogleOAuthProfile>
}

const NativeGoogleAuth = registerPlugin<NativeGoogleAuthPlugin>('NativeGoogleAuth')

export const GOOGLE_OAUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || DEFAULT_WEB_GOOGLE_CLIENT_ID

function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
}

export function isGoogleOAuthConfigured(): boolean {
  return isNativeAndroid() || Boolean(GOOGLE_OAUTH_CLIENT_ID)
}

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts.oauth2) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Không thể tải Google OAuth.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = GOOGLE_IDENTITY_SCRIPT
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Không thể tải Google OAuth.'))
    document.head.appendChild(script)
  })
}

function getErrorMessage(error: GoogleTokenResponse): string {
  return error.error_description || error.error || 'Đăng nhập Google không thành công.'
}

/**
 * Opens Google's account selector, requests only OpenID profile scopes, then
 * discards the short-lived access token after retrieving the profile.
 */
export async function signInWithGoogle(): Promise<GoogleOAuthProfile> {
  if (isNativeAndroid()) {
    return NativeGoogleAuth.signIn()
  }

  if (!isGoogleOAuthConfigured()) {
    throw new Error('Google OAuth chưa được cấu hình cho bản này.')
  }

  await loadGoogleIdentityScript()
  const oauth2 = window.google?.accounts.oauth2
  if (!oauth2) throw new Error('Google OAuth chưa sẵn sàng. Hãy thử lại.')

  return new Promise<GoogleOAuthProfile>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      scope: 'openid email profile',
      error_callback: (error) => reject(new Error(error.message || 'Không thể mở đăng nhập Google.')),
      callback: async (token) => {
        if (!token.access_token) {
          reject(new Error(getErrorMessage(token)))
          return
        }

        try {
          const response = await fetch(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${token.access_token}` },
          })
          if (!response.ok) throw new Error('Không thể đọc hồ sơ Google.')

          const profile = await response.json() as GoogleUserInfo
          if (!profile.sub || !profile.name) throw new Error('Hồ sơ Google không hợp lệ.')

          resolve({
            id: `google:${profile.sub}`,
            name: profile.name,
            email: profile.email,
            avatar: profile.picture,
          })
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Đăng nhập Google không thành công.'))
        } finally {
          // This app has no cloud backend yet, so retaining an OAuth token would
          // add risk without giving the learner any benefit.
          oauth2.revoke?.(token.access_token, () => undefined)
        }
      },
    })
    client.requestAccessToken({ prompt: 'select_account' })
  })
}
