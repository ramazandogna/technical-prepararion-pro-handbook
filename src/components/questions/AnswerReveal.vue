<script setup lang="ts">
/**
 * The guided answer, hidden until the learner explicitly asks for it (active recall first).
 * Opened, it teaches the solution one step at a time: each step ends with a "learned" stamp that
 * unlocks the next; then the full model answer, the key points (also stamps) and a copy button.
 * Reveal is persisted via progress.revealAnswer. On the question page a previously revealed
 * answer stays open, with "Hide & retry" to attempt it again from memory; review sessions
 * (`fresh`) always start hidden.
 */
import { computed, nextTick, ref, useId, watch } from 'vue'
import { AlertTriangle, BookOpen, Eye, EyeOff, ExternalLink, ListChecks, MessageSquareQuote, Sparkles, Target, UserRound } from 'lucide-vue-next'
import { BaseButton, BaseKbd, CopyButton } from 'rei-kit'
import type { Question } from '@/types/content'
import { answerAsMarkdown, requiredStamps, walkthroughOf } from '@/content/walkthrough'
import StampToggle from './StampToggle.vue'
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

const stamps = computed(() => new Set(progress.get(props.question.id).stamps ?? []))
const steps = computed(() => walkthroughOf(props.question))
const authored = computed(() => !!props.question.walkthrough?.length)
const showAll = ref(false)
/** Steps are unlocked one by one: the next step appears once the previous one is stamped. */
const unlocked = computed(() => {
  if (showAll.value) return steps.value.length
  let n = 1
  while (n < steps.value.length && stamps.value.has(`step-${n - 1}`)) n++
  return n
})
const required = computed(() => requiredStamps(props.question))
const stampedCount = computed(() => required.value.filter((s) => stamps.value.has(s)).length)
const coveredCount = computed(() => props.question.keyPoints.filter((_, i) => stamps.value.has(`kp-${i}`)).length)
const allStamped = computed(() => stampedCount.value === required.value.length)
const markdown = computed(() => answerAsMarkdown(props.question))

function stamp(id: string) {
  void progress.toggleStamp(props.question.id, id)
}

watch(
  () => props.question.id,
  () => {
    showAll.value = false
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
  status.value = 'Answer hidden. Try it again from memory.'
  emit('hidden')
}

const showAngle = computed(() => !!props.question.personalAngle && settings.settings.showPersonalAngle)

defineExpose({ reveal, isOpen, coveredCount, allStamped })
</script>

<template>
  <section class="flex flex-col gap-4" :aria-labelledby="`${uid}-h`">
    <p class="sr-only" aria-live="polite">{{ status }}</p>

    <div v-if="!isOpen" class="tint-panel flex flex-col items-start gap-3 border-dashed sm:flex-row sm:items-center">
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 :id="`${uid}-h`" class="text-sm font-semibold text-ink">Guided answer</h2>
        <p class="text-sm text-ink-soft">
          {{
            seenBefore
              ? 'You have seen this before. Recall it first, then check.'
              : 'Try first. When you open it, it teaches the solution step by step — stamp each step you understand.'
          }}
        </p>
      </div>
      <BaseButton variant="primary" class="w-full sm:w-auto" @click="reveal">
        <Eye class="size-4" aria-hidden="true" />
        Show the answer
        <span class="ms-1 hidden sm:inline-flex"><BaseKbd v-if="showShortcut" keys="Space" size="sm" /></span>
      </BaseButton>
    </div>

    <Transition name="reveal">
      <div v-if="isOpen" class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2
            :id="`${uid}-h`"
            ref="answerHeading"
            tabindex="-1"
            class="focus-target flex items-center gap-2 text-base font-semibold text-ink"
          >
            <BookOpen class="size-4 text-primary" aria-hidden="true" />
            Guided answer
          </h2>
          <div class="flex items-center gap-1">
            <CopyButton :text="markdown" copy-label="Copy full answer" copied-label="Copied" with-text />
            <BaseButton v-if="!fresh" variant="ghost" size="sm" @click="hide">
              <EyeOff class="size-4" aria-hidden="true" />
              Hide &amp; retry
            </BaseButton>
          </div>
        </div>

        <div v-if="question.intent" class="tint-panel tint-primary flex gap-3">
          <Target class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <div class="flex min-w-0 flex-col gap-1">
            <h3 class="text-sm font-semibold text-ink">What this question is really testing</h3>
            <MarkdownContent :source="question.intent" class="text-sm" />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
              <ListChecks class="size-4 text-primary" aria-hidden="true" />
              Step by step
            </h3>
            <span class="text-xs text-ink-soft tabular-nums">Step {{ Math.min(unlocked, steps.length) }} of {{ steps.length }}</span>
          </div>
          <ol class="flex flex-col gap-3">
            <li
              v-for="(step, index) in steps.slice(0, unlocked)"
              :key="index"
              class="step-card flex flex-col gap-3"
              :class="{ 'is-learned': stamps.has(`step-${index}`) }"
            >
              <div class="flex items-center gap-2.5">
                <span class="step-num" aria-hidden="true">{{ index + 1 }}</span>
                <h4 class="text-sm font-semibold text-ink">{{ step.title }}</h4>
              </div>
              <MarkdownContent :source="step.body" :code-label="`Step ${index + 1} code`" />
              <StampToggle
                class="self-start"
                :checked="stamps.has(`step-${index}`)"
                :label="stamps.has(`step-${index}`) ? 'Learned' : 'I understand this step'"
                :hint="index + 1 < steps.length && !stamps.has(`step-${index}`) ? 'Stamp it to open the next step' : undefined"
                @toggle="stamp(`step-${index}`)"
              />
            </li>
          </ol>
          <BaseButton v-if="unlocked < steps.length" variant="ghost" size="sm" class="self-start" @click="showAll = true">
            Show all steps
          </BaseButton>
        </div>

        <details v-if="authored && unlocked >= steps.length" class="step-card" open>
          <summary class="cursor-pointer text-sm font-semibold text-ink">Full model answer</summary>
          <MarkdownContent :source="question.answer" code-label="Answer code" class="mt-3" />
        </details>

        <div v-if="question.keyPoints.length" class="flex flex-col gap-2">
          <div class="flex items-baseline justify-between gap-2">
            <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles class="size-4 text-primary" aria-hidden="true" />
              What the interviewer listens for
            </h3>
            <span class="text-xs text-ink-soft tabular-nums" aria-live="polite">
              {{ coveredCount }} / {{ question.keyPoints.length }}
            </span>
          </div>
          <p class="text-xs text-ink-soft">Stamp each point you could say out loud right now.</p>
          <ul class="flex flex-col gap-1">
            <li v-for="(point, index) in question.keyPoints" :key="index">
              <StampToggle size="sm" :checked="stamps.has(`kp-${index}`)" :label="point" @toggle="stamp(`kp-${index}`)" />
            </li>
          </ul>
        </div>

        <p class="text-sm" :class="allStamped ? 'text-positive font-medium' : 'text-ink-soft'" aria-live="polite">
          {{
            allStamped
              ? 'Everything stamped. Grade Good or Easy below to close this question.'
              : `${stampedCount} of ${required.length} stamps — stamp every step and key point, then grade Good or Easy to close it.`
          }}
        </p>

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
