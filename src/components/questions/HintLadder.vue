<script setup lang="ts">
/**
 * Progressive hints, one at a time (nudge → direction → near-giveaway).
 * The highest hint reached is persisted via progress.revealHint.
 * `fresh` (review sessions) starts the ladder at zero regardless of history.
 */
import { computed, nextTick, ref, useId } from 'vue'
import { Lightbulb } from 'lucide-vue-next'
import { BaseButton, BaseKbd } from 'rei-kit'
import { useProgressStore } from '@/stores/progress'
import MarkdownContent from '@/components/content/MarkdownContent.vue'


const props = withDefaults(
  defineProps<{
    questionId: string
    hints: readonly string[]
    fresh?: boolean
    showShortcut?: boolean
  }>(),
  { fresh: false, showShortcut: true },
)

const emit = defineEmits<{ revealed: [index: number] }>()

const progress = useProgressStore()
const local = ref(-1)
const headingId = `hints-${useId()}`

const shownIndex = computed(() =>
  props.fresh ? local.value : Math.max(local.value, progress.get(props.questionId).hintsRevealed),
)
const shown = computed(() => props.hints.slice(0, Math.min(shownIndex.value + 1, props.hints.length)))
const remaining = computed(() => props.hints.length - shown.value.length)
const listEl = ref<HTMLOListElement | null>(null)

async function revealNext(): Promise<boolean> {
  if (remaining.value <= 0) return false
  const index = shown.value.length
  local.value = index
  emit('revealed', index)
  await nextTick()
  const items = listEl.value?.querySelectorAll<HTMLElement>('li')
  items?.[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  await progress.revealHint(props.questionId, index)
  return true
}

defineExpose({ revealNext, remaining })
</script>

<template>
  <section v-if="hints.length" class="flex flex-col gap-3" :aria-labelledby="headingId">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 :id="headingId" class="flex items-center gap-2 text-sm font-semibold text-ink">
        <Lightbulb class="size-4 text-warning" aria-hidden="true" />
        Hints
        <span class="font-normal text-ink-soft tabular-nums">
          {{ shown.length ? `${shown.length} of ${hints.length}` : `${hints.length} available` }}
        </span>
      </h2>
      <BaseButton v-if="remaining > 0" variant="secondary" size="sm" @click="revealNext">
        {{ shown.length ? `Show hint ${shown.length + 1} of ${hints.length}` : 'Show a hint' }}
        <span class="ms-1 hidden sm:inline-flex"><BaseKbd v-if="showShortcut" keys="H" size="sm" /></span>
      </BaseButton>
      <span v-else class="text-xs text-ink-soft">All hints shown</span>
    </div>

    <ol v-if="shown.length" ref="listEl" class="flex flex-col gap-2" aria-live="polite">
      <TransitionGroup name="reveal">
        <li
          v-for="(hint, index) in shown"
          :key="index"
          class="tint-panel tint-warning flex gap-3"
        >
          <span class="mt-0.5 shrink-0 text-xs font-semibold text-ink-soft tabular-nums" aria-hidden="true">
            {{ index + 1 }}
          </span>
          <span class="sr-only">Hint {{ index + 1 }} of {{ hints.length }}:</span>
          <MarkdownContent :source="hint" class="text-sm" />
        </li>
      </TransitionGroup>
    </ol>
    <p v-else class="text-sm text-ink-soft">Stuck? Take one hint at a time — each is a little stronger.</p>
  </section>
</template>
