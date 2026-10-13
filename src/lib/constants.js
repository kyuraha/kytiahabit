/**
 * Sumber kebenaran tunggal untuk semua definisi habit.
 *
 * Struktur dokumen harian di database (satu dokumen per tanggal):
 * {
 *   date: '2026-10-13',
 *   salat:     { subuh: 'tepat'|'telat'|'sangat_telat'|'tidak', dzuhur: ..., ashar: ..., maghrib: ..., isya: ... },
 *   lari:      { km: 5 },
 *   semedi:    { wimhof: 3, meditasi: 10 },
 *   kerja:     { fase1: 3, fase2: 3, fase3: 3 },
 *   notoxic:   { fase1: 'bersih'|'sedikit'|'banyak'|'toxic', fase2: ..., fase3: ... },
 *   jurnaling: { pomodoro: 1 },
 *   belajar:   { pomodoro: 4 },
 *   notes:     'catatan bebas...',
 *   updatedAt: <timestamp>,
 * }
 */

/* ------------------------------------------------------------------ */
/*  Palet warna                                                        */
/* ------------------------------------------------------------------ */

export const PALETTE = {
  green: { solid: '#22c55e', soft: '#dcfce7', ink: '#15803d', label: 'Hijau' },
  yellow: { solid: '#eab308', soft: '#fef9c3', ink: '#a16207', label: 'Kuning' },
  orange: { solid: '#f97316', soft: '#ffedd5', ink: '#c2410c', label: 'Oren' },
  red: { solid: '#ef4444', soft: '#fee2e2', ink: '#b91c1c', label: 'Merah' },
  empty: { solid: '#e2e8f0', soft: '#f1f5f9', ink: '#94a3b8', label: 'Kosong' },
}

export const colorOf = (key) => PALETTE[key] || PALETTE.empty

/* ------------------------------------------------------------------ */
/*  Level status (4 warna)                                             */
/* ------------------------------------------------------------------ */

/** Dipakai untuk 5 salat wajib. */
export const SALAT_LEVELS = [
  { key: 'tepat', label: 'Tepat', color: 'green', weight: 1 },
  { key: 'telat', label: 'Telat', color: 'yellow', weight: 0.66 },
  { key: 'sangat_telat', label: 'Sangat Telat', color: 'orange', weight: 0.33 },
  { key: 'tidak', label: 'Tidak', color: 'red', weight: 0 },
]

/** Dipakai untuk 3 fase "No Toxic" — warna mirip salat. */
export const NOTOXIC_LEVELS = [
  { key: 'bersih', label: 'Bersih', color: 'green', weight: 1 },
  { key: 'sedikit', label: 'Sedikit', color: 'yellow', weight: 0.66 },
  { key: 'banyak', label: 'Banyak', color: 'orange', weight: 0.33 },
  { key: 'toxic', label: 'Toxic', color: 'red', weight: 0 },
]

export const levelWeight = (levels, key) => {
  const found = levels.find((l) => l.key === key)
  return found ? found.weight : null
}

/* ------------------------------------------------------------------ */
/*  Sub-item                                                           */
/* ------------------------------------------------------------------ */

export const PRAYERS = [
  { key: 'subuh', label: 'Subuh' },
  { key: 'dzuhur', label: 'Dzuhur' },
  { key: 'ashar', label: 'Ashar' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isya', label: 'Isya' },
]

export const PHASES = [
  { key: 'fase1', label: 'Fase 1' },
  { key: 'fase2', label: 'Fase 2' },
  { key: 'fase3', label: 'Fase 3' },
]

/** Minimal pomodoro per fase untuk habit "kerja". */
export const KERJA_MIN_PER_PHASE = 3

/* ------------------------------------------------------------------ */
/*  Baris matrix                                                       */
/* ------------------------------------------------------------------ */
/**
 * Setiap baris punya:
 *  - id        : id unik baris
 *  - group     : key grup (untuk header & warna)
 *  - label     : label baris
 *  - path      : jalur nilai di dokumen harian
 *  - kind      : 'status' (4 warna) | 'number' (nilai + unit)
 *  - levels    : level status (kalau kind === 'status')
 *  - unit      : satuan (kalau kind === 'number')
 *  - goal      : target untuk hitung rasio warna (kalau kind === 'number')
 *  - min       : nilai minimal (opsional, untuk validasi)
 */

const statusRow = (group, label, path, levels) => ({
  id: path.join('.'),
  group,
  label,
  path,
  kind: 'status',
  levels,
})

const numberRow = (group, label, path, unit, goal, min = 0) => ({
  id: path.join('.'),
  group,
  label,
  path,
  kind: 'number',
  unit,
  goal,
  min,
})

export const GROUPS = {
  salat: { label: 'Salat', icon: '🕌', color: '#10b981' },
  lari: { label: 'Lari Pagi', icon: '🏃', color: '#f97316' },
  semedi: { label: 'Semedi', icon: '🧘', color: '#8b5cf6' },
  kerja: { label: 'Kerja', icon: '💼', color: '#3b82f6' },
  notoxic: { label: 'No Toxic', icon: '🚫', color: '#ef4444' },
  jurnaling: { label: 'Jurnaling', icon: '📝', color: '#14b8a6' },
  belajar: { label: 'Belajar', icon: '📚', color: '#6366f1' },
}

export const GROUP_ORDER = ['salat', 'lari', 'semedi', 'kerja', 'notoxic', 'jurnaling', 'belajar']

export const ROWS = [
  ...PRAYERS.map((p) => statusRow('salat', p.label, ['salat', p.key], SALAT_LEVELS)),
  numberRow('lari', 'Lari Pagi', ['lari', 'km'], 'km', 3),
  numberRow('semedi', 'Wimhof Breathing', ['semedi', 'wimhof'], 'round', 3),
  numberRow('semedi', 'Meditasi', ['semedi', 'meditasi'], 'menit', 10),
  ...PHASES.map((f) =>
    numberRow('kerja', f.label, ['kerja', f.key], 'pomodoro', KERJA_MIN_PER_PHASE, KERJA_MIN_PER_PHASE),
  ),
  ...PHASES.map((f) => statusRow('notoxic', f.label, ['notoxic', f.key], NOTOXIC_LEVELS)),
  numberRow('jurnaling', 'Jurnaling', ['jurnaling', 'pomodoro'], 'pomodoro', 1),
  numberRow('belajar', 'Belajar', ['belajar', 'pomodoro'], 'pomodoro', 1),
]

/** Baris dikelompokkan untuk kebutuhan render header. */
export const ROW_GROUPS = GROUP_ORDER.map((g) => ({
  key: g,
  ...GROUPS[g],
  rows: ROWS.filter((r) => r.group === g),
}))

/** Akun demo yang dipakai saat Firebase belum dikonfigurasi (login Google-only). */
export const DEMO_ACCOUNT = {
  email: 'demo@kytiahabit.app',
}
