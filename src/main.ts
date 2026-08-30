import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/story', component: () => import('./pages/Story.vue') },
  ],
})

createApp(App).use(router).mount('#app')
