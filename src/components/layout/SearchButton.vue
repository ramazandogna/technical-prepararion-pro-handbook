<script setup lang="ts">
import { computed } from 'vue'
import { Search } from 'lucide-vue-next'
import { BaseKbd } from 'rei-kit'
import { useCommandMenu } from '@/composables/useCommandMenu'

defineProps<{ compact?: boolean }>()

const { show } = useCommandMenu()
const isMac = computed(() => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform))
</script>

<template>
  <button
    v-if="compact"
    type="button"
    class="text-ink hover:bg-muted focus-ring inline-flex size-10 items-center justify-center rounded-full"
    aria-label="Search"
    @click="show"
  >
    <Search class="size-5" aria-hidden="true" />
  </button>
  <button
    v-else
    type="button"
    class="control text-ink-soft hover:text-ink focus-ring flex w-full items-center gap-2 rounded-card px-3 py-2 text-sm"
    @click="show"
  >
    <Search class="size-4 shrink-0" aria-hidden="true" />
    <span class="flex-1 text-left">Search…</span>
    <BaseKbd :keys="[isMac ? '⌘' : 'Ctrl', 'K']" size="sm" />
  </button>
</template>
