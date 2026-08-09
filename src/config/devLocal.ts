/** Local/LAN test entry shown only by Vite or when explicitly enabled. */
export const DEV_LOCAL_URL = import.meta.env.VITE_DEV_LOCAL_URL?.trim() || 'http://192.168.1.163:5173'

export const showDevLocalPin = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_LOCAL_PIN === 'true'
