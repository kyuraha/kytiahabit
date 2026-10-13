import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadFirebase, firebaseReady } from '@/firebase'
import { useAuthStore } from './auth'
import { toKey, startOfMonth, endOfMonth, addMonths } from '@/lib/date'

const demoKey = (uid) => `kytia.days.${uid}`

function readDemo(uid) {
  try {
    return JSON.parse(localStorage.getItem(demoKey(uid)) || '{}')
  } catch {
    return {}
  }
}

function writeDemo(uid, data) {
  localStorage.setItem(demoKey(uid), JSON.stringify(data))
}

/** Pesan error Firestore yang lebih manusiawi. */
function friendlyFirestoreError(e) {
  const code = e?.code || ''
  const map = {
    'permission-denied':
      'Akses Firestore ditolak. Cek Security Rules kamu di Firebase Console → Firestore → Rules.',
    'unavailable': 'Tidak bisa menghubungi Firestore. Cek koneksi internet.',
    'failed-precondition':
      'Firestore belum siap. Pastikan database sudah dibuat di Firebase Console → Firestore Database.',
    'not-found':
      'Database Firestore belum dibuat. Buka Firebase Console → Firestore Database → Create database.',
  }
  return map[code] || e?.message || 'Terjadi kesalahan pada database.'
}

export const useDaysStore = defineStore('days', () => {
  const auth = useAuthStore()

  /** Map: dateKey -> entry. */
  const days = ref({})
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const loadedMonths = ref(new Set())

  const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`

  /** Muat satu bulan penuh (kalau belum pernah dimuat). */
  async function loadMonth(anchor) {
    const uid = auth.user?.uid
    if (!uid) return
    const mk = monthKey(anchor)
    if (loadedMonths.value.has(mk)) return

    loading.value = true
    error.value = ''
    try {
      const start = toKey(startOfMonth(anchor))
      const end = toKey(endOfMonth(anchor))

      if (!firebaseReady) {
        const all = readDemo(uid)
        for (const [k, v] of Object.entries(all)) {
          if (k >= start && k <= end) days.value[k] = v
        }
      } else {
        const { db, fsMod } = await loadFirebase()
        const col = fsMod.collection(db, 'users', uid, 'days')
        const snap = await fsMod.getDocs(
          fsMod.query(col, fsMod.where('date', '>=', start), fsMod.where('date', '<=', end)),
        )
        snap.forEach((d) => {
          days.value[d.id] = d.data()
        })
      }
      loadedMonths.value.add(mk)
    } catch (e) {
      error.value = friendlyFirestoreError(e)
    } finally {
      loading.value = false
    }
  }

  /** Pastikan semua bulan yang mencakup [start, end] sudah dimuat. */
  async function loadRange(start, end) {
    const seen = new Set()
    let cursor = startOfMonth(start)
    const last = startOfMonth(end)
    while (cursor <= last) {
      const mk = monthKey(cursor)
      if (!seen.has(mk)) {
        seen.add(mk)
        await loadMonth(cursor)
      }
      cursor = addMonths(cursor, 1)
    }
  }

  function getDay(dateKey) {
    return days.value[dateKey] || null
  }

  /** Simpan satu dokumen harian. */
  async function saveDay(dateKey, entry) {
    const uid = auth.user?.uid
    if (!uid) return
    saving.value = true
    error.value = ''
    try {
      const payload = { ...entry, date: dateKey }
      if (!firebaseReady) {
        const all = readDemo(uid)
        all[dateKey] = payload
        writeDemo(uid, all)
      } else {
        const { db, fsMod } = await loadFirebase()
        await fsMod.setDoc(
          fsMod.doc(db, 'users', uid, 'days', dateKey),
          { ...payload, updatedAt: fsMod.serverTimestamp() },
          { merge: true },
        )
      }
      days.value[dateKey] = payload
      loadedMonths.value.add(monthKey(new Date(dateKey + 'T00:00:00')))
    } catch (e) {
      error.value = friendlyFirestoreError(e)
      throw e
    } finally {
      saving.value = false
    }
  }

  function reset() {
    days.value = {}
    loadedMonths.value = new Set()
    error.value = ''
  }

  const filledCount = computed(
    () => Object.values(days.value).filter((d) => d && Object.keys(d).length > 1).length,
  )

  return {
    days,
    loading,
    saving,
    error,
    getDay,
    loadMonth,
    loadRange,
    saveDay,
    reset,
    filledCount,
  }
})
