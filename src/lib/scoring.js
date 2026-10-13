import { ROWS, ROW_GROUPS, levelWeight } from './constants'

/* ------------------------------------------------------------------ */
/*  Akses nilai dokumen harian                                         */
/* ------------------------------------------------------------------ */

export function getByPath(day, path) {
  if (!day) return null
  return path.reduce((acc, key) => (acc == null ? null : acc[key]), day)
}

export function setByPath(day, path, value) {
  const next = structuredClone(day || {})
  let cursor = next
  for (let i = 0; i < path.length - 1; i += 1) {
    if (typeof cursor[path[i]] !== 'object' || cursor[path[i]] === null) cursor[path[i]] = {}
    cursor = cursor[path[i]]
  }
  cursor[path[path.length - 1]] = value
  return next
}

/** true kalau dokumen hari itu punya isi sama sekali. */
export function hasAnyData(day) {
  if (!day) return false
  return ROWS.some((row) => {
    const v = getByPath(day, row.path)
    if (row.kind === 'number') return typeof v === 'number' && v > 0
    return typeof v === 'string' && v.length > 0
  })
}

/* ------------------------------------------------------------------ */
/*  Nilai + warna per baris                                            */
/* ------------------------------------------------------------------ */

/**
 * Kembalikan { value, ratio, color, has } untuk satu baris pada satu hari.
 *  - ratio : 0..1 dipakai untuk mewarnai sel matrix
 *  - color : key palet ('green' | 'yellow' | 'orange' | 'red' | 'empty')
 */
export function rowCell(day, row) {
  const raw = getByPath(day, row.path)

  if (row.kind === 'status') {
    if (!raw) return { value: null, ratio: null, color: 'empty', has: false }
    const w = levelWeight(row.levels, raw)
    const ratio = w == null ? 0 : w
    const level = row.levels.find((l) => l.key === raw)
    return { value: raw, label: level?.label ?? raw, ratio, color: level?.color ?? 'empty', has: true }
  }

  // kind === 'number'
  const num = typeof raw === 'number' ? raw : 0
  if (!num) return { value: 0, ratio: null, color: 'empty', has: false }
  const goal = row.goal || 1
  const ratio = Math.min(1, num / goal)
  return { value: num, ratio, color: ratioColor(ratio), has: true }
}

export function ratioColor(ratio) {
  if (ratio >= 0.8) return 'green'
  if (ratio >= 0.5) return 'yellow'
  if (ratio >= 0.25) return 'orange'
  if (ratio > 0) return 'red'
  return 'empty'
}

/* ------------------------------------------------------------------ */
/*  Skor harian (0..100) — rata-rata seluruh baris yang terisi         */
/* ------------------------------------------------------------------ */

export function dayScore(day) {
  const ratios = ROWS.map((row) => rowCell(day, row))
    .filter((c) => c.has)
    .map((c) => (c.ratio == null ? 0 : c.ratio))
  if (!ratios.length) return null
  const sum = ratios.reduce((a, b) => a + b, 0)
  return Math.round((sum / ROWS.length) * 100)
}

/** Skor per grup (0..100) untuk ringkasan. */
export function groupScore(day, groupKey) {
  const rows = ROWS.filter((r) => r.group === groupKey)
  const cells = rows.map((r) => rowCell(day, r))
  if (!cells.some((c) => c.has)) return null
  const sum = cells.reduce((a, c) => a + (c.ratio == null ? 0 : c.ratio), 0)
  return Math.round((sum / rows.length) * 100)
}

export function groupScores(day) {
  return ROW_GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    color: g.color,
    score: groupScore(day, g.key),
  }))
}

/* ------------------------------------------------------------------ */
/*  Statistik rentang (minggu / bulan)                                 */
/* ------------------------------------------------------------------ */

export function rangeStats(keys, daysMap) {
  let filled = 0
  let sum = 0
  let perfect = 0
  let best = null

  for (const key of keys) {
    const day = daysMap[key]
    const score = dayScore(day)
    if (score == null) continue
    filled += 1
    sum += score
    if (score >= 90) perfect += 1
    if (!best || score > best.score) best = { key, score }
  }

  const avg = filled ? Math.round(sum / filled) : 0
  return { filled, total: keys.length, avg, perfect, best }
}

/** Rata-rata skor satu grup sepanjang rentang (0..100). */
export function rangeGroupAvg(keys, daysMap, groupKey) {
  let filled = 0
  let sum = 0
  for (const key of keys) {
    const s = groupScore(daysMap[key], groupKey)
    if (s == null) continue
    filled += 1
    sum += s
  }
  return filled ? Math.round(sum / filled) : null
}

/**
 * Streak: jumlah hari berturut-turut (mundur dari hari ini) yang skornya >= threshold.
 * `keys` diharapkan urut dari yang paling lama ke paling baru.
 */
export function currentStreak(keys, daysMap, threshold = 50) {
  let streak = 0
  for (let i = keys.length - 1; i >= 0; i -= 1) {
    const s = dayScore(daysMap[keys[i]])
    if (s != null && s >= threshold) streak += 1
    else break
  }
  return streak
}

/** Streak terpanjang di dalam rentang. */
export function bestStreak(keys, daysMap, threshold = 50) {
  let best = 0
  let run = 0
  for (const key of keys) {
    const s = dayScore(daysMap[key])
    if (s != null && s >= threshold) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
  }
  return best
}
