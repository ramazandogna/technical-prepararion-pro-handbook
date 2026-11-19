<script setup lang="ts">
/**
 * Honest self-assessment after seeing the answer: Again / Hard / Good / Easy (keys 1–4).
 * Calls progress.grade, which schedules the next review; the result is announced.
 */
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { CalendarClock } from 'lucide-vue-next'
import { BaseKbd } from 'rei-kit'
import type { ReviewGrade } from '@/types/progress'
import { useProgressStore } from '@/stores/progress'
import { GRADE_OPTIONS, describeNextReview, isTypingContext } from './learning'

const props = withDefaults(
  defineProps<{
    questionId: string
    /** Listen for 1–4 on the window. Turn off when several graders are on screen. */
    keyboard?: boolean
    /** Hint shown above the buttons, e.g. "You covered 3 of 5 key points". */
    hint?: string
  }>(),
  { keyboard: true, hint: undefined },
)

const emit = defineEmits<{ graded: [grade: ReviewGrade] }>()

const progress = useProgressStore()
const uid = useId()
const saving = ref(false)
const gradedNow = ref<ReviewGrade | null>(null)
const announcement = ref('')

watch(
  () => props.questionId,
  () => {
    gradedNow.value = null
    announcement.value = ''
  },
)

const record = computed(() => progress.get(props.questionId))
const nextLabel = computed(() => describeNextReview(record.value.nextReviewAt))

async function grade(value: ReviewGrade) {
  if (saving.value) return
  saving.value = true
  try {
    await progress.grade(props.questionId, value)
    gradedNow.value = value
    const label = GRADE_OPTIONS.find((g) => g.value === value)?.label ?? value
    const when = describeNextReview(progress.get(props.questionId).nextReviewAt)
    announcement.value = when ? `Graded ${label}. Next review ${when}.` : `Graded ${label}.`
    emit('graded', value)
  } finally {
    saving.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!props.keyboard || isTypingContext(event)) return
  const option = GRADE_OPTIONS.find((g) => g.key === event.key)
  if (!option) return
  event.preventDefault()
  void grade(option.value)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

defineExpose({ grade })
</script>

<template>
  <section class="flex flex-col gap-3" :aria-labelledby="`${uid}-h`">
    <div class="flex flex-col gap-0.5">
      <h2 :id="`${uid}-h`" class="text-sm font-semibold text-ink">How well did you recall it?</h2>
      <p class="text-xs text-ink-soft">{{ hint ?? 'Grade honestly — it decides when you see this again.' }}</p>
    </div>

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" :aria-labelledby="`${uid}-h`">
      <button
        v-for="option in GRADE_OPTIONS"
        :key="option.value"
        type="button"
        class="grade-btn"
        :class="`grade-${option.value}`"
        :aria-pressed="gradedNow === option.value"
        :disabled="saving"
        :aria-keyshortcuts="keyboard ? option.key : undefined"
        @click="grade(option.value)"
      >
        <span class="flex w-full items-center justify-between gap-2">
          <span class="text-sm font-semibold">{{ option.label }}</span>
          <span class="hidden sm:inline-flex"><BaseKbd v-if="keyboard" :keys="option.key" size="sm" /></span>
        </span>
        <span class="text-xs text-ink-soft">{{ option.description }}</span>
      </button>
    </div>

    <p class="flex min-h-5 items-center gap-1.5 text-sm text-ink-soft" aria-live="polite">
      <template v-if="gradedNow && nextLabel">
        <CalendarClock class="size-4 text-primary" aria-hidden="true" />
        <span>
          Saved. Next review <strong class="font-semibold text-ink">{{ nextLabel }}</strong>.
        </span>
      </template>
      <span v-else-if="gradedNow" class="sr-only">{{ announcement }}</span>
      <span v-else-if="record.lastGrade && nextLabel" class="text-xs">
        Last graded “{{ GRADE_OPTIONS.find((g) => g.value === record.lastGrade)?.label }}” · next review {{ nextLabel }}
      </span>
    </p>
  </section>
</template>
