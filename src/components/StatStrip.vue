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

const pct = computed(() =>
  Math.round((props.stats.filled / (props.stats.total || 1)) * 100),
)
</script>

<template>
  <div class="strip">
    <div class="stat card">
      <ScoreRing :score="stats.avg" :size="54" />
      <div class="info">
        <div class="label">Rata-rata</div>
        <div class="value">{{ stats.avg }}<span class="unit">%</span></div>
        <div class="sub">{{ stats.filled }} hari terisi</div>
      </div>
    </div>

    <div class="stat card">
      <div class="info">
        <div class="label">Streak</div>
        <div class="value">{{ streak }}<span class="unit">hari</span></div>
        <div class="sub">berturut-turut</div>
      </div>
    </div>

    <div class="stat card">
      <div class="info">
        <div class="label">Terisi</div>
        <div class="value">{{ stats.filled }}<span class="unit">/ {{ stats.total }}</span></div>
        <div class="sub">{{ pct }}% dari rentang</div>
      </div>
    </div>

    <div class="stat card">
      <div class="info">
        <div class="label">Terbaik</div>
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
  gap: 14px;
  padding: 16px 18px;
  min-width: 0;
}

.info {
  min-width: 0;
}

.label {
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value {
  font-size: 23px;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.unit {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-3);
  margin-left: 4px;
  letter-spacing: 0;
}

.sub {
  font-size: 12px;
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
