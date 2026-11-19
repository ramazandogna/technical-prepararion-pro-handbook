<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ProgressBar } from 'rei-kit'
import type { Track } from '@/types/content'
import { useProgressStore } from '@/stores/progress'
import TrackIcon from './TrackIcon.vue'

const props = defineProps<{ track: Track }>()
const progress = useProgressStore()
const stats = computed(() => progress.trackStats(props.track.id))
const moduleCount = computed(() => props.track.modules.length)
</script>

<template>
  <RouterLink
    :to="`/tracks/${track.id}`"
    class="surface rounded-card focus-ring hover:border-primary/40 flex h-full flex-col gap-3 p-4 transition-colors"
  >
    <div class="flex items-start gap-3">
      <span class="bg-primary/12 text-primary flex size-10 shrink-0 items-center justify-center rounded-card">
        <TrackIcon :name="track.icon" class="size-5" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-ink-soft text-xs font-medium tabular-nums">Track {{ track.code }}</p>
        <h3 class="text-ink font-semibold leading-snug">{{ track.title }}</h3>
      </div>
    </div>
    <p class="text-ink-soft line-clamp-3 flex-1 text-sm leading-relaxed">{{ track.summary }}</p>
    <div>
      <div class="text-ink-soft mb-1.5 flex justify-between gap-2 text-xs tabular-nums">
        <span v-if="stats.total > 0">{{ stats.total }} questions · {{ moduleCount }} modules</span>
        <span v-else>Content coming soon</span>
        <span v-if="stats.total > 0">{{ stats.percent }}%</span>
      </div>
      <ProgressBar
        size="sm"
        :value="stats.mastered"
        :max="Math.max(1, stats.total)"
        :label="`${track.title}: ${stats.mastered} of ${stats.total} mastered`"
      />
    </div>
  </RouterLink>
</template>
