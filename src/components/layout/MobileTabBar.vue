<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { TabBar, type TabItem } from 'rei-kit'
import { Ellipsis, LayoutDashboard, Library, Map, RotateCcw } from 'lucide-vue-next'

type TabKey = 'dashboard' | 'roadmap' | 'review' | 'library' | 'more'

const route = useRoute()

const items: readonly TabItem<TabKey>[] = [
  { key: 'dashboard', to: '/', label: 'Home', icon: LayoutDashboard },
  { key: 'roadmap', to: '/roadmap', label: 'Roadmap', icon: Map },
  { key: 'review', to: '/review', label: 'Review', icon: RotateCcw },
  { key: 'library', to: '/library', label: 'Library', icon: Library },
  { key: 'more', to: '/settings', label: 'More', icon: Ellipsis },
]

const active = computed<TabKey | undefined>(() => {
  const nav = route.meta.nav
  if (!nav) return undefined
  if (nav === 'settings' || nav === 'notes' || nav === 'about') return 'more'
  return nav
})
</script>

<template>
  <!-- TabBar positions itself absolutely; this zero-height fixed box pins it to the viewport bottom. -->
  <div class="fixed inset-x-0 bottom-0 z-40 h-0">
    <TabBar :items="items" :active="active" label="Primary" />
  </div>
</template>
