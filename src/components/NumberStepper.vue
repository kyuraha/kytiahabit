<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [Number, null], default: null },
  unit: { type: String, default: '' },
  step: { type: Number, default: 1 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 99 },
  decimal: { type: Boolean, default: false },
  met: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const value = computed(() => (typeof props.modelValue === 'number' ? props.modelValue : 0))

function set(v) {
  let n = Number(v)
  if (Number.isNaN(n)) n = 0
  n = Math.max(props.min, Math.min(props.max, n))
  if (!props.decimal) n = Math.round(n)
  else n = Math.round(n * 2) / 2
  emit('update:modelValue', n === 0 ? 0 : n)
}

const dec = () => set(Math.round((value.value - props.step) * 100) / 100)
const inc = () => set(Math.round((value.value + props.step) * 100) / 100)
</script>

<template>
  <div class="stepper" :class="{ met }">
    <button type="button" class="sbtn" :disabled="value <= min" @click="dec">−</button>
    <div class="field">
      <input
        :value="value"
        type="number"
        inputmode="decimal"
        :step="step"
        :min="min"
        :max="max"
        @input="set($event.target.value)"
      />
      <span v-if="unit" class="unit">{{ unit }}</span>
    </div>
    <button type="button" class="sbtn" :disabled="value >= max" @click="inc">+</button>
  </div>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: stretch;
  gap: 0;
  height: 40px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface);
  overflow: hidden;
  transition: border-color 0.14s ease, box-shadow 0.14s ease;
}

.stepper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.stepper.met {
  border-color: #8ba382;
  background: #e9ede6;
}

.sbtn {
  width: 38px;
  flex: none;
  display: grid;
  place-items: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-2);
  background: var(--surface-2);
  transition: background 0.12s ease;
  line-height: 1;
}

.sbtn:hover:not(:disabled) {
  background: var(--surface-3);
  color: var(--text);
}

.sbtn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.field {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
}

.field input {
  height: 100%;
  width: 4.5ch;
  flex: none;
  border: none;
  outline: none;
  background: transparent;
  text-align: right;
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  padding: 0;
  -moz-appearance: textfield;
  appearance: textfield;
}

.field input::-webkit-outer-spin-button,
.field input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.unit {
  flex: none;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-3);
  line-height: 1;
}
</style>
