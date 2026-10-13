<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div v-if="!auth.ready" class="boot">
    <div class="boot-mark">✅</div>
    <div class="boot-text">Menyiapkan…</div>
  </div>

  <router-view v-else v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style scoped>
.boot {
  min-height: 100vh;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 12px;
  color: var(--text-3);
}

.boot-mark {
  font-size: 34px;
  animation: pulse 1.4s ease-in-out infinite;
}

.boot-text {
  font-size: 13.5px;
  font-weight: 500;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.94);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
