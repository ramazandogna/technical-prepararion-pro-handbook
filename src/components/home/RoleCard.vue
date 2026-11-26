<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Lock, Play, RotateCw } from 'lucide-vue-next'
import { BaseBadge, BaseButton, ProgressBar } from 'rei-kit'
import type { RolePlan } from '@/types/session'
import { useSessionStore } from '@/stores/session'

const props = defineProps<{ plan: RolePlan; featured?: boolean }>()

const router = useRouter()
const session = useSessionStore()
const busy = ref(false)

const active = computed(() => session.activeFor(props.plan.role))
const done = computed(() => active.value?.done.length ?? 0)
const total = computed(() => active.value?.items.length ?? 0)
const inProgress = computed(() => !!active.value && done.value < total.value)
const soon = computed(() => props.plan.status === 'coming-soon')
const count = computed(() => props.plan.slots.reduce((n, s) => n + s.count, 0))

async function start(fresh = false) {
  if (soon.value || busy.value) return
  busy.value = true
  try {
    const first = await session.start(props.plan.role, fresh)
    if (first) await router.push({ path: `/q/${first}`, query: { session: '1' } })
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <article
    class="flex flex-col gap-4 rounded-card border p-5 sm:p-6"
    :class="[
      soon ? 'border-hair bg-surface/40 opacity-70' : 'border-hair bg-surface',
      featured && !soon ? 'ring-primary/40 ring-2' : '',
    ]"
  >
    <header class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 flex-col gap-1">
        <h2 class="text-lg font-semibold text-ink sm:text-xl">{{ plan.title }}</h2>
        <p class="text-sm text-ink-soft">{{ plan.tagline }}</p>
      </div>
      <BaseBadge v-if="soon" tone="neutral"><Lock class="size-3" aria-hidden="true" /> Coming soon</BaseBadge>
      <BaseBadge v-else-if="featured" tone="primary">Priority</BaseBadge>
    </header>

    <ul v-if="!soon" class="flex flex-wrap gap-1.5" aria-label="Today's mix">
      <li
        v-for="slot in plan.slots"
        :key="slot.id"
        class="rounded-full border border-hair px-2.5 py-0.5 text-xs text-ink-soft"
        :title="slot.why"
      >
        {{ slot.count }} × {{ slot.label }}
      </li>
    </ul>

    <div v-if="inProgress" class="flex flex-col gap-1.5">
      <ProgressBar :value="done" :max="total" :label="`${done} of ${total} done`" />
      <span class="text-xs text-ink-soft tabular-nums">{{ done }} / {{ total }} done in this session</span>
    </div>

    <footer v-if="!soon" class="mt-auto flex flex-wrap items-center gap-3">
      <BaseButton
        variant="primary"
        size="lg"
        class="min-w-40 flex-1 justify-center text-base sm:flex-none"
        :disabled="soon || busy"
        @click="start()"
      >
        <Play class="size-5" aria-hidden="true" />
        {{ soon ? 'Coming soon' : inProgress ? 'Continue' : 'Start' }}
      </BaseButton>
      <span v-if="!soon" class="flex items-center gap-1 text-xs text-ink-soft">
        <Clock class="size-3.5" aria-hidden="true" /> ~{{ plan.minutes }} min · {{ count }} questions
      </span>
      <BaseButton v-if="inProgress" variant="ghost" size="sm" class="ms-auto" @click="start(true)">
        <RotateCw class="size-4" aria-hidden="true" /> New set
      </BaseButton>
    </footer>
  </article>
</template>
