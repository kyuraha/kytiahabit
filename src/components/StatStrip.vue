<script setup>
import { computed } from 'vue'
import ScoreRing from './ScoreRing.vue'
import { mediumLabel, fromKey } from '@/lib/date'

const props = defineProps({
  stats: { type: Object, required: true },
  streak: { type: Number, default: 0 },
})

const bestLabel = computed(() => {
  if (!props.stats.best) return '—'
  return mediumLabel(fromKey(props.stats.best.key))
})
</script>

<template>
  <div class="strip">
    <div class="stat card avg">
      <ScoreRing :score="stats.avg" :size="62" caption="rata²" />
      <div class="info">
        <div class="label">Skor rata-rata</div>
        <div class="value">
          {{ stats.avg }}<span class="unit">%</span>
        </div>
        <div class="sub">dari {{ stats.filled }} hari terisi</div>
      </div>
    </div>

    <div class="stat card">
      <div class="icon" style="background: #eef0ff">🔥</div>
      <div class="info">
        <div class="label">Streak saat ini</div>
        <div class="value">
          {{ streak }}<span class="unit">hari</span>
        </div>
        <div class="sub">berturut-turut ≥ 50%</div>
      </div>
    </div>

    <div class="stat card">
      <div class="icon" style="background: #e8f8ee">📅</div>
      <div class="info">
        <div class="label">Hari terisi</div>
        <div class="value">
          {{ stats.filled }}<span class="unit">/ {{ stats.total }}</span>
        </div>
        <div class="sub">{{ Math.round((stats.filled / (stats.total || 1)) * 100) }}% terisi</div>
      </div>
    </div>

    <div class="stat card">
      <div class="icon" style="background: #fef6e7">🏆</div>
      <div class="info">
        <div class="label">Hari terbaik</div>
        <div class="value">
          {{ stats.best ? stats.best.score : '–' }}<span class="unit">%</span>
        </div>
        <div class="sub">{{ bestLabel }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px 16px;
  min-width: 0;
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 19px;
  flex: none;
}

.info {
  min-width: 0;
}

.label {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.045em;
  text-transform: uppercase;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value {
  font-size: 22px;
  font-weight: 750;
  letter-spacing: -0.03em;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
}

.unit {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-3);
  margin-left: 3px;
  letter-spacing: 0;
}

.sub {
  font-size: 11.5px;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 980px) {
  .strip {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .strip {
    grid-template-columns: 1fr;
  }
}
</style>
