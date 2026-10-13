<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDaysStore } from '@/stores/days'
import MatrixGrid from '@/components/MatrixGrid.vue'
import DayEditor from '@/components/DayEditor.vue'
import StatStrip from '@/components/StatStrip.vue'
import {
  weekDates,
  monthDates,
  toKey,
  addDays,
  addMonths,
  rangeLabel,
  todayKey,
} from '@/lib/date'
import { rangeStats, dayScore } from '@/lib/scoring'

const auth = useAuthStore()
const days = useDaysStore()
const router = useRouter()

const mode = ref('week')
const anchor = ref(new Date())
const menuOpen = ref(false)

const editorOpen = ref(false)
const editorKey = ref('')

const today = todayKey()

const dates = computed(() =>
  mode.value === 'week' ? weekDates(anchor.value) : monthDates(anchor.value),
)
const keys = computed(() => dates.value.map(toKey))
const dayMap = computed(() => days.days)

const label = computed(() => rangeLabel(mode.value, anchor.value))
const stats = computed(() => rangeStats(keys.value, dayMap.value))

const streak = computed(() => {
  const ks = Array.from({ length: 60 }, (_, i) => toKey(addDays(new Date(), -(59 - i))))
  let i = ks.length - 1
  if (dayScore(dayMap.value[ks[i]]) == null) i -= 1
  let n = 0
  for (; i >= 0; i -= 1) {
    const s = dayScore(dayMap.value[ks[i]])
    if (s != null && s >= 50) n += 1
    else break
  }
  return n
})

const isCurrent =
  mode.value === 'week'
    ? toKey(weekDates(anchor.value)[0]) === toKey(weekDates(new Date())[0])
    : anchor.value.getMonth() === new Date().getMonth() &&
      anchor.value.getFullYear() === new Date().getFullYear()

async function loadVisible() {
  if (!dates.value.length) return
  await days.loadRange(dates.value[0], dates.value[dates.value.length - 1])
}

watch(dates, loadVisible)

onMounted(async () => {
  await days.loadRange(addDays(new Date(), -59), new Date())
  await loadVisible()
})

function shift(n) {
  anchor.value = mode.value === 'week' ? addDays(anchor.value, n * 7) : addMonths(anchor.value, n)
}

function goToday() {
  anchor.value = new Date()
}

function openEditor(key) {
  editorKey.value = key
  editorOpen.value = true
}

async function handleSave({ dateKey, entry }) {
  try {
    await days.saveDay(dateKey, entry)
    editorOpen.value = false
  } catch {
    /* error tersimpan di store */
  }
}

async function logout() {
  menuOpen.value = false
  days.reset()
  await auth.logout()
  router.push('/login')
}

const editorEntry = computed(() => days.getDay(editorKey.value))
</script>

<template>
  <div class="page">
    <header class="top">
      <div class="brand">Kytia Habit</div>

      <div class="nav">
        <button class="navbtn" title="Sebelumnya" @click="shift(-1)">‹</button>
        <div class="range">
          <span class="range-txt">{{ label }}</span>
          <span v-if="isCurrent" class="now">sekarang</span>
        </div>
        <button class="navbtn" title="Berikutnya" @click="shift(1)">›</button>
        <button class="btn btn-sm" :disabled="isCurrent" @click="goToday">Hari ini</button>
      </div>

      <div class="right">
        <div class="segmented">
          <button :class="{ active: mode === 'week' }" @click="mode = 'week'">Mingguan</button>
          <button :class="{ active: mode === 'month' }" @click="mode = 'month'">Bulanan</button>
        </div>

        <button class="btn btn-primary btn-sm cta" title="Catat habit hari ini" @click="openEditor(today)">
          <span class="plus">+</span><span class="cta-txt">Catat</span>
        </button>

        <div class="user">
          <button class="avatar" @click="menuOpen = !menuOpen">
            {{ (auth.user?.name || auth.user?.email || '?')[0].toUpperCase() }}
          </button>
          <transition name="fade">
            <div v-if="menuOpen" class="menu">
              <div class="menu-head">
                <div class="menu-name">{{ auth.user?.name }}</div>
                <div class="menu-mail">{{ auth.user?.email }}</div>
                <div v-if="auth.demo" class="menu-badge">Mode Demo</div>
              </div>
              <button class="menu-item" @click="logout">Keluar</button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <div v-if="menuOpen" class="scrim" @click="menuOpen = false" />

    <main class="content">
      <StatStrip :stats="stats" :streak="streak" />

      <div v-if="days.loading" class="loading">
        <span class="spin" /> Memuat…
      </div>

      <div v-if="days.error" class="err">{{ days.error }}</div>

      <MatrixGrid :dates="dates" :mode="mode" :days="dayMap" @edit="openEditor" />
    </main>

    <DayEditor
      :open="editorOpen"
      :date-key="editorKey"
      :entry="editorEntry"
      :saving="days.saving"
      @close="editorOpen = false"
      @save="handleSave"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ---------- Header ---------- */

.top {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 22px;
  background: rgba(255, 254, 251, 0.86);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.brand {
  flex: none;
  font-size: 14px;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbtn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text-2);
  font-size: 16px;
  line-height: 1;
  transition: all 0.13s ease;
}

.navbtn:hover {
  background: var(--surface-3);
  color: var(--text);
}

.range {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 168px;
  justify-content: center;
}

.range-txt {
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.now {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 2px 7px;
  border-radius: 20px;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.cta .plus {
  font-size: 15px;
  line-height: 1;
  margin-top: -1px;
}

.user {
  position: relative;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(140deg, #5c7f8b, #7d97a0);
  color: #fff;
  font-weight: 700;
  font-size: 13.5px;
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-xs);
  transition: transform 0.14s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 9px);
  width: 216px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 6px;
  z-index: 50;
}

.menu-head {
  padding: 9px 10px 10px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 5px;
}

.menu-name {
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-mail {
  font-size: 11.5px;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-badge {
  display: inline-block;
  margin-top: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #7d6528;
  background: #f8f1e0;
  padding: 2px 7px;
  border-radius: 20px;
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 550;
  color: #894947;
  transition: background 0.13s ease;
}

.menu-item:hover {
  background: #f4e5e3;
}

.scrim {
  position: fixed;
  inset: 0;
  z-index: 39;
}

/* ---------- Content ---------- */

.content {
  padding: 18px 22px 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 1520px;
  width: 100%;
  margin: 0 auto;
}

.loading {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--text-3);
}

.spin {
  width: 13px;
  height: 13px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.err {
  font-size: 13px;
  color: #894947;
  background: #f4e5e3;
  border: 1px solid #e3cfcc;
  border-radius: var(--radius);
  padding: 10px 14px;
}

@media (max-width: 900px) {
  .top {
    gap: 10px;
    padding: 10px 14px;
  }
  .nav {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }
  .range {
    min-width: 0;
    flex: 1;
  }
  .right {
    margin-left: auto;
  }
  .cta-txt {
    display: none;
  }
  .content {
    padding: 14px 14px 32px;
  }
}
</style>
