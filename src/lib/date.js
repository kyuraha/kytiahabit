/** Helper tanggal. Semua "date key" memakai format YYYY-MM-DD. Minggu dimulai Minggu. */

export const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
export const DAY_NAMES_FULL = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
]
export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export const pad2 = (n) => String(n).padStart(2, '0')

/** Date -> 'YYYY-MM-DD' (pakai waktu lokal, bukan UTC). */
export function toKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** 'YYYY-MM-DD' -> Date lokal (tengah malam). */
export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toKey(new Date())

/** 0 = Minggu, 1 = Senin, ... 6 = Sabtu. */
export function weekdayIndex(date) {
  return new Date(date).getDay()
}

/** Minggu sebagai awal minggu. */
export function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - weekdayIndex(d))
  return d
}

export function endOfWeek(date) {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  return d
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

export function startOfMonth(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

/** Array of Date untuk 7 hari pada minggu yang memuat `date` (Minggu s.d. Sabtu). */
export function weekDates(date) {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** Array of Date untuk seluruh hari pada bulan yang memuat `date`. */
export function monthDates(date) {
  const start = startOfMonth(date)
  const total = endOfMonth(date).getDate()
  return Array.from({ length: total }, (_, i) => addDays(start, i))
}

export function isSameDay(a, b) {
  return toKey(a) === toKey(b)
}

/** Sabtu & Minggu. */
export function isWeekend(date) {
  const i = weekdayIndex(date)
  return i === 0 || i === 6
}

/** '13 Okt' */
export function shortLabel(date) {
  const d = new Date(date)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`
}

/** '13 Okt 2026' */
export function mediumLabel(date) {
  const d = new Date(date)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

/** Label rentang untuk header, contoh: '11 – 17 Okt 2026' atau 'Oktober 2026'. */
export function rangeLabel(mode, anchor) {
  if (mode === 'month') {
    const d = new Date(anchor)
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  }
  const s = startOfWeek(anchor)
  const e = endOfWeek(anchor)
  const sameMonth = s.getMonth() === e.getMonth()
  const left = sameMonth
    ? `${s.getDate()}`
    : `${s.getDate()} ${MONTH_NAMES[s.getMonth()].slice(0, 3)}`
  const right = `${e.getDate()} ${MONTH_NAMES[e.getMonth()].slice(0, 3)} ${e.getFullYear()}`
  return `${left} – ${right}`
}
