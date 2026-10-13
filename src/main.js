import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

// Mulai pemantauan status login lebih awal supaya router guard bisa menunggu.
useAuthStore(pinia).init()

app.use(router)
app.mount('#app')
