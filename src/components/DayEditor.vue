<script setup>
import { reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import StatusPicker from './StatusPicker.vue'
import NumberStepper from './NumberStepper.vue'
import ScoreRing from './ScoreRing.vue'
import {
  SALAT_LEVELS,
  NOTOXIC_LEVELS,
  PRAYERS,
  PHASES,
  KERJA_MIN_PER_PHASE,
} from '@/lib/constants'
import { dayScore } from '@/lib/scoring'
import { fromKey, DAY_NAMES_FULL, MONTH_NAMES } from '@/lib/date'

const props = defineProps({
  open: { type: Boolean, default: false },
  dateKey: { type: String, default: '' },
  entry: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'save'])

function blank() {
  return {
    salat: { subuh: '', dzuhur: '', ashar: '', maghrib: '', isya: '' },
    lari: { km: 0 },
    semedi: { wimhof: 0, meditasi: 0 },
    kerja: { fase1: 0, fase2: 0, fase3: 0 },
    notoxic: { fase1: '', fase2: '', fase3: '' },
    jurnaling: { pomodoro: 0 },
    belajar: { pomodoro: 0 },
    notes: '',
  }
}

const draft = reactive(blank())

function hydrate() {
  const base = blank()
  const src = props.entry || {}
  for (const group of Object.keys(base)) {
    if (group === 'notes') {
      draft.notes = src.notes || ''
      continue
    }
    for (const key of Object.keys(base[group])) {
      const v = src?.[group]?.[key]
      draft[group][key] = v === undefined || v === null ? base[group][key] : v
    }
  }
}

watch(
  () => [props.open, props.dateKey],
  () => {
    if (props.open) hydrate()
  },
  { immediate: true },
)

const label = computed(() => {
  if (!props.dateKey) return ''
  const d = fromKey(props.dateKey)
  return `${DAY_NAMES_FULL[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
})

const preview = computed(() => dayScore(draft))

const salatDone = computed(() => PRAYERS.filter((p) => draft.salat[p.key]).length)

function allTepat() {
  for (const p of PRAYERS) draft.salat[p.key] = 'tepat'
}

function resetDay() {
  const b = blank()
  for (const group of Object.keys(b)) {
    if (group === 'notes') {
      draft.notes = ''
      continue
    }
    for (const key of Object.keys(b[group])) draft[group][key] = b[group][key]
  }
}

function save() {
  const payload = structuredClone(JSON.parse(JSON.stringify(draft)))
  emit('save', { dateKey: props.dateKey, entry: payload })
}

function onKey(e) {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <teleport to="body">
    <transition name="sheet">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div class="panel" role="dialog" aria-modal="true">
          <header class="head">
            <div class="head-main">
              <div class="head-label">Catat habit</div>
              <h2 class="head-date">{{ label }}</h2>
            </div>
            <ScoreRing :score="preview" :size="58" caption="skor" />
            <button class="close" title="Tutup" @click="emit('close')">✕</button>
          </header>

          <div class="body">
            <!-- Salat -->
            <section class="sec">
              <div class="sec-head">
                <span class="sec-icon">🕌</span>
                <span class="sec-title">Salat</span>
                <span class="sec-meta">{{ salatDone }}/5</span>
                <button class="mini" @click="allTepat">Semua tepat</button>
              </div>
              <div class="rows">
                <div v-for="p in PRAYERS" :key="p.key" class="row">
                  <span class="row-label">{{ p.label }}</span>
                  <StatusPicker v-model="draft.salat[p.key]" :levels="SALAT_LEVELS" />
                </div>
              </div>
            </section>

            <!-- Lari -->
            <section class="sec">
              <div class="sec-head">
                <span class="sec-icon">🏃</span>
                <span class="sec-title">Lari Pagi</span>
              </div>
              <div class="row">
                <span class="row-label">Jarak</span>
                <NumberStepper v-model="draft.lari.km" unit="km" :step="0.5" :max="100" decimal />
              </div>
            </section>

            <!-- Semedi -->
            <section class="sec">
              <div class="sec-head">
                <span class="sec-icon">🧘</span>
                <span class="sec-title">Semedi</span>
              </div>
              <div class="row">
                <span class="row-label">Wimhof Breathing</span>
                <NumberStepper v-model="draft.semedi.wimhof" unit="round" :max="30" />
              </div>
              <div class="row">
                <span class="row-label">Meditasi</span>
                <NumberStepper v-model="draft.semedi.meditasi" unit="menit" :step="5" :max="300" />
              </div>
            </section>

            <!-- Kerja -->
            <section class="sec">
              <div class="sec-head">
                <span class="sec-icon">💼</span>
                <span class="sec-title">Kerja</span>
                <span class="sec-meta">min {{ KERJA_MIN_PER_PHASE }} pomodoro / fase</span>
              </div>
              <div class="rows">
                <div v-for="f in PHASES" :key="f.key" class="row">
                  <span class="row-label">
                    {{ f.label }}
                    <span
                      class="badge"
                      :class="{
                        ok: draft.kerja[f.key] >= KERJA_MIN_PER_PHASE,
                        warn: draft.kerja[f.key] > 0 && draft.kerja[f.key] < KERJA_MIN_PER_PHASE,
                      }"
                    >
                      {{ draft.kerja[f.key] }}/{{ KERJA_MIN_PER_PHASE }}
                    </span>
                  </span>
                  <NumberStepper
                    v-model="draft.kerja[f.key]"
                    unit="pomodoro"
                    :max="20"
                    :met="draft.kerja[f.key] >= KERJA_MIN_PER_PHASE"
                  />
                </div>
              </div>
            </section>

            <!-- No Toxic -->
            <section class="sec">
              <div class="sec-head">
                <span class="sec-icon">🚫</span>
                <span class="sec-title">No Toxic</span>
              </div>
              <div class="rows">
                <div v-for="f in PHASES" :key="f.key" class="row">
                  <span class="row-label">{{ f.label }}</span>
                  <StatusPicker v-model="draft.notoxic[f.key]" :levels="NOTOXIC_LEVELS" />
                </div>
              </div>
            </section>

            <!-- Jurnaling & Belajar -->
            <section class="sec">
              <div class="sec-head">
                <span class="sec-icon">📝</span>
                <span class="sec-title">Jurnaling</span>
              </div>
              <div class="row">
                <span class="row-label">Pomodoro</span>
                <NumberStepper v-model="draft.jurnaling.pomodoro" unit="pomodoro" :max="20" />
              </div>
            </section>

            <section class="sec">
              <div class="sec-head">
                <span class="sec-icon">📚</span>
                <span class="sec-title">Belajar</span>
              </div>
              <div class="row">
                <span class="row-label">Pomodoro</span>
                <NumberStepper v-model="draft.belajar.pomodoro" unit="pomodoro" :max="20" />
              </div>
            </section>

            <!-- Catatan -->
            <section class="sec">
              <div class="sec-head">
                <span class="sec-icon">🗒️</span>
                <span class="sec-title">Catatan</span>
              </div>
              <textarea
                v-model="draft.notes"
                class="notes"
                rows="3"
                placeholder="Hal yang mau dicatat hari ini…"
              />
            </section>
          </div>

          <footer class="foot">
            <button class="btn btn-ghost" @click="resetDay">Kosongkan</button>
            <div class="foot-right">
              <button class="btn" @click="emit('close')">Batal</button>
              <button class="btn btn-primary" :disabled="saving" @click="save">
                {{ saving ? 'Menyimpan…' : 'Simpan' }}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(16, 24, 40, 0.4);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: flex-end;
  outline: none;
}

.panel {
  width: 100%;
  max-width: 520px;
  height: 100%;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  border-left: 1px solid var(--border);
}

/* ---------- Header ---------- */

.head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-2);
}

.head-main {
  flex: 1;
  min-width: 0;
}

.head-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-3);
}

.head-date {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin-top: 2px;
}

.close {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  color: var(--text-3);
  font-size: 14px;
  transition: all 0.14s ease;
  flex: none;
}

.close:hover {
  background: var(--surface-3);
  color: var(--text);
}

/* ---------- Body ---------- */

.body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sec {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 13px 14px 14px;
  background: var(--surface);
}

.sec-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 11px;
}

.sec-icon {
  font-size: 15px;
}

.sec-title {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
}

.sec-meta {
  font-size: 11px;
  color: var(--text-3);
  font-weight: 500;
  margin-left: auto;
}

.mini {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  padding: 3px 8px;
  border-radius: 7px;
  background: var(--accent-soft);
  transition: background 0.14s ease;
}

.mini:hover {
  background: #e2e5ff;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row + .row {
  margin-top: 9px;
}

.rows .row + .row {
  margin-top: 0;
}

.row-label {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 132px;
  flex: none;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-2);
}

.row > :last-child {
  flex: 1;
  min-width: 0;
}

.badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 20px;
  background: var(--surface-3);
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

.badge.ok {
  background: #dcfce7;
  color: #15803d;
}

.badge.warn {
  background: #ffedd5;
  color: #c2410c;
}

.notes {
  width: 100%;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 10px 12px;
  resize: vertical;
  outline: none;
  font-size: 13px;
  line-height: 1.5;
  background: var(--surface);
  transition: border-color 0.14s ease, box-shadow 0.14s ease;
}

.notes:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

/* ---------- Footer ---------- */

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  background: var(--surface-2);
}

.foot-right {
  display: flex;
  gap: 8px;
}

/* ---------- Transition ---------- */

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}

.sheet-enter-active .panel,
.sheet-leave-active .panel {
  transition: transform 0.26s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .panel,
.sheet-leave-to .panel {
  transform: translateX(100%);
}

@media (max-width: 560px) {
  .panel {
    max-width: 100%;
  }
  .row-label {
    width: 104px;
    font-size: 11.5px;
  }
}
</style>
