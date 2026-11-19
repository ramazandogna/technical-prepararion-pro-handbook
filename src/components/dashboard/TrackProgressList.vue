<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { BaseCard, ProgressBar } from 'rei-kit'
import { tracks } from '@/content'
import { useProgressStore } from '@/stores/progress'
import TrackIcon from '@/components/common/TrackIcon.vue'

const progress = useProgressStore()
</script>

<template>
  <BaseCard as="section" padding="none" aria-labelledby="tracks-title">
    <template #head>
      <div class="flex items-center justify-between gap-2 px-4 py-3">
        <h2 id="tracks-title" class="text-ink font-semibold">Tracks</h2>
        <RouterLink to="/roadmap" class="text-primary focus-ring rounded text-sm">Roadmap</RouterLink>
      </div>
    </template>
    <ul class="divide-hair divide-y">
      <li v-for="t in tracks" :key="t.id">
        <RouterLink
          :to="`/tracks/${t.id}`"
          class="hover:bg-muted/60 focus-ring flex items-center gap-3 px-4 py-3 transition-colors"
        >
          <span class="bg-muted text-ink-soft flex size-8 shrink-0 items-center justify-center rounded-card">
            <TrackIcon :name="t.icon" class="size-4" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex items-baseline justify-between gap-2">
              <span class="text-ink min-w-0 truncate text-sm font-medium">
                <span class="text-ink-soft mr-1 tabular-nums">{{ t.code }}</span>{{ t.title }}
              </span>
              <span class="text-ink-soft shrink-0 text-xs tabular-nums">
                {{ progress.trackStats(t.id).mastered }}/{{ progress.trackStats(t.id).total }}
              </span>
            </span>
            <ProgressBar
              class="mt-1.5"
              size="sm"
              :value="progress.trackStats(t.id).mastered"
              :max="Math.max(1, progress.trackStats(t.id).total)"
              :label="`${t.title}: ${progress.trackStats(t.id).percent}% mastered`"
            />
          </span>
        </RouterLink>
      </li>
    </ul>
  </BaseCard>
</template>
