import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'

const router = createRouter({
  // Electron 环境使用 Hash 模式，Web 环境使用 History 模式
  history: import.meta.env.VITE_ELECTRON
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchPage.vue')
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesPage.vue')
    },
    {
      path: '/play',
      name: 'play',
      component: () => import('@/views/PlayPage.vue')
    }
  ],
})

export default router
