<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, BaseCard, BaseInput, EmptyState, formatDate } from 'rei-kit'
import { NotebookPen, Search } from 'lucide-vue-next'
import { getEntry } from '@/content'
import { useNotesStore } from '@/stores/notes'
import PageTitle from '@/components/common/PageTitle.vue'

const notesStore = useNotesStore()
const query = ref('')

/** Markdown-ish body → readable plain text excerpt (rendered as text, never HTML). */
function toPlain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' [code] ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const items = computed(() =>
  notesStore.sorted.map((note) => {
    const entry = getEntry(note.questionId)
    const plain = toPlain(note.body)
    return {
      note,
      entry,
      title: entry?.question.title ?? `Removed question (${note.questionId})`,
      trackLabel: entry ? `${entry.track.code} · ${entry.track.title}` : 'Unknown track',
      excerpt: plain.length > 220 ? `${plain.slice(0, 220).trimEnd()}…` : plain,
      haystack: `${plain} ${entry?.question.title ?? ''} ${entry?.track.title ?? ''}`.toLowerCase(),
    }
  }),
)

const filtered = computed(() => {
  const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return items.value
  return items.value.filter((i) => terms.every((t) => i.haystack.includes(t)))
})

function updated(iso: string): string {
  return formatDate(new Date(iso), { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <PageTitle
      title="Notes"
      description="Your own words on each question: how it links to your projects, what tripped you up, what to say next time."
    />

    <template v-if="items.length > 0">
      <BaseInput v-model="query" type="search" label="Search notes" label-hidden placeholder="Search notes…">
        <template #prefix><Search class="text-ink-soft size-4" aria-hidden="true" /></template>
      </BaseInput>
      <p class="text-ink-soft text-sm" role="status" aria-live="polite">
        <span class="text-ink font-medium tabular-nums">{{ filtered.length }}</span>
        of {{ items.length }} notes
      </p>

      <ul v-if="filtered.length > 0" class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <li v-for="i in filtered" :key="i.note.questionId">
          <BaseCard as="article" class="h-full">
            <p class="text-ink-soft flex flex-wrap justify-between gap-2 text-xs">
              <span>{{ i.trackLabel }}</span>
              <time :datetime="i.note.updatedAt">Updated {{ updated(i.note.updatedAt) }}</time>
            </p>
            <h2 class="text-ink mt-1 font-semibold leading-snug">
              <RouterLink v-if="i.entry" :to="`/q/${i.note.questionId}`" class="focus-ring hover:text-primary rounded">
                {{ i.title }}
              </RouterLink>
              <span v-else>{{ i.title }}</span>
            </h2>
            <p class="text-ink-soft mt-2 text-sm leading-relaxed break-words">{{ i.excerpt }}</p>
          </BaseCard>
        </li>
      </ul>
      <EmptyState v-else title="No notes match" description="Try a different word.">
        <template #icon><Search class="size-6" aria-hidden="true" /></template>
      </EmptyState>
    </template>

    <EmptyState
      v-else
      title="No notes yet"
      description="Open any question and write a note. It saves automatically and stays in this browser."
    >
      <template #icon><NotebookPen class="size-6" aria-hidden="true" /></template>
      <template #action>
        <BaseButton as="router-link" to="/library">Browse questions</BaseButton>
      </template>
    </EmptyState>
  </div>
</template>
