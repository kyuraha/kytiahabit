<script setup>
import { computed } from 'vue'
import { ROW_GROUPS, colorOf } from '@/lib/constants'
import { rowCell, groupScore } from '@/lib/scoring'
import { toKey, DAY_NAMES, isWeekend, todayKey as todayKeyFn } from '@/lib/date'

const props = defineProps({
  dates: { type: Array, required: true },
  mode: { type: String, default: 'week' },
  days: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['edit'])

const today = todayKeyFn()

const gridStyle = computed(() => ({
  gridTemplateColumns: `var(--label-w) repeat(${props.dates.length}, ${
    props.mode === 'week' ? 'minmax(0, 1fr)' : 'var(--cell-w)'
  })`,
}))

const dayFor = (d) => props.days[toKey(d)] || null
const cellFor = (d, row) => rowCell(dayFor(d), row)

function groupAvg(g) {
  const vals = props.dates.map((d) => groupScore(dayFor(d), g.key)).filter((v) => v != null)
  if (!vals.length) return null
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function avgColor(avg) {
  if (avg == null) return '#cbd5e1'
  if (avg >= 80) return '#22c55e'
  if (avg >= 55) return '#eab308'
  if (avg >= 30) return '#f97316'
  return '#ef4444'
}

function weekCellStyle(cell) {
  const c = colorOf(cell.color)
  if (!cell.has) {
    return { background: 'var(--surface-2)', color: 'var(--text-3)', borderColor: 'var(--border)' }
  }
  return {
    background: c.soft,
    color: c.ink,
    borderColor: `color-mix(in srgb, ${c.solid} 42%, transparent)`,
  }
}

function monthCellStyle(cell) {
  const c = colorOf(cell.color)
  return { background: cell.has ? c.solid : 'var(--surface-3)' }
}

function tooltip(d, row, cell) {
  const date = `${DAY_NAMES[new Date(d).getDay()]}, ${new Date(d).getDate()}`
  if (!cell.has) return `${row.label} · ${date} — belum diisi`
  const val =
    row.kind === 'number' ? `${cell.value} ${row.unit}` : cell.label || cell.value
  return `${row.label} · ${date} — ${val}`
}

const isFuture = (d) => toKey(d) > today
</script>

<template>
  <div class="matrix" :class="`mode-${mode}`">
    <div class="grid" :style="gridStyle">
      <!-- Header -->
      <div class="corner" />
      <div
        v-for="d in dates"
        :key="'h' + toKey(d)"
        class="dayhead"
        :class="{ weekend: isWeekend(d), today: toKey(d) === today, future: isFuture(d) }"
      >
        <span v-if="mode === 'week'" class="dname">{{ DAY_NAMES[new Date(d).getDay()] }}</span>
        <span class="dnum">{{ new Date(d).getDate() }}</span>
      </div>

      <!-- Groups -->
      <template v-for="g in ROW_GROUPS" :key="g.key">
        <div class="grouplabel" :style="{ '--gc': g.color }">
          <span class="gname">{{ g.label }}</span>
        </div>
        <div class="groupavg" :style="{ '--gc': g.color, gridColumn: `span ${dates.length}` }">
          <div class="gbar">
            <div
              class="gfill"
              :style="{
                width: (groupAvg(g) ?? 0) + '%',
                background: avgColor(groupAvg(g)),
              }"
            />
          </div>
          <span class="gscore" :style="{ color: avgColor(groupAvg(g)) }">
            {{ groupAvg(g) == null ? '–' : groupAvg(g) + '%' }}
          </span>
        </div>

        <template v-for="row in g.rows" :key="row.id">
          <div class="rowlabel">
            <span class="rname">{{ row.label }}</span>
            <span v-if="row.kind === 'number'" class="runit">{{ row.unit }}</span>
          </div>
          <button
            v-for="d in dates"
            :key="row.id + toKey(d)"
            type="button"
            class="cell"
            :class="{
              today: toKey(d) === today,
              future: isFuture(d),
              empty: !cellFor(d, row).has,
              num: row.kind === 'number',
            }"
            :style="mode === 'week' ? weekCellStyle(cellFor(d, row)) : monthCellStyle(cellFor(d, row))"
            :title="tooltip(d, row, cellFor(d, row))"
            @click="emit('edit', toKey(d))"
          >
            <template v-if="mode === 'week'">
              <span v-if="cellFor(d, row).has" class="val">
                {{ row.kind === 'number' ? cellFor(d, row).value : cellFor(d, row).label }}
              </span>
            </template>
          </button>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.matrix {
  overflow: auto;
  max-height: calc(100vh - 250px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow-xs);
  --label-w: 156px;
}

.mode-week {
  --cell-w: 26px;
}

.mode-month {
  --cell-w: 26px;
}

.grid {
  display: grid;
  gap: 3px;
  padding: 8px;
  min-width: max-content;
  align-items: stretch;
}

/* ---------- Header ---------- */

.corner {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 4;
  background: var(--surface);
  height: 46px;
}

.dayhead {
  position: sticky;
  top: 0;
  z-index: 3;
  background: var(--surface);
  height: 46px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border-radius: 6px;
}

.dayhead .dname {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-3);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.dayhead .dnum {
  font-size: 14px;
  font-weight: 650;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.dayhead.weekend .dname,
.dayhead.weekend .dnum {
  color: #8f5247;
}

.dayhead.future .dname,
.dayhead.future .dnum {
  color: var(--text-3);
  opacity: 0.6;
}

.dayhead.today {
  background: var(--accent-soft);
}

.dayhead.today .dname {
  color: var(--accent);
}

.dayhead.today .dnum {
  color: var(--accent-ink);
}

/* ---------- Group header ---------- */

.grouplabel {
  position: sticky;
  left: 0;
  z-index: 2;
  background: color-mix(in srgb, var(--gc) 10%, var(--surface));
  display: flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding-left: 9px;
  border-radius: 5px;
}

.gname {
  font-size: 12px;
  font-weight: 650;
  color: var(--text);
  letter-spacing: 0.005em;
}

.groupavg {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 30px;
  padding: 0 6px;
}

.gbar {
  flex: 1;
  height: 4px;
  border-radius: 4px;
  background: var(--surface-3);
  overflow: hidden;
}

.gfill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease, background 0.3s ease;
}

.gscore {
  font-size: 11.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 32px;
  text-align: right;
}

/* ---------- Rows ---------- */

.rowlabel {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 14px;
  min-height: 34px;
}

.rname {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.runit {
  font-size: 10px;
  color: var(--text-3);
  flex: none;
}

/* ---------- Cell ---------- */

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0;
  transition: transform 0.1s ease, box-shadow 0.13s ease, background 0.13s ease;
  position: relative;
  overflow: hidden;
}

.mode-week .cell {
  min-height: 34px;
}

.mode-month .cell {
  height: 26px;
  border-radius: 4px;
}

.cell:hover {
  box-shadow: 0 0 0 2px var(--accent), var(--shadow-sm);
  z-index: 1;
}

.cell:active {
  transform: scale(0.96);
}

.cell.empty {
  border-style: dashed;
  border-color: var(--border);
}

.mode-month .cell.empty {
  border-style: solid;
  border-color: transparent;
}

.cell.today {
  box-shadow: inset 0 0 0 1.5px var(--accent);
}

.cell.future {
  opacity: 0.55;
}

.cell .val {
  font-size: 11.5px;
  font-weight: 650;
  line-height: 1.05;
  padding: 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell.num .val {
  font-variant-numeric: tabular-nums;
  font-size: 12.5px;
}

@media (max-width: 720px) {
  .matrix {
    --label-w: 116px;
    max-height: calc(100vh - 300px);
  }
  .rname {
    font-size: 11.5px;
  }
  .cell .val {
    font-size: 10.5px;
  }
}
</style>
