<script setup lang="ts">
/** One question as a list row linking to /q/:id. Used by Track, Library and Dashboard lists. */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Bookmark, Clock, NotebookPen } from 'lucide-vue-next'
import type { Question } from '@/types/content'
import { useProgressStore } from '@/stores/progress'
import { useNotesStore } from '@/stores/notes'
import DifficultyBadge from './DifficultyBadge.vue'
import PriorityBadge from './PriorityBadge.vue'
import StatusBadge from './StatusBadge.vue'
import TypeBadge from './TypeBadge.vue'

const props = defineProps<{
  question: Question
  /** Optional context line, e.g. "C · JavaScript › Async". */
  context?: string
  /** Hide the type/difficulty/priority badges (compact lists). */
  compact?: boolean
}>()

const progress = useProgressStore()
const notes = useNotesStore()

const record = computed(() => progress.get(props.question.id))
const hasNote = computed(() => Boolean(notes.get(props.question.id)))
</script>

<template>
  <RouterLink
    :to="`/q/${question.id}`"
    class="hover:bg-muted/60 focus-ring group flex flex-col gap-2 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:gap-4"
  >
    <div class="min-w-0 flex-1">
      <p v-if="context" class="text-ink-soft truncate text-xs">{{ context }}</p>
      <p class="text-ink flex items-start gap-2 font-medium leading-snug">
        <span class="min-w-0">{{ question.title }}</span>
        <Bookmark
          v-if="record.bookmarked"
          class="text-primary mt-0.5 size-4 shrink-0 fill-current"
          aria-label="Bookmarked"
          role="img"
        />
        <NotebookPen v-if="hasNote" class="text-ink-soft mt-0.5 size-4 shrink-0" aria-label="Has a note" role="img" />
      </p>
      <div v-if="!compact" class="mt-2 flex flex-wrap items-center gap-1.5">
        <TypeBadge :value="question.type" />
        <DifficultyBadge :value="question.difficulty" />
        <PriorityBadge :value="question.priority" />
      </div>
    </div>
    <div class="flex shrink-0 items-center gap-3">
      <span class="text-ink-soft inline-flex items-center gap-1 text-xs tabular-nums">
        <Clock class="size-3.5" aria-hidden="true" />
        {{ question.estMinutes }} min
      </span>
      <StatusBadge :value="record.status" />
    </div>
  </RouterLink>
</template>
