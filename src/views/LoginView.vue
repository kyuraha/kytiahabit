<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROW_GROUPS } from '@/lib/constants'

const auth = useAuthStore()
const router = useRouter()

async function google() {
  const ok = await auth.loginGoogle()
  if (ok) router.push('/')
}
</script>

<template>
  <div class="auth">
    <!-- Sisi kiri: branding -->
    <aside class="brand">
      <div class="brand-inner">
        <div class="logo">
          <span class="logo-mark">✅</span>
          <span class="logo-text">Kytia Habit</span>
        </div>

        <h1 class="headline">
          Lacak kebiasaan harianmu,<br />
          lihat progresnya per minggu &amp; bulan.
        </h1>

        <p class="sub">
          Satu tempat untuk salat, lari, semedi, kerja, no toxic, jurnaling, dan belajar.
          Ditandai sekali klik, langsung terbaca polanya.
        </p>

        <ul class="features">
          <li v-for="g in ROW_GROUPS" :key="g.key">
            <span class="f-icon" :style="{ background: g.color + '18' }">{{ g.icon }}</span>
            <span class="f-label">{{ g.label }}</span>
          </li>
        </ul>
      </div>
      <div class="brand-foot">Dibuat untuk dipakai tiap hari — bukan dipajang.</div>
    </aside>

    <!-- Sisi kanan: login -->
    <main class="form-side">
      <div class="form-card">
        <div class="mobile-logo">
          <span class="logo-mark">✅</span>
          <span class="logo-text">Kytia Habit</span>
        </div>

        <div class="form-head">
          <h2>Masuk</h2>
          <p>Pakai akun Google kamu — tidak perlu bikin password baru.</p>
        </div>

        <div v-if="auth.demo" class="demo-banner">
          <span class="dot" />
          <div>
            <strong>Mode Demo aktif.</strong>
            Firebase belum dikonfigurasi, jadi kamu akan masuk sebagai pengguna demo dan
            data tersimpan di browser ini saja.
          </div>
        </div>

        <button class="btn google" :disabled="auth.busy" @click="google">
          <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.2 7-17.4z" />
            <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.8-6.1z" />
            <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.7 2.3-6.3 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
          </svg>
          {{ auth.busy ? 'Menghubungkan…' : 'Lanjutkan dengan Google' }}
        </button>

        <p v-if="auth.error" class="error">{{ auth.error }}</p>

        <div class="trust">
          <div class="trust-item">
            <span class="tick">🔒</span>
            <span>Datamu tersimpan di akunmu sendiri, hanya bisa diakses olehmu.</span>
          </div>
          <div class="trust-item">
            <span class="tick">☁️</span>
            <span>Tersinkron otomatis lewat Firebase — buka dari perangkat mana pun.</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
}

/* ---------- Brand ---------- */

.brand {
  position: relative;
  padding: 48px 56px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(155deg, #eef1ff 0%, #f7f9ff 45%, #f4fbf7 100%);
  border-right: 1px solid var(--border);
  overflow: hidden;
}

.brand::after {
  content: '';
  position: absolute;
  width: 460px;
  height: 460px;
  right: -180px;
  bottom: -200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 70, 229, 0.12), transparent 68%);
}

.brand-inner {
  position: relative;
  z-index: 1;
  max-width: 460px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 44px;
}

.logo-mark {
  font-size: 22px;
}

.logo-text {
  font-size: 16px;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.headline {
  font-size: 31px;
  line-height: 1.22;
  font-weight: 750;
  letter-spacing: -0.028em;
  color: var(--text);
}

.sub {
  margin-top: 16px;
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--text-2);
}

.features {
  list-style: none;
  padding: 0;
  margin: 30px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.features li {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px 6px 6px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 12.5px;
  font-weight: 550;
  color: var(--text-2);
  backdrop-filter: blur(4px);
}

.f-icon {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 12px;
}

.brand-foot {
  position: relative;
  z-index: 1;
  font-size: 12.5px;
  color: var(--text-3);
}

/* ---------- Login ---------- */

.form-side {
  display: grid;
  place-items: center;
  padding: 40px 24px;
  background: var(--surface);
}

.form-card {
  width: 100%;
  max-width: 384px;
}

.mobile-logo {
  display: none;
  align-items: center;
  gap: 9px;
  margin-bottom: 30px;
}

.form-head h2 {
  font-size: 24px;
  font-weight: 750;
  letter-spacing: -0.025em;
}

.form-head p {
  margin-top: 6px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-2);
}

.demo-banner {
  display: flex;
  gap: 9px;
  margin-top: 20px;
  padding: 11px 13px;
  border-radius: 11px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  font-size: 12px;
  line-height: 1.55;
  color: #92400e;
}

.demo-banner .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f59e0b;
  margin-top: 5px;
  flex: none;
}

.google {
  width: 100%;
  height: 48px;
  margin-top: 24px;
  gap: 11px;
  font-size: 14.5px;
  font-weight: 600;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-xs);
  transition: all 0.15s ease;
}

.google:hover:not(:disabled) {
  background: var(--surface-2);
  border-color: #c8d1dc;
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.google:active:not(:disabled) {
  transform: translateY(0);
}

.error {
  margin-top: 14px;
  font-size: 12.5px;
  line-height: 1.55;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 12px;
}

.trust {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.trust-item {
  display: flex;
  gap: 9px;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text-3);
}

.tick {
  flex: none;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .brand {
    padding: 34px 26px 30px;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .headline {
    font-size: 24px;
  }
  .brand-foot,
  .logo {
    display: none;
  }
  .form-side {
    padding: 32px 22px 48px;
  }
  .mobile-logo {
    display: flex;
  }
}
</style>
