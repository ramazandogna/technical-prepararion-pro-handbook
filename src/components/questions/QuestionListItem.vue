<script setup lang="ts">
/** Compact, fully clickable row for question lists (track pages, library, review summary). */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BookmarkCheck, ChevronRight, Clock } from 'lucide-vue-next'
import { getEntry } from '@/content'
import { useProgressStore } from '@/stores/progress'
import StatusBadge from '@/components/common/StatusBadge.vue'
import TypeBadge from '@/components/common/TypeBadge.vue'
import DifficultyBadge from '@/components/common/DifficultyBadge.vue'

const props = withDefaults(
  defineProps<{
    questionId: string
    /** Show "C · JavaScript" — useful in cross-track lists. */
    showTrack?: boolean
    showStatus?: boolean
  }>(),
  { showTrack: false, showStatus: true },
)

const progress = useProgressStore()
const entry = computed(() => getEntry(props.questionId))
const record = computed(() => progress.get(props.questionId))
</script>

<template>
  <RouterLink
    v-if="entry"
    :to="`/q/${entry.question.id}`"
    class="focus-ring group flex items-center gap-3 rounded-card px-3 py-2.5 transition-colors hover:bg-muted/60"
  >
    <span class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="flex items-start gap-1.5">
        <span class="min-w-0 text-sm font-medium leading-snug text-ink group-hover:text-primary">
          {{ entry.question.title }}
        </span>
        <BookmarkCheck v-if="record.bookmarked" class="mt-0.5 size-3.5 shrink-0 text-primary" aria-label="Bookmarked" />
      </span>
      <span class="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
        <span v-if="showTrack" class="font-medium">{{ entry.track.code }} · {{ entry.track.title }}</span>
        <TypeBadge :value="entry.question.type" />
        <DifficultyBadge :value="entry.question.difficulty" />
        <span class="inline-flex items-center gap-1 tabular-nums">
          <Clock class="size-3" aria-hidden="true" />{{ entry.question.estMinutes }} min
        </span>
      </span>
    </span>
    <StatusBadge v-if="showStatus" :value="progress.statusOf(entry.question.id)" class="shrink-0" />
    <ChevronRight class="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
  </RouterLink>
</template>
