<script setup lang="ts">
import { computed } from 'vue'
import { Cloud, CloudOff, HardDrive, RefreshCw } from 'lucide-vue-next'
import { useSyncStore } from '@/stores/sync'

const sync = useSyncStore()
const text = computed(() => {
  if (sync.mode !== 'cloud') return 'This device only'
  if (sync.status === 'syncing') return 'Syncing…'
  if (sync.status === 'error') return 'Sync paused — saved here'
  return `Synced · code ${sync.label}`
})
</script>

<template>
  <RouterLink to="/settings#sync" class="focus-ring flex items-center gap-2 rounded px-2 text-xs text-ink-soft" :title="sync.error ?? undefined">
    <HardDrive v-if="sync.mode !== 'cloud'" class="size-3.5" aria-hidden="true" />
    <RefreshCw v-else-if="sync.status === 'syncing'" class="size-3.5 animate-spin" aria-hidden="true" />
    <CloudOff v-else-if="sync.status === 'error'" class="size-3.5 text-warning" aria-hidden="true" />
    <Cloud v-else class="size-3.5 text-positive" aria-hidden="true" />
    <span>{{ text }}</span>
  </RouterLink>
</template>
