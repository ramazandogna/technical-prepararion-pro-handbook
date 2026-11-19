<script setup lang="ts">
/**
 * Focused practice session, one card at a time: prompt → (hints) → reveal → grade → next.
 *   /review                 due queue (progress.dueIds)
 *   /review?mode=new        next N 'new' questions (N = settings.dailyGoal)
 *   /review?mode=bookmarks  bookmarked questions
 *   /review?track=<id>      that track's not-mastered questions
 * The queue is snapshotted at session start so grading does not reshuffle it.
 * Owned by the UX Engineer. See docs/UX.md.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Bookmark, CalendarCheck, PartyPopper, Repeat, SkipForward, Sparkles, X } from 'lucide-vue-next'
import { BaseBadge, BaseButton, BaseCard, BaseKbd, EmptyState, ProgressBar } from 'rei-kit'
import type { ReviewGrade } from '@/types/progress'
import { allQuestionIds, getEntry, getTrack, trackQuestionIds } from '@/content'
import { useProgressStore } from '@/stores/progress'
import { useSettingsStore } from '@/stores/settings'
import QuestionPrompt from '@/components/questions/QuestionPrompt.vue'
import HintLadder from '@/components/questions/HintLadder.vue'
import AnswerReveal from '@/components/questions/AnswerReveal.vue'
import MultipleChoice from '@/components/questions/MultipleChoice.vue'
import SelfGrade from '@/components/questions/SelfGrade.vue'
import QuestionListItem from '@/components/questions/QuestionListItem.vue'
import { GRADE_OPTIONS, isActivationOnControl, isTypingContext } from '@/components/questions/learning'

type Mode = 'due' | 'new' | 'bookmarks' | 'track'
type Outcome = ReviewGrade | 'skipped'

const route = useRoute()
const router = useRouter()
const progress = useProgressStore()
const settings = useSettingsStore()

const trackId = computed(() => (typeof route.query.track === 'string' ? route.query.track : null))
const mode = computed<Mode>(() => {
  if (trackId.value) return 'track'
  const m = route.query.mode
  return m === 'bookmarks' || m === 'new' ? m : 'due'
})
const track = computed(() => (trackId.value ? getTrack(trackId.value) : undefined))

const title = computed(() => {
  switch (mode.value) {
    case 'new':
      return 'Learn new'
    case 'bookmarks':
      return 'Bookmarks practice'
    case 'track':
      return track.value ? `${track.value.title} practice` : 'Track practice'
    default:
      return 'Due review'
  }
})

/* ---------- Session state ---------- */
const queue = ref<string[]>([])
const index = ref(0)
const outcomes = ref<Record<string, Outcome>>({})
const started = ref(false)

const ready = computed(() => progress.ready && settings.ready)
const newIds = computed(() =>
  allQuestionIds.filter((id) => progress.statusOf(id) === 'new').slice(0, Math.max(1, settings.settings.dailyGoal)),
)

function buildQueue(): string[] {
  switch (mode.value) {
    case 'new':
      return [...newIds.value]
    case 'bookmarks':
      return [...progress.bookmarkedIds]
    case 'track':
      return trackId.value ? trackQuestionIds(trackId.value).filter((id) => progress.statusOf(id) !== 'mastered') : []
    default:
      return [...progress.dueIds]
  }
}

function startSession() {
  queue.value = buildQueue().filter((id) => getEntry(id))
  index.value = 0
  outcomes.value = {}
  started.value = true
  void focusCard()
}

watch(
  [ready, () => route.fullPath],
  ([isReady]) => {
    if (isReady) startSession()
  },
  { immediate: true },
)

const currentId = computed(() => queue.value[index.value])
const current = computed(() => (currentId.value ? getEntry(currentId.value) : undefined))
const finished = computed(() => started.value && queue.value.length > 0 && index.value >= queue.value.length)
const done = computed(() => Object.keys(outcomes.value).length)
const currentOutcome = computed(() => (currentId.value ? outcomes.value[currentId.value] : undefined))

/* ---------- Card wiring ---------- */
const prompt = ref<InstanceType<typeof QuestionPrompt> | null>(null)
const hintLadder = ref<InstanceType<typeof HintLadder> | null>(null)
const answer = ref<InstanceType<typeof AnswerReveal> | null>(null)
const nextButton = ref<HTMLElement | null>(null)
const answerOpen = computed(() => answer.value?.isOpen ?? false)
const isMcq = computed(() => current.value?.question.type === 'multiple-choice' && !!current.value.question.choices?.length)
const gradeHint = computed(() => {
  const total = current.value?.question.keyPoints.length ?? 0
  const covered = answer.value?.coveredCount ?? 0
  return total && covered ? `You ticked ${covered} of ${total} key points.` : undefined
})

async function focusCard() {
  await nextTick()
  prompt.value?.focusHeading()
}

async function onGraded(grade: ReviewGrade) {
  if (!currentId.value) return
  outcomes.value = { ...outcomes.value, [currentId.value]: grade }
  await nextTick()
  const el = nextButton.value as unknown as { $el?: HTMLElement } | HTMLElement | null
  const node = el instanceof HTMLElement ? el : el?.$el
  node?.focus()
}

function advance() {
  if (index.value < queue.value.length) index.value += 1
  if (!finished.value) void focusCard()
  else window.scrollTo({ top: 0 })
}

function skip() {
  if (!currentId.value) return
  outcomes.value = { ...outcomes.value, [currentId.value]: 'skipped' }
  advance()
}

function exit() {
  void router.push('/')
}

function onKeydown(event: KeyboardEvent) {
  if (!current.value || finished.value || isTypingContext(event) || isActivationOnControl(event)) return
  const key = event.key
  if ((key === ' ' || key === 'Enter') && !answerOpen.value) {
    event.preventDefault()
    void answer.value?.reveal()
  } else if ((key === 'Enter' || key === 'n' || key === 'N') && currentOutcome.value) {
    event.preventDefault()
    advance()
  } else if (key === 'h' || key === 'H') {
    event.preventDefault()
    void hintLadder.value?.revealNext()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

/* ---------- Summary ---------- */
const summary = computed(() => {
  const counts: Record<Outcome, number> = { again: 0, hard: 0, good: 0, easy: 0, skipped: 0 }
  for (const o of Object.values(outcomes.value)) counts[o] += 1
  return counts
})
const gradeTone: Record<ReviewGrade, 'danger' | 'warning' | 'primary' | 'success'> = {
  again: 'danger',
  hard: 'warning',
  good: 'primary',
  easy: 'success',
}
const toRevisit = computed(() => queue.value.filter((id) => outcomes.value[id] === 'again' || outcomes.value[id] === 'hard'))
const moreNewAvailable = computed(() => newIds.value.length > 0)

/* ---------- Empty-state copy ---------- */
const empty = computed(() => {
  switch (mode.value) {
    case 'bookmarks':
      return { title: 'No bookmarks yet', description: 'Bookmark questions you want to drill (press B on a question page), then practice them here.' }
    case 'track':
      return track.value
        ? { title: 'Track mastered', description: `Every question in ${track.value.title} is marked mastered. Nice work.` }
        : { title: 'Track not found', description: `There is no track with the id “${trackId.value}”.` }
    case 'new':
      return { title: 'No new questions left', description: 'You have started every question in the curriculum. Keep up with your due reviews.' }
    default:
      return { title: 'Nothing due right now', description: 'Your reviews are up to date. Learn something new or practice your bookmarks.' }
  }
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-5">
    <!-- Session header -->
    <header class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-medium tracking-wide text-ink-soft uppercase">Practice session</p>
          <h1 class="truncate text-xl font-semibold tracking-tight text-ink sm:text-2xl">{{ title }}</h1>
        </div>
        <BaseButton v-if="queue.length && !finished" variant="ghost" size="sm" @click="exit">
          <X class="size-4" aria-hidden="true" />
          Exit
        </BaseButton>
      </div>
      <div v-if="queue.length && !finished" class="flex items-center gap-3">
        <ProgressBar :value="done" :max="queue.length" size="sm" :label="`Session progress: ${done} of ${queue.length}`" class="flex-1" />
        <span class="shrink-0 text-xs text-ink-soft tabular-nums" aria-hidden="true">
          {{ Math.min(index + 1, queue.length) }} / {{ queue.length }}
        </span>
      </div>
    </header>

    <!-- Loading -->
    <p v-if="!ready" class="text-sm text-ink-soft" aria-live="polite">Loading your progress…</p>

    <!-- Empty -->
    <BaseCard v-else-if="!queue.length" padding="lg">
      <EmptyState :title="empty.title" :description="empty.description">
        <template #icon><CalendarCheck class="size-8 text-primary" aria-hidden="true" /></template>
        <template #action>
          <div class="flex flex-wrap justify-center gap-2">
            <BaseButton v-if="mode !== 'new' && moreNewAvailable" variant="primary" :to="{ path: '/review', query: { mode: 'new' } }" as="router-link">
              <Sparkles class="size-4" aria-hidden="true" />
              Learn {{ newIds.length }} new
            </BaseButton>
            <BaseButton
              v-if="mode !== 'bookmarks' && progress.bookmarkedIds.length"
              variant="secondary"
              as="router-link"
              :to="{ path: '/review', query: { mode: 'bookmarks' } }"
            >
              <Bookmark class="size-4" aria-hidden="true" />
              Practice bookmarks ({{ progress.bookmarkedIds.length }})
            </BaseButton>
            <BaseButton variant="ghost" as="router-link" to="/roadmap">Open roadmap</BaseButton>
          </div>
        </template>
      </EmptyState>
    </BaseCard>

    <!-- Summary -->
    <BaseCard v-else-if="finished" padding="lg" class="max-sm:!p-4">
      <div class="flex flex-col gap-5">
        <div class="flex items-start gap-3">
          <PartyPopper class="mt-1 size-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 class="text-lg font-semibold text-ink" tabindex="-1">Session complete</h2>
            <p class="text-sm text-ink-soft">
              You worked through {{ queue.length - summary.skipped }} of {{ queue.length }} questions.
              Each one is scheduled based on your grade.
            </p>
          </div>
        </div>

        <ul class="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Results by grade">
          <li
            v-for="option in GRADE_OPTIONS"
            :key="option.value"
            class="grade-btn !cursor-default"
            :class="`grade-${option.value}`"
          >
            <span class="text-2xl font-semibold text-ink tabular-nums">{{ summary[option.value] }}</span>
            <span class="text-xs text-ink-soft">{{ option.label }}</span>
          </li>
          <li class="grade-btn !cursor-default col-span-2 sm:col-span-1">
            <span class="text-2xl font-semibold text-ink tabular-nums">{{ summary.skipped }}</span>
            <span class="text-xs text-ink-soft">Skipped</span>
          </li>
        </ul>

        <div v-if="toRevisit.length" class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold text-ink">Worth another look</h3>
          <ul class="-mx-3 flex flex-col">
            <li v-for="id in toRevisit" :key="id" class="flex items-center gap-2">
              <QuestionListItem :question-id="id" show-track :show-status="false" class="min-w-0 flex-1" />
              <BaseBadge :tone="gradeTone[outcomes[id] as ReviewGrade]" class="me-3 shrink-0">
                {{ GRADE_OPTIONS.find((g) => g.value === outcomes[id])?.label }}
              </BaseBadge>
            </li>
          </ul>
        </div>

        <div class="flex flex-wrap gap-2">
          <BaseButton v-if="mode !== 'new' && moreNewAvailable" variant="primary" as="router-link" :to="{ path: '/review', query: { mode: 'new' } }">
            <Sparkles class="size-4" aria-hidden="true" />
            Learn {{ newIds.length }} new
          </BaseButton>
          <BaseButton variant="secondary" @click="startSession">
            <Repeat class="size-4" aria-hidden="true" />
            {{ mode === 'due' ? 'Check for more due' : 'Practice again' }}
          </BaseButton>
          <BaseButton variant="ghost" as="router-link" to="/">Back to dashboard</BaseButton>
        </div>
      </div>
    </BaseCard>

    <!-- Card -->
    <template v-else-if="current">
      <div :key="current.question.id" class="flex flex-col gap-4">
        <BaseCard padding="lg" class="max-sm:!p-4">
          <p class="mb-3 text-xs text-ink-soft">{{ current.track.code }} · {{ current.track.title }} › {{ current.module.title }}</p>
          <QuestionPrompt ref="prompt" :question="current.question" :heading-level="2" :show-tags="false" />
        </BaseCard>

        <BaseCard v-if="isMcq && current.question.choices" padding="md" class="max-sm:!p-4">
          <MultipleChoice :question-id="current.question.id" :choices="current.question.choices" />
        </BaseCard>

        <BaseCard v-if="current.question.hints.length && !answerOpen" padding="md" class="max-sm:!p-4">
          <HintLadder ref="hintLadder" :question-id="current.question.id" :hints="current.question.hints" fresh />
        </BaseCard>

        <BaseCard padding="lg" class="max-sm:!p-4">
          <AnswerReveal ref="answer" :question="current.question" fresh />
        </BaseCard>

        <BaseCard v-if="answerOpen" padding="md" class="max-sm:!p-4">
          <SelfGrade :question-id="current.question.id" :hint="gradeHint" :keyboard="!currentOutcome" @graded="onGraded" />
        </BaseCard>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <BaseButton v-if="!currentOutcome" variant="ghost" size="sm" @click="skip">
            <SkipForward class="size-4" aria-hidden="true" />
            Skip
          </BaseButton>
          <span v-else />
          <BaseButton v-if="currentOutcome" ref="nextButton" variant="primary" @click="advance">
            {{ index + 1 < queue.length ? 'Next question' : 'See summary' }}
            <ArrowRight class="size-4" aria-hidden="true" />
            <span class="ms-1 hidden sm:inline-flex"><BaseKbd keys="N" size="sm" /></span>
          </BaseButton>
          <p v-else-if="!answerOpen" class="text-xs text-ink-soft">
            <span class="hidden sm:inline">Press <BaseKbd keys="Space" size="sm" /> to reveal when ready.</span>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
