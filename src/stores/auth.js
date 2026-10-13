import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadFirebase, firebaseReady } from '@/firebase'
import { DEMO_ACCOUNT } from '@/lib/constants'

const DEMO_USER_KEY = 'kytia.demoUser'

/** Normalisasi pesan error Firebase jadi bahasa Indonesia yang enak dibaca. */
function friendlyError(err) {
  const code = err?.code || ''
  const raw = err?.message || ''

  const map = {
    'auth/popup-closed-by-user': 'Jendela login Google ditutup sebelum selesai.',
    'auth/cancelled-popup-request': 'Proses login dibatalkan.',
    'auth/popup-blocked':
      'Popup login diblokir browser. Izinkan popup untuk situs ini, lalu coba lagi.',
    'auth/account-exists-with-different-credential':
      'Email ini sudah terdaftar dengan metode login lain.',
    'auth/network-request-failed': 'Koneksi bermasalah. Cek internet kamu.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/configuration-not-found':
      'Firebase Authentication belum diaktifkan di project ini. Buka Firebase Console → Authentication → Get started.',
    'auth/operation-not-allowed':
      'Login Google belum diaktifkan. Buka Firebase Console → Authentication → Sign-in method → aktifkan Google.',
    'auth/unauthorized-domain':
      'Domain ini belum diizinkan. Tambahkan di Firebase Console → Authentication → Settings → Authorized domains.',
    'auth/admin-restricted-operation':
      'Login dinonaktifkan di project ini. Aktifkan di Firebase Console → Authentication → Settings → User actions.',
    'auth/internal-error': 'Firebase menolak permintaan. Pastikan Authentication sudah diaktifkan.',
  }

  if (map[code]) return map[code]

  // Cadangan: cocokkan pesan mentah dari REST API Firebase.
  if (raw.includes('CONFIGURATION_NOT_FOUND')) return map['auth/configuration-not-found']
  if (raw.includes('OPERATION_NOT_ALLOWED')) return map['auth/operation-not-allowed']
  if (raw.includes('IDENTITY_PROVIDER_IS_NOT_ENABLED')) return map['auth/operation-not-allowed']

  return raw || 'Terjadi kesalahan. Coba lagi.'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const ready = ref(false)
  const busy = ref(false)
  const error = ref('')
  const demo = !firebaseReady

  const isLoggedIn = computed(() => !!user.value)

  let readyResolve
  const readyPromise = new Promise((resolve) => {
    readyResolve = resolve
  })
  const waitReady = () => readyPromise
  const markReady = () => {
    if (!ready.value) {
      ready.value = true
      readyResolve()
    }
  }

  function init() {
    if (demo) {
      try {
        const raw = localStorage.getItem(DEMO_USER_KEY)
        if (raw) user.value = JSON.parse(raw)
      } catch {
        /* ignore */
      }
      markReady()
      return
    }
    loadFirebase().then(async ({ auth, authMod }) => {
      // Selesaikan alur login redirect (dipakai kalau popup diblokir).
      try {
        const res = await authMod.getRedirectResult(auth)
        if (res?.user) user.value = res.user
      } catch (e) {
        error.value = friendlyError(e)
      }
      authMod.onAuthStateChanged(auth, (u) => {
        user.value = u
          ? { uid: u.uid, email: u.email, name: u.displayName || u.email?.split('@')[0] }
          : null
        markReady()
      })
    })
  }

  /**
   * Login Google — satu-satunya cara masuk.
   * Kalau popup diblokir (umum saat app dibuka di dalam iframe/preview),
   * otomatis jatuh ke alur redirect.
   */
  async function loginGoogle() {
    error.value = ''
    busy.value = true
    try {
      if (demo) {
        // Firebase belum dikonfigurasi: pakai akun demo lokal.
        user.value = { uid: 'demo-google', email: DEMO_ACCOUNT.email, name: 'Demo Google' }
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user.value))
        return true
      }
      const { auth, authMod, googleProvider } = await loadFirebase()
      try {
        await authMod.signInWithPopup(auth, googleProvider)
      } catch (e) {
        const fallback = [
          'auth/popup-blocked',
          'auth/operation-not-supported-in-this-environment',
        ]
        if (fallback.includes(e?.code)) {
          await authMod.signInWithRedirect(auth, googleProvider)
          return true
        }
        throw e
      }
      return true
    } catch (e) {
      error.value = friendlyError(e)
      return false
    } finally {
      busy.value = false
    }
  }

  async function logout() {
    error.value = ''
    if (demo) {
      user.value = null
      localStorage.removeItem(DEMO_USER_KEY)
      return
    }
    const { auth, authMod } = await loadFirebase()
    await authMod.signOut(auth)
  }

  return { user, ready, busy, error, demo, isLoggedIn, waitReady, init, loginGoogle, logout }
})
