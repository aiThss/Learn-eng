import { useEffect, useRef } from 'react'
import { App as NativeApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useLocation, useNavigate } from 'react-router-dom'

type RouterState = {
  idx?: number
  key?: string
  usr?: Record<string, unknown> | null
}

/**
 * Keeps mobile navigation inside EnglishUp.
 *
 * - Every React Router URL is a browser history entry for PWA swipe-back.
 * - Android's hardware/gesture back calls the same history stack.
 * - A direct deep-link is given a synthetic dashboard entry so its first back
 *   gesture returns to the app instead of closing the PWA/APK.
 */
export default function BackNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const locationRef = useRef(location)

  useEffect(() => {
    locationRef.current = location
  }, [location])

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/onboarding') return

    const state = window.history.state as RouterState | null
    if (state?.idx !== 0 || state?.usr?.englishUpBackfilled) return

    const pageUrl = `${location.pathname}${location.search}${location.hash}`
    const userState = { ...(state.usr ?? {}), englishUpBackfilled: true }

    // BrowserRouter uses `idx` to calculate navigation deltas. Preserve that
    // contract while inserting the dashboard immediately behind this route.
    window.history.replaceState({ ...state, idx: 0, key: 'englishup-root', usr: userState }, '', '/')
    window.history.pushState({ ...state, idx: 1, key: 'englishup-page', usr: userState }, '', pageUrl)
  }, [location.hash, location.pathname, location.search])

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return

    let disposed = false
    let removeListener: (() => Promise<void>) | undefined

    void NativeApp.addListener('backButton', ({ canGoBack }) => {
      const currentLocation = locationRef.current
      if (canGoBack) {
        window.history.back()
        return
      }

      if (currentLocation.pathname !== '/' && currentLocation.pathname !== '/onboarding') {
        navigate('/', { replace: true })
        return
      }

      // At the root, minimize rather than force-close the Android process.
      void NativeApp.minimizeApp()
    }).then((listener) => {
      if (disposed) {
        void listener.remove()
      } else {
        removeListener = listener.remove
      }
    })

    return () => {
      disposed = true
      if (removeListener) void removeListener()
    }
  }, [navigate])

  return null
}
