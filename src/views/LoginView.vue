<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
        <div class="logo">Kytia Habit</div>

        <h1 class="headline">Catat kebiasaan harianmu.</h1>

        <p class="sub">Mingguan dan bulanan, dalam satu tampilan.</p>
      </div>
    </aside>

    <!-- Sisi kanan: login -->
    <main class="form-side">
      <div class="form-card">
        <div class="mobile-logo">Kytia Habit</div>

        <div class="form-head">
          <h2>Masuk</h2>
          <p>Pakai akun Google.</p>
        </div>

        <div v-if="auth.demo" class="demo-banner">
          <span class="dot" />
          <div>
            <strong>Mode Demo.</strong> Firebase belum dikonfigurasi — data tersimpan di
            browser ini.
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
  background: linear-gradient(152deg, #c3ccc0 0%, #d2d1c7 38%, #c4ced1 70%, #cec5b4 100%);
  border-right: 1px solid var(--border);
  overflow: hidden;
}

.brand::after {
  content: '';
  position: absolute;
  width: 520px;
  height: 520px;
  right: -200px;
  bottom: -220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(38, 41, 35, 0.22), transparent 68%);
}

.brand-inner {
  position: relative;
  z-index: 1;
  max-width: 460px;
}

.logo {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: #4a4f45;
  margin-bottom: 52px;
}

.headline {
  font-size: 33px;
  line-height: 1.24;
  font-weight: 750;
  letter-spacing: -0.032em;
  color: var(--text);
  max-width: 15ch;
}

.sub {
  margin-top: 18px;
  font-size: 14.5px;
  line-height: 1.65;
  color: #41463d;
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
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--text-2);
  margin-bottom: 34px;
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
  background: #ece4cf;
  border: 1px solid #d4c39a;
  font-size: 12px;
  line-height: 1.55;
  color: #6d561c;
}

.demo-banner .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a8862f;
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
  border-radius: 9px;
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
  color: #5e2724;
  background: #e8d8d6;
  border: 1px solid #cdb3b0;
  border-radius: 8px;
  padding: 10px 12px;
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
    font-size: 25px;
  }
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
