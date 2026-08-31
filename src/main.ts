import { createApp } from 'vue'
import TomoIcon from './components/TomoIcon.vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/story', component: () => import('./pages/Story.vue') },
  ],
})

createApp(App).component('TomoIcon', TomoIcon).use(router).mount('#app')
