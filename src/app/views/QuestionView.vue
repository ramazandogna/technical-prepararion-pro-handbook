<script setup lang="ts">
/**
 * The core learning surface: prompt → think first (optional timer) → hints → reveal → self-grade → notes.
 * Owned by the UX Engineer. See docs/UX.md.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Brain, Keyboard, NotebookPen, Pause, Play, RotateCcw, SearchX, Timer } from 'lucide-vue-next'
import { BaseButton, BaseCard, BaseKbd, EmptyState } from 'rei-kit'
import { BaseBreadcrumb } from 'rei-kit/web'
import { getEntry, neighbours } from '@/content'
import QuestionPrompt from '@/components/questions/QuestionPrompt.vue'
import HintLadder from '@/components/questions/HintLadder.vue'
import AnswerReveal from '@/components/questions/AnswerReveal.vue'
import MultipleChoice from '@/components/questions/MultipleChoice.vue'
import SelfGrade from '@/components/questions/SelfGrade.vue'
import NotesEditor from '@/components/questions/NotesEditor.vue'
import QuestionStatusBar from '@/components/questions/QuestionStatusBar.vue'
import { isActivationOnControl, isTypingContext } from '@/components/questions/learning'

const route = useRoute()
const router = useRouter()

const questionId = computed(() => String(route.params.questionId ?? ''))
const entry = computed(() => getEntry(questionId.value))
const question = computed(() => entry.value?.question)
const near = computed(() => neighbours(questionId.value))
const isMcq = computed(() => question.value?.type === 'multiple-choice' && !!question.value.choices?.length)

const crumbs = computed(() =>
  entry.value
    ? [
        { label: entry.value.track.title, to: `/tracks/${entry.value.track.id}` },
        { label: entry.value.module.title, to: `/tracks/${entry.value.track.id}#mod-${entry.value.module.id}` },
      ]
    : [],
)

const hintLadder = ref<InstanceType<typeof HintLadder> | null>(null)
const answer = ref<InstanceType<typeof AnswerReveal> | null>(null)
const statusBar = ref<InstanceType<typeof QuestionStatusBar> | null>(null)

const answerOpen = computed(() => answer.value?.isOpen ?? false)
const gradeHint = computed(() => {
  const total = question.value?.keyPoints.length ?? 0
  const covered = answer.value?.coveredCount ?? 0
  return total && covered ? `You ticked ${covered} of ${total} key points.` : undefined
})

/* ---------- Think-first timer (counts down from estMinutes) ---------- */
const timerTotal = computed(() => Math.max(1, question.value?.estMinutes ?? 5) * 60)
const remaining = ref(0)
const running = ref(false)
let handle: ReturnType<typeof setInterval> | undefined

function stopTimer() {
  running.value = false
  if (handle) clearInterval(handle)
  handle = undefined
}
function startTimer() {
  if (remaining.value <= 0) remaining.value = timerTotal.value
  running.value = true
  handle = setInterval(() => {
    remaining.value -= 1
    if (remaining.value <= 0) {
      remaining.value = 0
      stopTimer()
    }
  }, 1000)
}
function resetTimer() {
  stopTimer()
  remaining.value = 0
}
const timerStarted = computed(() => running.value || remaining.value > 0)
const timeUp = ref(false)
watch(remaining, (value, previous) => {
  if (previous > 0 && value === 0) timeUp.value = true
})
const clock = computed(() => {
  const s = timerStarted.value ? remaining.value : timerTotal.value
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

watch(questionId, () => {
  resetTimer()
  timeUp.value = false
})
watch(answerOpen, (open) => {
  if (open) stopTimer()
})

/* ---------- Keyboard shortcuts ---------- */
function go(target: string | undefined) {
  if (target) void router.push(`/q/${target}`)
}

function onKeydown(event: KeyboardEvent) {
  if (!question.value || isTypingContext(event) || isActivationOnControl(event)) return
  const key = event.key
  if (key === 'h' || key === 'H') {
    event.preventDefault()
    void hintLadder.value?.revealNext()
  } else if ((key === ' ' || key === 'Enter') && !answerOpen.value) {
    event.preventDefault()
    void answer.value?.reveal()
  } else if (key === 'n' || key === 'N') {
    event.preventDefault()
    go(near.value.next?.question.id)
  } else if (key === 'p' || key === 'P') {
    event.preventDefault()
    go(near.value.prev?.question.id)
  } else if (key === 'b' || key === 'B') {
    event.preventDefault()
    void statusBar.value?.toggleBookmark()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  stopTimer()
})

const shortcuts: { keys: string; label: string }[] = [
  { keys: 'H', label: 'Next hint' },
  { keys: 'Space', label: 'Reveal answer' },
  { keys: '1–4', label: 'Grade' },
  { keys: 'N', label: 'Next question' },
  { keys: 'P', label: 'Previous question' },
  { keys: 'B', label: 'Bookmark' },
]
</script>

<template>
  <div v-if="entry && question" class="flex flex-col gap-5">
    <BaseBreadcrumb :items="crumbs" label="Breadcrumb" />

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_20rem]">
      <!-- Main learning flow -->
      <div class="flex min-w-0 flex-col gap-5">
        <BaseCard padding="lg" class="max-sm:!p-4">
          <QuestionPrompt :key="question.id" :question="question" />
        </BaseCard>

        <!-- Attempt first -->
        <BaseCard v-if="isMcq && question.choices" padding="md" class="max-sm:!p-4">
          <MultipleChoice :question-id="question.id" :choices="question.choices" />
        </BaseCard>

        <div
          v-else-if="!answerOpen"
          class="tint-panel tint-primary flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-start gap-3">
            <Brain class="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div class="flex flex-col gap-0.5">
              <p class="text-sm font-semibold text-ink">Think first</p>
              <p class="text-sm text-ink-soft">
                Answer out loud as you would in the interview — about {{ question.estMinutes }} min. Then check.
              </p>
              <p v-if="timeUp" class="text-sm font-medium text-ink" aria-live="polite">
                Time's up — reveal the answer and compare.
              </p>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2 self-end whitespace-nowrap sm:self-auto">
            <span
              class="min-w-[3.25rem] text-end font-mono text-sm tabular-nums"
              :class="timerStarted ? 'text-ink' : 'text-ink-soft'"
              role="timer"
              :aria-label="`Time remaining ${clock}`"
            >
              {{ clock }}
            </span>
            <BaseButton v-if="!running" variant="secondary" size="sm" @click="startTimer">
              <Play v-if="!timerStarted" class="size-4" aria-hidden="true" />
              <Timer v-else class="size-4" aria-hidden="true" />
              {{ timerStarted ? 'Resume' : 'Start timer' }}
            </BaseButton>
            <BaseButton v-else variant="secondary" size="sm" @click="stopTimer">
              <Pause class="size-4" aria-hidden="true" />
              Pause
            </BaseButton>
            <BaseButton v-if="timerStarted" variant="ghost" size="sm" icon aria-label="Reset timer" @click="resetTimer">
              <RotateCcw class="size-4" aria-hidden="true" />
            </BaseButton>
          </div>
        </div>

        <BaseCard v-if="question.hints.length" padding="md" class="max-sm:!p-4">
          <HintLadder ref="hintLadder" :key="question.id" :question-id="question.id" :hints="question.hints" />
        </BaseCard>

        <BaseCard padding="lg" class="max-sm:!p-4">
          <AnswerReveal ref="answer" :key="question.id" :question="question" />
        </BaseCard>

        <BaseCard v-if="answerOpen" padding="md" class="max-sm:!p-4">
          <SelfGrade :key="question.id" :question-id="question.id" :hint="gradeHint" />
        </BaseCard>

        <nav class="flex flex-col gap-2 sm:flex-row sm:justify-between" aria-label="Question navigation">
          <BaseButton
            v-if="near.prev"
            as="router-link"
            :to="`/q/${near.prev.question.id}`"
            variant="ghost"
            class="justify-start sm:max-w-[48%]"
          >
            <ArrowLeft class="size-4 shrink-0" aria-hidden="true" />
            <span class="flex min-w-0 flex-col items-start text-start">
              <span class="text-xs text-ink-soft">Previous</span>
              <span class="truncate text-sm">{{ near.prev.question.title }}</span>
            </span>
          </BaseButton>
          <span v-else />
          <BaseButton
            v-if="near.next"
            as="router-link"
            :to="`/q/${near.next.question.id}`"
            variant="ghost"
            class="justify-end sm:max-w-[48%]"
          >
            <span class="flex min-w-0 flex-col items-end text-end">
              <span class="text-xs text-ink-soft">Next</span>
              <span class="truncate text-sm">{{ near.next.question.title }}</span>
            </span>
            <ArrowRight class="size-4 shrink-0" aria-hidden="true" />
          </BaseButton>
        </nav>
      </div>

      <!-- Side panel: status + notes (after the flow on mobile) -->
      <aside class="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6" aria-label="Question tools">
        <BaseCard padding="md">
          <QuestionStatusBar ref="statusBar" :question-id="question.id" />
        </BaseCard>

        <BaseCard padding="md">
          <div class="flex flex-col gap-3">
            <h2 class="flex items-center gap-2 text-sm font-semibold text-ink">
              <NotebookPen class="size-4 text-ink-soft" aria-hidden="true" />
              Notes
            </h2>
            <NotesEditor :question-id="question.id" />
          </div>
        </BaseCard>

        <BaseCard padding="md" class="hidden lg:block">
          <h2 class="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <Keyboard class="size-4 text-ink-soft" aria-hidden="true" />
            Shortcuts
          </h2>
          <dl class="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-xs">
            <template v-for="s in shortcuts" :key="s.keys">
              <dt><BaseKbd :keys="s.keys" size="sm" /></dt>
              <dd class="text-ink-soft">{{ s.label }}</dd>
            </template>
          </dl>
        </BaseCard>
      </aside>
    </div>
  </div>

  <EmptyState
    v-else
    title="Question not found"
    :description="`There is no question with the id “${questionId}”. It may have been renamed or removed.`"
  >
    <template #icon><SearchX class="size-8" aria-hidden="true" /></template>
    <template #action>
      <div class="flex flex-wrap justify-center gap-2">
        <BaseButton as="router-link" to="/library" variant="primary">Browse the library</BaseButton>
        <BaseButton as="router-link" to="/" variant="ghost">Dashboard</BaseButton>
      </div>
    </template>
  </EmptyState>
</template>
