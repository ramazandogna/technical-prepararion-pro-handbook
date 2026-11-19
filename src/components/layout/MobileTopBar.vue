<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { GraduationCap } from 'lucide-vue-next'
import SearchButton from './SearchButton.vue'

const route = useRoute()
const title = computed(() => (route.name === 'dashboard' ? 'Interview OS' : (route.meta.title ?? 'Interview OS')))
</script>

<template>
  <header
    class="border-hair bg-surface/80 sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md"
  >
    <div class="flex h-14 items-center gap-3 px-4">
      <RouterLink to="/" class="focus-ring rounded-card" aria-label="Interview OS home">
        <span class="bg-primary text-on-primary flex size-8 items-center justify-center rounded-card">
          <GraduationCap class="size-4" aria-hidden="true" />
        </span>
      </RouterLink>
      <p class="text-ink min-w-0 flex-1 truncate font-semibold">{{ title }}</p>
      <SearchButton compact />
    </div>
  </header>
</template>
