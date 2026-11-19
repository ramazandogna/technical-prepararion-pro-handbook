<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseCard } from 'rei-kit'
import { Bookmark } from 'lucide-vue-next'
import { getEntry, type QuestionEntry } from '@/content'
import { useProgressStore } from '@/stores/progress'
import QuestionRow from '@/components/common/QuestionRow.vue'

const LIMIT = 5
const progress = useProgressStore()

const entries = computed(() =>
  progress.bookmarkedIds.map((id) => getEntry(id)).filter((e): e is QuestionEntry => Boolean(e)),
)
</script>

<template>
  <BaseCard as="section" padding="none" aria-labelledby="bookmarks-title">
    <template #head>
      <div class="flex items-center justify-between gap-2 px-4 py-3">
        <h2 id="bookmarks-title" class="text-ink font-semibold">Bookmarked</h2>
        <RouterLink
          v-if="entries.length > 0"
          :to="{ path: '/library', query: { bookmarked: '1' } }"
          class="text-primary focus-ring rounded text-sm"
          >View all ({{ entries.length }})</RouterLink
        >
      </div>
    </template>
    <ul v-if="entries.length > 0" class="divide-hair divide-y">
      <li v-for="e in entries.slice(0, LIMIT)" :key="e.question.id">
        <QuestionRow :question="e.question" :context="`${e.track.code} · ${e.track.title}`" compact />
      </li>
    </ul>
    <p v-else class="text-ink-soft flex items-center gap-2 px-4 py-6 text-sm">
      <Bookmark class="size-4 shrink-0" aria-hidden="true" />
      Bookmark questions you want to revisit; they show up here.
    </p>
  </BaseCard>
</template>
