<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, CheckCircle2, Circle, PartyPopper } from 'lucide-vue-next'
import { BaseButton, BaseCard, EmptyState, ProgressBar } from 'rei-kit'
import { getEntry } from '@/content'
import { REVIEW_SLOT_ID } from '@/services/session'
import { useSessionStore } from '@/stores/session'
import PageTitle from '@/components/common/PageTitle.vue'
import DifficultyBadge from '@/components/common/DifficultyBadge.vue'
import TypeBadge from '@/components/common/TypeBadge.vue'

const router = useRouter()
const session = useSessionStore()
const s = computed(() => session.session)
const plan = computed(() => (s.value ? session.planOf(s.value.role) : undefined))

const rows = computed(() =>
  (s.value?.items ?? []).map((item) => ({
    item,
    entry: getEntry(item.questionId),
    done: s.value!.done.includes(item.questionId),
    slot:
      item.slotId === REVIEW_SLOT_ID ? 'Spaced review' : (plan.value?.slots.find((x) => x.id === item.slotId)?.label ?? ''),
  })),
)

function open(id: string) {
  void router.push({ path: `/q/${id}`, query: { session: '1' } })
}
async function again() {
  if (!s.value) return
  const first = await session.start(s.value.role, true)
  if (first) open(first)
}
</script>

<template>
  <div v-if="s && plan" class="flex flex-col gap-6">
    <PageTitle :eyebrow="`Session · ${s.date}`" :title="plan.title" :description="plan.tagline" />

    <BaseCard padding="md">
      <div class="flex flex-col gap-3">
        <ProgressBar :value="s.done.length" :max="s.items.length" :label="`${s.done.length} of ${s.items.length} done`" />
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-sm text-ink-soft tabular-nums">{{ s.done.length }} / {{ s.items.length }} done</span>
          <BaseButton v-if="session.current" variant="primary" @click="open(session.current.questionId)">
            Continue
            <ArrowRight class="size-4" aria-hidden="true" />
          </BaseButton>
          <BaseButton v-else variant="primary" @click="again">
            <PartyPopper class="size-4" aria-hidden="true" />
            Session complete — start the next set
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <ol class="flex flex-col gap-2">
      <li v-for="(row, i) in rows" :key="row.item.questionId">
        <button
          type="button"
          class="focus-ring flex w-full items-center gap-3 rounded-card border border-hair bg-surface px-4 py-3 text-start"
          :class="row.done ? 'opacity-70' : ''"
          @click="open(row.item.questionId)"
        >
          <CheckCircle2 v-if="row.done" class="size-5 shrink-0 text-positive" aria-label="Done" />
          <Circle v-else class="size-5 shrink-0 text-ink-soft" aria-label="To do" />
          <span class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="text-xs text-ink-soft">{{ i + 1 }}. {{ row.slot }}</span>
            <span class="truncate text-sm font-medium text-ink">{{ row.entry?.question.title }}</span>
          </span>
          <span v-if="row.entry" class="hidden shrink-0 gap-1 sm:flex">
            <TypeBadge :value="row.entry.question.type" />
            <DifficultyBadge :value="row.entry.question.difficulty" />
          </span>
        </button>
      </li>
    </ol>

    <BaseCard padding="md">
      <h2 class="mb-2 text-sm font-semibold text-ink">Why this mix — the panel's notes</h2>
      <ul class="flex list-disc flex-col gap-1 ps-5 text-sm text-ink-soft">
        <li v-for="note in plan.panelNotes" :key="note">{{ note }}</li>
      </ul>
    </BaseCard>
  </div>
  <EmptyState v-else title="No session yet" description="Pick a role on the home screen and press Start.">
    <template #action><BaseButton as="router-link" to="/" variant="primary">Go to home</BaseButton></template>
  </EmptyState>
</template>
