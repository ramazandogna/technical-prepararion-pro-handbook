import type { Component } from 'vue'
import { Info, LayoutDashboard, Library, Map, NotebookPen, RotateCcw, Settings } from 'lucide-vue-next'
import type { RouteMeta } from 'vue-router'

export type NavKey = NonNullable<RouteMeta['nav']>

export interface NavItem {
  key: NavKey
  to: string
  label: string
  icon: Component
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'dashboard', to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'roadmap', to: '/roadmap', label: 'Roadmap', icon: Map },
  { key: 'review', to: '/review', label: 'Review', icon: RotateCcw },
  { key: 'library', to: '/library', label: 'Library', icon: Library },
  { key: 'notes', to: '/notes', label: 'Notes', icon: NotebookPen },
  { key: 'settings', to: '/settings', label: 'Settings', icon: Settings },
  { key: 'about', to: '/about', label: 'About', icon: Info },
]
