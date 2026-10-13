/**
 * Konfigurasi diambil dari environment variable (.env).
 *
 * Kalau kosong -> `firebaseReady` = false dan aplikasi jalan di Demo Mode
 * (login palsu + data disimpan di localStorage browser), TANPA mengunduh
 * SDK Firebase sama sekali.
 *
 * Kalau terisi -> SDK Firebase dimuat secara lazy lewat `loadFirebase()`,
 * jadi bundle awal tetap ringan.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseReady = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

let corePromise = null

/**
 * Muat SDK Firebase sekali saja.
 * @returns {Promise<null | { app, auth, db, googleProvider, authMod, fsMod }>}
 */
export function loadFirebase() {
  if (!firebaseReady) return Promise.resolve(null)
  if (!corePromise) {
    corePromise = (async () => {
      const [appMod, authMod, fsMod] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ])

      const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig)
      const auth = authMod.getAuth(app)
      const db = fsMod.getFirestore(app)

      const googleProvider = new authMod.GoogleAuthProvider()
      googleProvider.setCustomParameters({ prompt: 'select_account' })

      return { app, auth, db, googleProvider, authMod, fsMod }
    })()
  }
  return corePromise
}
