<script setup lang="ts">
/**
 * The model answer, hidden until the learner explicitly asks for it (active recall first).
 * Reveal is persisted via progress.revealAnswer. On the question page a previously revealed
 * answer stays open, with "Hide & retry" to attempt it again from memory; review sessions
 * (`fresh`) always start hidden.
 */
import { computed, nextTick, ref, useId, watch } from 'vue'
import { AlertTriangle, BookOpen, Eye, EyeOff, ExternalLink, MessageSquareQuote, Sparkles, UserRound } from 'lucide-vue-next'
import { BaseButton, BaseCheckbox, BaseKbd } from 'rei-kit'
import type { Question } from '@/types/content'
import { useProgressStore } from '@/stores/progress'
import { useSettingsStore } from '@/stores/settings'
import MarkdownContent from '@/components/content/MarkdownContent.vue'


const props = withDefaults(
  defineProps<{
    question: Question
    fresh?: boolean
    showShortcut?: boolean
  }>(),
  { fresh: false, showShortcut: true },
)

const emit = defineEmits<{ revealed: []; hidden: [] }>()

const progress = useProgressStore()
const settings = useSettingsStore()
const uid = useId()

/** null = follow persisted state; true/false = the learner chose in this visit. */
const localOpen = ref<boolean | null>(props.fresh ? false : null)
const persistedOpen = computed(
  () => progress.get(props.question.id).answerRevealed || settings.settings.hideAnswersByDefault === false,
)
const isOpen = computed(() => localOpen.value ?? persistedOpen.value)
const seenBefore = computed(() => progress.get(props.question.id).answerRevealed)

const covered = ref<Record<number, boolean>>({})
const coveredCount = computed(() => Object.values(covered.value).filter(Boolean).length)
watch(
  () => props.question.id,
  () => {
    covered.value = {}
    localOpen.value = props.fresh ? false : null
  },
)

const answerHeading = ref<HTMLElement | null>(null)
const status = ref('')

async function reveal(): Promise<boolean> {
  if (isOpen.value) return false
  localOpen.value = true
  status.value = 'Answer revealed. Compare it with what you said.'
  emit('revealed')
  await nextTick()
  answerHeading.value?.focus({ preventScroll: true })
  answerHeading.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  await progress.revealAnswer(props.question.id)
  return true
}

function hide() {
  localOpen.value = false
  covered.value = {}
  status.value = 'Answer hidden. Try it again from memory.'
  emit('hidden')
}

const showAngle = computed(() => !!props.question.personalAngle && settings.settings.showPersonalAngle)

defineExpose({ reveal, isOpen, coveredCount })
</script>

<template>
  <section class="flex flex-col gap-4" :aria-labelledby="`${uid}-h`">
    <p class="sr-only" aria-live="polite">{{ status }}</p>

    <div v-if="!isOpen" class="tint-panel flex flex-col items-start gap-3 border-dashed sm:flex-row sm:items-center">
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 :id="`${uid}-h`" class="text-sm font-semibold text-ink">Model answer</h2>
        <p class="text-sm text-ink-soft">
          {{
            seenBefore
              ? 'You have seen this answer before. Recall it first, then check.'
              : 'Hidden until you have made an attempt — say it out loud or jot it down.'
          }}
        </p>
      </div>
      <BaseButton variant="primary" class="w-full sm:w-auto" @click="reveal">
        <Eye class="size-4" aria-hidden="true" />
        Reveal answer
        <span class="ms-1 hidden sm:inline-flex"><BaseKbd v-if="showShortcut" keys="Space" size="sm" /></span>
      </BaseButton>
    </div>

    <Transition name="reveal">
      <div v-if="isOpen" class="flex flex-col gap-5">
        <div class="flex items-center justify-between gap-2">
          <h2
            :id="`${uid}-h`"
            ref="answerHeading"
            tabindex="-1"
            class="focus-target flex items-center gap-2 text-base font-semibold text-ink"
          >
            <BookOpen class="size-4 text-primary" aria-hidden="true" />
            Model answer
          </h2>
          <BaseButton v-if="!fresh" variant="ghost" size="sm" @click="hide">
            <EyeOff class="size-4" aria-hidden="true" />
            Hide &amp; retry
          </BaseButton>
        </div>

        <MarkdownContent :source="question.answer" code-label="Answer code" />

        <div v-if="question.keyPoints.length" class="flex flex-col gap-2">
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles class="size-4 text-primary" aria-hidden="true" />
              What the interviewer listens for
            </h3>
            <span class="text-xs text-ink-soft tabular-nums" aria-live="polite">
              {{ coveredCount }} / {{ question.keyPoints.length }} covered
            </span>
          </div>
          <p class="text-xs text-ink-soft">Tick the points your answer covered — it makes self-grading honest.</p>
          <ul class="flex flex-col gap-1.5">
            <li v-for="(point, index) in question.keyPoints" :key="index">
              <BaseCheckbox
                :model-value="covered[index] ?? false"
                :label="point"
                size="sm"
                @update:model-value="(value: boolean) => (covered = { ...covered, [index]: value })"
              />
            </li>
          </ul>
        </div>

        <div v-if="question.pitfalls?.length" class="tint-panel tint-warning flex flex-col gap-2">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <AlertTriangle class="size-4 text-warning" aria-hidden="true" />
            Common pitfalls
          </h3>
          <ul class="flex list-disc flex-col gap-1 ps-5 text-sm text-ink">
            <li v-for="(pitfall, index) in question.pitfalls" :key="index">
              <MarkdownContent :source="pitfall" inline />
            </li>
          </ul>
        </div>

        <div v-if="question.followUps?.length" class="flex flex-col gap-2">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <MessageSquareQuote class="size-4 text-ink-soft" aria-hidden="true" />
            Likely follow-ups
          </h3>
          <ul class="flex flex-col gap-1.5 text-sm text-ink">
            <li
              v-for="(followUp, index) in question.followUps"
              :key="index"
              class="border-s-2 border-hair ps-3 text-ink-soft"
            >
              <MarkdownContent :source="followUp" inline />
            </li>
          </ul>
        </div>

        <div v-if="showAngle" class="tint-panel tint-primary flex flex-col gap-1.5">
          <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
            <UserRound class="size-4 text-primary" aria-hidden="true" />
            Your angle
          </h3>
          <MarkdownContent :source="question.personalAngle ?? ''" class="text-sm" />
        </div>

        <div v-if="question.references?.length" class="flex flex-col gap-1.5">
          <h3 class="text-sm font-semibold text-ink">References</h3>
          <ul class="flex flex-col gap-1 text-sm">
            <li v-for="reference in question.references" :key="reference.url">
              <a
                :href="reference.url"
                target="_blank"
                rel="noopener noreferrer"
                class="focus-ring inline-flex items-center gap-1 rounded text-primary underline underline-offset-2"
              >
                {{ reference.label }}
                <ExternalLink class="size-3.5" aria-hidden="true" />
                <span class="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </section>
</template>
