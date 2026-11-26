import type { Component } from 'vue'
import { Flag, Info, Library, Map, NotebookPen, Play, RotateCcw, Settings } from 'lucide-vue-next'
import type { RouteMeta } from 'vue-router'

export type NavKey = NonNullable<RouteMeta['nav']>

export interface NavItem {
  key: NavKey
  to: string
  label: string
  icon: Component
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'dashboard', to: '/', label: 'Start', icon: Play },
  { key: 'session', to: '/session', label: "Today's session", icon: Flag },
  { key: 'library', to: '/library', label: 'All questions', icon: Library },
  { key: 'review', to: '/review', label: 'Review', icon: RotateCcw },
  { key: 'roadmap', to: '/roadmap', label: 'Tracks', icon: Map },
  { key: 'notes', to: '/notes', label: 'Notes', icon: NotebookPen },
  { key: 'settings', to: '/settings', label: 'Settings', icon: Settings },
  { key: 'about', to: '/about', label: 'About', icon: Info },
]
