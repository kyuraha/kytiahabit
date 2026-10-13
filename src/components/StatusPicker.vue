<script setup>
import { colorOf } from '@/lib/constants'

const props = defineProps({
  modelValue: { type: String, default: '' },
  levels: { type: Array, required: true },
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

function pick(key) {
  emit('update:modelValue', props.modelValue === key ? '' : key)
}
</script>

<template>
  <div class="picker" :class="{ compact }">
    <button
      v-for="l in levels"
      :key="l.key"
      type="button"
      class="opt"
      :class="{ active: modelValue === l.key }"
      :style="{
        '--c': colorOf(l.color).solid,
        '--soft': colorOf(l.color).soft,
        '--ink': colorOf(l.color).ink,
      }"
      :title="l.label"
      @click="pick(l.key)"
    >
      <span class="dot" />
      <span class="txt">{{ l.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.opt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding: 0 8px;
  border-radius: 9px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12.5px;
  font-weight: 550;
  transition: all 0.13s ease;
  overflow: hidden;
}

.opt .dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--c);
  flex: none;
  opacity: 0.35;
  transition: all 0.13s ease;
}

.opt:hover {
  background: var(--surface-3);
  border-color: #d6cebf;
}

.opt.active {
  background: var(--soft);
  border-color: var(--c);
  color: var(--ink);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--c) 16%, transparent);
}

.opt.active .dot {
  opacity: 1;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 22%, transparent);
}

.compact .opt {
  height: 30px;
  padding: 0;
}

.compact .txt {
  display: none;
}

.compact .opt .dot {
  width: 11px;
  height: 11px;
}
</style>
