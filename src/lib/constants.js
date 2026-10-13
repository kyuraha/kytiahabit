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
/*  Palet warna — bumi, aus, jenuh rendah tapi berat                   */
/* ------------------------------------------------------------------ */

export const PALETTE = {
  green: { solid: '#4f6b4a', soft: '#dde5d9', ink: '#33452f', label: 'Hijau' },
  yellow: { solid: '#a8862f', soft: '#ece4cf', ink: '#6d561c', label: 'Kuning' },
  orange: { solid: '#a85f34', soft: '#edddd2', ink: '#6e3c1f', label: 'Oren' },
  red: { solid: '#8f3f3a', soft: '#e8d8d6', ink: '#5e2724', label: 'Merah' },
  empty: { solid: '#c9c6bb', soft: '#e6e4dd', ink: '#8b8d82', label: 'Kosong' },
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
  salat: { label: 'Salat', color: '#4f6b4a' },
  lari: { label: 'Lari', color: '#a85f34' },
  semedi: { label: 'Semedi', color: '#6b5f7a' },
  kerja: { label: 'Kerja', color: '#44606e' },
  notoxic: { label: 'No Toxic', color: '#8f3f3a' },
  jurnaling: { label: 'Jurnaling', color: '#4a6f6a' },
  belajar: { label: 'Belajar', color: '#575b7a' },
}

export const GROUP_ORDER = ['salat', 'lari', 'semedi', 'kerja', 'notoxic', 'jurnaling', 'belajar']

export const ROWS = [
  ...PRAYERS.map((p) => statusRow('salat', p.label, ['salat', p.key], SALAT_LEVELS)),
  numberRow('lari', 'Lari', ['lari', 'km'], 'km', 3),
  numberRow('semedi', 'Wimhof', ['semedi', 'wimhof'], 'round', 3),
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
