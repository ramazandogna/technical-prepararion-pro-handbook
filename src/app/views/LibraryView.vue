<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCard, BaseInput, EmptyState, SegmentedControl } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { Library, Search, SlidersHorizontal, X } from 'lucide-vue-next'
import { allEntries } from '@/content'
import { useQuestionFilters, type SortKey } from '@/composables/useQuestionFilters'
import PageTitle from '@/components/common/PageTitle.vue'
import QuestionRow from '@/components/common/QuestionRow.vue'
import LibraryFilters from '@/components/common/LibraryFilters.vue'

const { filters, searchText, setFilter, clear, activeCount, results, visible, hasMore, showMore } =
  useQuestionFilters()

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'curriculum', label: 'Curriculum' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'recent', label: 'Recent' },
]

const filtersOpen = ref(false)
</script>

<template>
  <div class="flex flex-col gap-5">
    <PageTitle
      title="Library"
      :description="`Every question in one place: ${allEntries.length} and counting. Search, filter, and pick what to practise.`"
    />

    <div class="flex flex-col gap-4">
      <div class="flex items-end gap-2">
        <BaseInput
          v-model="searchText"
          class="min-w-0 flex-1"
          type="search"
          label="Search questions"
          label-hidden
          placeholder="Search titles, prompts, tags…"
          autocomplete="off"
        >
          <template #prefix><Search class="text-ink-soft size-4" aria-hidden="true" /></template>
        </BaseInput>
        <BaseButton
          class="shrink-0 lg:hidden"
          variant="secondary"
          :aria-label="`Filters${activeCount > 0 ? `, ${activeCount} active` : ''}`"
          @click="filtersOpen = true"
        >
          <SlidersHorizontal class="size-4" aria-hidden="true" />
          <span aria-hidden="true">Filters</span>
          <span v-if="activeCount > 0" class="tabular-nums" aria-hidden="true">({{ activeCount }})</span>
        </BaseButton>
      </div>

      <BaseCard class="hidden lg:block" padding="md">
        <LibraryFilters />
      </BaseCard>

      <ResponsiveDialog v-model="filtersOpen" title="Filters" close-label="Close filters">
        <LibraryFilters />
        <template #actions>
          <BaseButton variant="ghost" :disabled="activeCount === 0" @click="clear">Clear all</BaseButton>
          <BaseButton @click="filtersOpen = false">Show {{ results.length }} results</BaseButton>
        </template>
      </ResponsiveDialog>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-ink-soft text-sm" role="status" aria-live="polite">
          <span class="text-ink font-medium tabular-nums">{{ results.length }}</span>
          {{ results.length === 1 ? 'question' : 'questions' }}
          <template v-if="activeCount > 0">
            ·
            <button type="button" class="text-primary focus-ring inline-flex items-center gap-1 rounded" @click="clear">
              <X class="size-3.5" aria-hidden="true" />Clear filters
            </button>
          </template>
        </p>
        <div role="group" aria-label="Sort by" class="flex items-center gap-2">
          <span class="text-ink-soft text-xs font-medium" aria-hidden="true">Sort</span>
          <SegmentedControl
            :options="sortOptions"
            :model-value="filters.sort"
            @update:model-value="(v) => setFilter('sort', v)"
          />
        </div>
      </div>
    </div>

    <BaseCard v-if="visible.length > 0" padding="none">
      <ul class="divide-hair divide-y">
        <li v-for="e in visible" :key="e.question.id">
          <QuestionRow :question="e.question" :context="`${e.track.code} · ${e.track.title} › ${e.module.title}`" />
        </li>
      </ul>
    </BaseCard>

    <div v-if="hasMore" class="flex justify-center">
      <BaseButton variant="secondary" @click="showMore">
        Show more ({{ results.length - visible.length }} left)
      </BaseButton>
    </div>

    <EmptyState
      v-if="results.length === 0 && allEntries.length === 0"
      title="The library is being written"
      description="Questions appear here as each track is filled in."
    >
      <template #icon><Library class="size-6" aria-hidden="true" /></template>
    </EmptyState>
    <EmptyState
      v-else-if="results.length === 0"
      title="No questions match"
      description="Try fewer words or loosen a filter."
    >
      <template #icon><Search class="size-6" aria-hidden="true" /></template>
      <template #action>
        <BaseButton variant="secondary" @click="clear">Clear filters</BaseButton>
      </template>
    </EmptyState>
  </div>
</template>
