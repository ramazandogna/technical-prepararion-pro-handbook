<script setup lang="ts">
/** Track / type / difficulty / priority / status / bookmark / note filters for the Library. URL-backed. */
import { computed } from 'vue'
import { BaseChip, BaseSelect } from 'rei-kit'
import { Bookmark, NotebookPen } from 'lucide-vue-next'
import { tracks } from '@/content'
import type { Difficulty, Priority, QuestionType, TrackId } from '@/types/content'
import type { ProgressStatus } from '@/types/progress'
import { useQuestionFilters } from '@/composables/useQuestionFilters'
import { DIFFICULTY_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS } from './labels'

const { filters, setFilter } = useQuestionFilters()

const trackOptions = computed(() => [
  { value: '', label: 'All tracks' },
  ...tracks.map((t) => ({ value: t.id as string, label: `${t.code} · ${t.title}` })),
])
const typeOptions = [{ value: '', label: 'All types' }, ...TYPE_OPTIONS]
const difficultyOptions = [{ value: '', label: 'Any difficulty' }, ...DIFFICULTY_OPTIONS]
const priorityOptions = [{ value: '', label: 'Any priority' }, ...PRIORITY_OPTIONS]
const statusChips: { value: ProgressStatus | ''; label: string }[] = [{ value: '', label: 'All' }, ...STATUS_OPTIONS]
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <BaseSelect
        label="Track"
        size="sm"
        :options="trackOptions"
        :model-value="filters.track"
        @update:model-value="(v) => setFilter('track', (v ?? '') as TrackId | '')"
      />
      <BaseSelect
        label="Type"
        size="sm"
        :options="typeOptions"
        :model-value="filters.type"
        @update:model-value="(v) => setFilter('type', (v ?? '') as QuestionType | '')"
      />
      <BaseSelect
        label="Difficulty"
        size="sm"
        :options="difficultyOptions"
        :model-value="filters.difficulty"
        @update:model-value="(v) => setFilter('difficulty', (v ?? '') as Difficulty | '')"
      />
      <BaseSelect
        label="Priority"
        size="sm"
        :options="priorityOptions"
        :model-value="filters.priority"
        @update:model-value="(v) => setFilter('priority', (v ?? '') as Priority | '')"
      />
    </div>
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div role="group" aria-label="Status" class="flex flex-wrap items-center gap-1.5">
        <span class="text-ink-soft mr-1 text-xs font-medium" aria-hidden="true">Status</span>
        <BaseChip
          v-for="s in statusChips"
          :key="s.value"
          :label="s.label"
          :selected="filters.status === s.value"
          @select="setFilter('status', s.value)"
        />
      </div>
      <div role="group" aria-label="Personal" class="flex flex-wrap gap-1.5">
        <BaseChip
          label="Bookmarked"
          :icon="Bookmark"
          :selected="filters.bookmarked"
          @select="setFilter('bookmarked', !filters.bookmarked)"
        />
        <BaseChip
          label="Has note"
          :icon="NotebookPen"
          :selected="filters.note"
          @select="setFilter('note', !filters.note)"
        />
      </div>
    </div>
  </div>
</template>
