<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { BaseBadge } from 'rei-kit'
import { GraduationCap } from 'lucide-vue-next'
import { useProgressStore } from '@/stores/progress'
import { NAV_ITEMS } from './nav'
import SearchButton from './SearchButton.vue'

const route = useRoute()
const progress = useProgressStore()
const dueCount = computed(() => progress.dueIds.length)
</script>

<template>
  <aside class="border-hair bg-surface/60 sticky top-0 flex h-dvh w-64 shrink-0 flex-col gap-6 border-r px-4 py-6">
    <RouterLink to="/" class="focus-ring flex items-center gap-3 rounded-card px-2">
      <span class="bg-primary text-on-primary flex size-9 items-center justify-center rounded-card">
        <GraduationCap class="size-5" aria-hidden="true" />
      </span>
      <span class="min-w-0">
        <span class="text-ink block font-semibold leading-tight">Interview OS</span>
        <span class="text-ink-soft block text-xs">Interview preparation, your way</span>
      </span>
    </RouterLink>

    <SearchButton />

    <nav aria-label="Main" class="flex-1 overflow-y-auto">
      <ul class="flex flex-col gap-0.5">
        <li v-for="item in NAV_ITEMS" :key="item.key">
          <RouterLink
            :to="item.to"
            class="focus-ring flex items-center gap-3 rounded-card px-3 py-2 text-sm transition-colors"
            :class="
              route.meta.nav === item.key
                ? 'bg-primary/12 text-primary font-medium'
                : 'text-ink-soft hover:bg-muted hover:text-ink'
            "
            :aria-current="route.meta.nav === item.key ? 'page' : undefined"
          >
            <component :is="item.icon" class="size-4 shrink-0" aria-hidden="true" />
            <span class="flex-1">{{ item.label }}</span>
            <BaseBadge v-if="item.key === 'review' && dueCount > 0" tone="primary">
              <span class="tabular-nums">{{ dueCount }}</span>
              <span class="sr-only">due</span>
            </BaseBadge>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <p class="text-ink-soft px-2 text-xs leading-relaxed">All data stays in this browser.</p>
  </aside>
</template>
