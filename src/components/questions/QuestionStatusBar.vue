<script setup lang="ts">
/** Status, bookmark, mark mastered / reset for one question. */
import { computed } from 'vue'
import { Bookmark, BookmarkCheck, GraduationCap, RotateCcw } from 'lucide-vue-next'
import { BaseButton, BaseKbd, BasePopconfirm, useToast } from 'rei-kit'
import { useProgressStore } from '@/stores/progress'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { GRADE_OPTIONS, describeNextReview } from './learning'

const props = withDefaults(defineProps<{ questionId: string; showShortcut?: boolean }>(), { showShortcut: true })

const progress = useProgressStore()
const toast = useToast()

const record = computed(() => progress.get(props.questionId))
const status = computed(() => progress.statusOf(props.questionId))
const nextLabel = computed(() => describeNextReview(record.value.nextReviewAt))
const lastGradeLabel = computed(() => GRADE_OPTIONS.find((g) => g.value === record.value.lastGrade)?.label ?? null)

async function toggleBookmark() {
  await progress.toggleBookmark(props.questionId)
  toast.info(progress.get(props.questionId).bookmarked ? 'Bookmarked' : 'Bookmark removed', { duration: 2500 })
}

async function markMastered() {
  const previous = status.value
  await progress.setStatus(props.questionId, 'mastered')
  toast.success('Marked as mastered', {
    action: { label: 'Undo', onClick: () => void progress.setStatus(props.questionId, previous) },
  })
}

async function reset() {
  await progress.resetQuestion(props.questionId)
  toast.info('Progress reset for this question', { duration: 3000 })
}

defineExpose({ toggleBookmark })
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <StatusBadge :value="status" />
      <BaseButton
        variant="secondary"
        size="sm"
        :pressed="record.bookmarked"
        :aria-keyshortcuts="showShortcut ? 'b' : undefined"
        @click="toggleBookmark"
      >
        <BookmarkCheck v-if="record.bookmarked" class="size-4 text-primary" aria-hidden="true" />
        <Bookmark v-else class="size-4" aria-hidden="true" />
        {{ record.bookmarked ? 'Bookmarked' : 'Bookmark' }}
        <span class="ms-1 hidden lg:inline-flex"><BaseKbd v-if="showShortcut" keys="B" size="sm" /></span>
      </BaseButton>
    </div>

    <dl class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      <dt class="text-ink-soft">Attempts</dt>
      <dd class="text-end text-ink tabular-nums">{{ record.attempts }}</dd>
      <dt class="text-ink-soft">Last grade</dt>
      <dd class="text-end text-ink">{{ lastGradeLabel ?? '—' }}</dd>
      <dt class="text-ink-soft">Next review</dt>
      <dd class="text-end text-ink">{{ nextLabel ?? '—' }}</dd>
    </dl>

    <div class="flex flex-wrap gap-2">
      <BaseButton v-if="status !== 'mastered'" variant="ghost" size="sm" @click="markMastered">
        <GraduationCap class="size-4" aria-hidden="true" />
        Mark mastered
      </BaseButton>
      <BasePopconfirm
        v-if="status !== 'new' || record.bookmarked || record.answerRevealed"
        title="Reset progress?"
        message="Clears status, hints, grades and the review schedule for this question. Your note is kept."
        confirm-label="Reset"
        cancel-label="Cancel"
        tone="danger"
        @confirm="reset"
      >
        <template #trigger="{ props: triggerProps }">
          <BaseButton variant="ghost" size="sm" v-bind="triggerProps">
            <RotateCcw class="size-4" aria-hidden="true" />
            Reset
          </BaseButton>
        </template>
      </BasePopconfirm>
    </div>
  </div>
</template>
