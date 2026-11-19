import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getEntry, getTrack } from '@/content'

declare module 'vue-router' {
  interface RouteMeta {
    /** Page title; becomes "X · Interview OS". */
    title?: string
    /** Which primary nav item is highlighted. */
    nav?: 'dashboard' | 'roadmap' | 'review' | 'library' | 'notes' | 'settings' | 'about'
  }
}

const APP_NAME = 'Interview OS'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'Dashboard', nav: 'dashboard' },
  },
  {
    path: '/roadmap',
    name: 'roadmap',
    component: () => import('../views/RoadmapView.vue'),
    meta: { title: 'Roadmap', nav: 'roadmap' },
  },
  {
    path: '/tracks/:trackId',
    name: 'track',
    component: () => import('../views/TrackView.vue'),
    meta: { title: 'Track', nav: 'roadmap' },
  },
  {
    path: '/q/:questionId',
    name: 'question',
    component: () => import('../views/QuestionView.vue'),
    meta: { title: 'Question', nav: 'library' },
  },
  {
    path: '/review',
    name: 'review',
    component: () => import('../views/ReviewView.vue'),
    meta: { title: 'Review', nav: 'review' },
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('../views/LibraryView.vue'),
    meta: { title: 'Library', nav: 'library' },
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('../views/NotesView.vue'),
    meta: { title: 'Notes', nav: 'notes' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { title: 'Settings', nav: 'settings' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { title: 'About', nav: 'about' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Not found' },
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) {
      // Wait for the lazy view + page transition before scrolling to the anchor.
      return new Promise((resolve) => {
        setTimeout(() => resolve({ el: to.hash, top: 16, behavior: 'smooth' }), 350)
      })
    }
    // Query-only changes (library filters) keep the scroll position.
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

/** Set document.title; views with dynamic titles (track, question) may refine it. */
export function setPageTitle(title?: string) {
  document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
}

router.afterEach((to) => {
  let title = to.meta.title
  if (to.name === 'track') title = getTrack(String(to.params.trackId))?.title ?? 'Track not found'
  if (to.name === 'question') title = getEntry(String(to.params.questionId))?.question.title ?? 'Question not found'
  setPageTitle(title)
})
