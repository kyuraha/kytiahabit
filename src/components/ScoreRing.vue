<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: { type: [Number, null], default: null },
  size: { type: Number, default: 64 },
  stroke: { type: Number, default: 6 },
  caption: { type: String, default: '' },
})

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dash = computed(() => {
  const pct = Math.max(0, Math.min(100, props.score ?? 0)) / 100
  return `${circumference.value * pct} ${circumference.value}`
})

const color = computed(() => {
  const s = props.score
  if (s == null) return '#c9c6bb'
  if (s >= 80) return '#4f6b4a'
  if (s >= 55) return '#a8862f'
  if (s >= 30) return '#a85f34'
  return '#8f3f3a'
})
</script>

<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="#dedcd4"
        :stroke-width="stroke"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="dash"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
        class="prog"
      />
    </svg>
    <div class="center">
      <span class="num" :style="{ color }">{{ score == null ? '–' : score }}</span>
      <span v-if="caption" class="cap">{{ caption }}</span>
    </div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
  display: grid;
  place-items: center;
  flex: none;
}

svg {
  position: absolute;
  inset: 0;
}

.prog {
  transition: stroke-dasharray 0.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease;
}

.center {
  display: grid;
  justify-items: center;
  line-height: 1;
}

.num {
  font-size: 17px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.cap {
  font-size: 9px;
  color: var(--text-3);
  margin-top: 2px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
</style>
