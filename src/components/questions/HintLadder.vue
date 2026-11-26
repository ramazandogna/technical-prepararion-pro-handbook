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
    /** What the question tests — shown as the first rung ("Goal") before the hints. */
    intent?: string
    fresh?: boolean
    showShortcut?: boolean
  }>(),
  { fresh: false, showShortcut: true, intent: undefined },
)

/** The ladder: the goal first (when known), then hints that get closer each time. */
const rungs = computed(() => [
  ...(props.intent ? [{ label: 'Goal', text: `**What this question tests:** ${props.intent}` }] : []),
  ...props.hints.map((text, i) => ({ label: `Hint ${i + 1}`, text })),
])

const emit = defineEmits<{ revealed: [index: number] }>()

const progress = useProgressStore()
const local = ref(-1)
const headingId = `hints-${useId()}`

const shownIndex = computed(() =>
  props.fresh ? local.value : Math.max(local.value, progress.get(props.questionId).hintsRevealed),
)
const shown = computed(() => rungs.value.slice(0, Math.min(shownIndex.value + 1, rungs.value.length)))
const remaining = computed(() => rungs.value.length - shown.value.length)
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
  <section v-if="rungs.length" class="flex flex-col gap-3" :aria-labelledby="headingId">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 :id="headingId" class="flex items-center gap-2 text-sm font-semibold text-ink">
        <Lightbulb class="size-4 text-warning" aria-hidden="true" />
        Hints
        <span class="font-normal text-ink-soft tabular-nums">
          {{ shown.length ? `${shown.length} of ${rungs.length}` : `${rungs.length} steps` }}
        </span>
      </h2>
      <BaseButton v-if="remaining > 0" variant="secondary" size="sm" @click="revealNext">
        {{ shown.length === 0 ? (intent ? 'What is it testing?' : 'Show a hint') : `Next: ${rungs[shown.length]?.label}` }}
        <span class="ms-1 hidden sm:inline-flex"><BaseKbd v-if="showShortcut" keys="H" size="sm" /></span>
      </BaseButton>
      <span v-else class="text-xs text-ink-soft">All hints shown — still stuck? Open the guided answer.</span>
    </div>

    <ol v-if="shown.length" ref="listEl" class="flex flex-col gap-2" aria-live="polite">
      <TransitionGroup name="reveal">
        <li
          v-for="(rung, index) in shown"
          :key="index"
          class="tint-panel flex gap-3"
          :class="rung.label === 'Goal' ? 'tint-primary' : 'tint-warning'"
        >
          <span class="mt-0.5 w-12 shrink-0 text-xs font-semibold text-ink-soft" aria-hidden="true">
            {{ rung.label }}
          </span>
          <span class="sr-only">{{ rung.label }} of {{ rungs.length }} steps:</span>
          <MarkdownContent :source="rung.text" class="min-w-0 text-sm" />
        </li>
      </TransitionGroup>
    </ol>
    <p v-else class="text-sm text-ink-soft">
      Stuck? Start with the goal, then take one hint at a time — each gets closer, the last is almost the solution.
    </p>
  </section>
</template>
