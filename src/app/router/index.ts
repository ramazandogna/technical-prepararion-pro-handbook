import { createRouter, createWebHistory } from 'vue-router'

// Placeholder — the Frontend Architect owns this file.
export const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: () => import('../views/DashboardView.vue') }],
})
