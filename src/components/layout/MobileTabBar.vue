<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { TabBar, type TabItem } from 'rei-kit'
import { Info, Library, Play, RotateCcw, Settings } from 'lucide-vue-next'

type TabKey = 'dashboard' | 'library' | 'review' | 'settings' | 'about'

const route = useRoute()

const items: readonly TabItem<TabKey>[] = [
  { key: 'dashboard', to: '/', label: 'Start', icon: Play },
  { key: 'library', to: '/library', label: 'Questions', icon: Library },
  { key: 'review', to: '/review', label: 'Review', icon: RotateCcw },
  { key: 'settings', to: '/settings', label: 'Settings', icon: Settings },
  { key: 'about', to: '/about', label: 'About', icon: Info },
]

const active = computed<TabKey | undefined>(() => {
  const nav = route.meta.nav
  if (!nav) return undefined
  if (nav === 'session') return 'dashboard'
  if (nav === 'roadmap') return 'library'
  if (nav === 'notes') return 'settings'
  return nav
})
</script>
<template>
  <!-- TabBar positions itself absolutely; this zero-height fixed box pins it to the viewport bottom. -->
  <div class="fixed inset-x-0 bottom-0 z-40 h-0">
    <TabBar :items="items" :active="active" label="Primary" />
  </div>
</template>
