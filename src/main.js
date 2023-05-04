import { createApp } from 'vue'
import { initFpsDetection } from './fps'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')

initFpsDetection()
