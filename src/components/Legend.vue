<script setup>
import { SALAT_LEVELS, NOTOXIC_LEVELS, colorOf } from '@/lib/constants'
</script>

<template>
  <div class="legend">
    <span class="lt">Warna</span>
    <div class="items">
      <span v-for="l in SALAT_LEVELS" :key="l.key" class="item">
        <span class="sw" :style="{ background: colorOf(l.color).solid }" />
        {{ l.label }}
      </span>
      <span class="sep" />
      <span v-for="l in NOTOXIC_LEVELS" :key="'n' + l.key" class="item muted">
        <span class="sw" :style="{ background: colorOf(l.color).solid }" />
        {{ l.label }}
      </span>
      <span class="sep" />
      <span class="item muted">
        <span class="sw empty" />
        Belum diisi
      </span>
    </div>
    <span class="hint">Klik sel mana pun untuk mengisi</span>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 12px;
}

.lt {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-3);
}

.items {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-2);
  font-weight: 500;
}

.item.muted {
  color: var(--text-3);
}

.sw {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  flex: none;
}

.sw.empty {
  background: var(--surface-3);
  border: 1px dashed var(--border-strong);
}

.sep {
  width: 1px;
  height: 14px;
  background: var(--border);
}

.hint {
  margin-left: auto;
  font-size: 11.5px;
  color: var(--text-3);
}

@media (max-width: 720px) {
  .hint {
    display: none;
  }
}
</style>
