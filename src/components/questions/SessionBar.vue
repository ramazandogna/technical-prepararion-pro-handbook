<script setup lang="ts">
/**
 * Shown on a question that belongs to the running study session: where you are in today's plan,
 * and the way forward — "Next question" once the question is closed, or "Skip for now".
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Flag, SkipForward } from 'lucide-vue-next'
import { BaseButton, ProgressBar } from 'rei-kit'
import { getEntry } from '@/content'
import { requiredStamps } from '@/content/walkthrough'
import { isClosed } from '@/services/progress'
import { REVIEW_SLOT_ID } from '@/services/session'
import { useProgressStore } from '@/stores/progress'
import { useSessionStore } from '@/stores/session'

const props = defineProps<{ questionId: string; placement: 'top' | 'bottom' }>()

const router = useRouter()
const session = useSessionStore()
const progress = useProgressStore()

const s = computed(() => session.session)
const index = computed(() => s.value?.items.findIndex((i) => i.questionId === props.questionId) ?? -1)
const slotLabel = computed(() => {
  const item = s.value?.items[index.value]
  if (!item || !s.value) return ''
  if (item.slotId === REVIEW_SLOT_ID) return 'Spaced review'
  return session.planOf(s.value.role)?.slots.find((sl) => sl.id === item.slotId)?.label ?? ''
})
const doneCount = computed(() => s.value?.done.length ?? 0)
const total = computed(() => s.value?.items.length ?? 0)
const isDone = computed(() => !!s.value?.done.includes(props.questionId))
const closed = computed(() => {
  const q = getEntry(props.questionId)?.question
  return !!q && isClosed(progress.get(props.questionId), requiredStamps(q))
})

async function advance() {
  const next = await session.complete(props.questionId)
  if (next) void router.push({ path: `/q/${next}`, query: { session: '1' } })
  else void router.push('/session')
}
function nextUndone() {
  const next = session.current?.questionId
  if (next) void router.push({ path: `/q/${next}`, query: { session: '1' } })
  else void router.push('/session')
}
</script>

<template>
  <div
    v-if="index >= 0"
    class="tint-panel flex flex-col gap-3"
    :class="placement === 'bottom' && closed ? 'tint-positive' : 'tint-primary'"
  >
    <div v-if="placement === 'top'" class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
        <RouterLink to="/session" class="focus-ring flex items-center gap-2 rounded font-semibold text-ink">
          <Flag class="size-4 text-primary" aria-hidden="true" />
          Today's session · {{ index + 1 }} / {{ total }}
        </RouterLink>
        <span class="text-ink-soft">{{ slotLabel }}</span>
      </div>
      <ProgressBar :value="doneCount" :max="total" size="sm" :label="`${doneCount} of ${total} done`" />
    </div>

    <div v-else class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm" :class="closed ? 'font-semibold text-ink' : 'text-ink-soft'">
        <template v-if="isDone">Done in this session.</template>
        <template v-else-if="closed">Question closed — nice. On to the next one.</template>
        <template v-else>To close it: try → hints if needed → stamp every step and key point → grade Good/Easy.</template>
      </p>
      <div class="flex shrink-0 gap-2">
        <BaseButton v-if="!closed && !isDone" variant="ghost" size="sm" @click="advance">
          <SkipForward class="size-4" aria-hidden="true" />
          Skip for now
        </BaseButton>
        <BaseButton v-if="isDone" variant="primary" @click="nextUndone">
          Continue session
          <ArrowRight class="size-4" aria-hidden="true" />
        </BaseButton>
        <BaseButton v-else-if="closed" variant="primary" @click="advance">
          Next question
          <ArrowRight class="size-4" aria-hidden="true" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>
