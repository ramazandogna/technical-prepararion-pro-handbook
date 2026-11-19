<script setup lang="ts">
import { ref } from 'vue'
import { Clock } from 'lucide-vue-next'
import type { Question } from '@/types/content'
import MarkdownContent from '@/components/content/MarkdownContent.vue'
import CodeSnippet from '@/components/content/CodeSnippet.vue'
import TypeBadge from '@/components/common/TypeBadge.vue'
import DifficultyBadge from '@/components/common/DifficultyBadge.vue'
import PriorityBadge from '@/components/common/PriorityBadge.vue'

withDefaults(
  defineProps<{
    question: Question
    /** h1 on the question page, h2 inside a review session. */
    headingLevel?: 1 | 2
    showTags?: boolean
  }>(),
  { headingLevel: 1, showTags: true },
)

const heading = ref<HTMLElement | null>(null)
const setHeading = (el: unknown) => {
  heading.value = el instanceof HTMLElement ? el : null
}

/** Moves focus to the title — used when a review card changes. */
function focusHeading() {
  heading.value?.focus({ preventScroll: false })
}
defineExpose({ focusHeading })
</script>

<template>
  <section class="flex flex-col gap-4" :aria-labelledby="`q-title-${question.id}`">
    <div class="flex flex-wrap items-center gap-2 text-sm">
      <TypeBadge :value="question.type" />
      <DifficultyBadge :value="question.difficulty" />
      <PriorityBadge :value="question.priority" />
      <span class="inline-flex items-center gap-1 text-ink-soft">
        <Clock class="size-3.5" aria-hidden="true" />
        <span class="tabular-nums">~{{ question.estMinutes }} min</span>
      </span>
    </div>

    <component
      :is="headingLevel === 1 ? 'h1' : 'h2'"
      :id="`q-title-${question.id}`"
      :ref="setHeading"
      tabindex="-1"
      class="focus-target text-xl font-semibold leading-snug tracking-tight text-ink text-balance sm:text-2xl"
    >
      {{ question.title }}
    </component>

    <MarkdownContent :source="question.prompt" code-label="Prompt code" class="text-base" />

    <CodeSnippet
      v-if="question.code"
      :code="question.code.source"
      :language="question.code.language"
      :label="`Code for: ${question.title}`"
    />

    <ul v-if="showTags && question.tags.length" class="flex flex-wrap gap-1.5" aria-label="Tags">
      <li v-for="tag in question.tags" :key="tag" class="rounded-full bg-muted px-2 py-0.5 text-xs text-ink-soft">
        #{{ tag }}
      </li>
    </ul>
  </section>
</template>
