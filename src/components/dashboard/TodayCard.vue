<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BaseButton, BaseCard, CircularProgress } from 'rei-kit'
import { ArrowRight, Bookmark, CalendarCheck, Flame, RotateCcw, Sparkles } from 'lucide-vue-next'
import { useProgressStore } from '@/stores/progress'
import { useSettingsStore } from '@/stores/settings'
import { useContinueLearning } from '@/composables/useContinueLearning'

const progress = useProgressStore()
const settingsStore = useSettingsStore()
const { next, hasStarted } = useContinueLearning()

const goal = computed(() => Math.max(1, settingsStore.settings.dailyGoal))
const done = computed(() => progress.todayCount)
const goalMet = computed(() => done.value >= goal.value)
const due = computed(() => progress.dueIds.length)
const streak = computed(() => progress.streak)
</script>

<template>
  <BaseCard as="section" padding="lg" aria-labelledby="today-title">
    <h2 id="today-title" class="sr-only">Today</h2>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-center">
      <div class="flex items-center gap-4">
        <CircularProgress
          :value="Math.min(done, goal)"
          :max="goal"
          size="lg"
          :tone="goalMet ? 'positive' : 'primary'"
          :label="`Daily goal: ${done} of ${goal} reviewed`"
        >
          <span class="text-ink text-lg font-semibold tabular-nums">{{ done }}/{{ goal }}</span>
        </CircularProgress>
        <div>
          <p class="text-ink font-semibold">{{ goalMet ? 'Daily goal reached' : 'Daily goal' }}</p>
          <p class="text-ink-soft text-sm">
            {{ goalMet ? 'Anything more is a bonus.' : `${goal - done} more to go today.` }}
          </p>
          <p class="text-ink-soft mt-2 flex items-center gap-1.5 text-sm">
            <Flame class="size-4" :class="streak > 0 ? 'text-warning' : ''" aria-hidden="true" />
            <span class="tabular-nums">{{ streak }}</span> day streak
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="bg-muted/50 flex flex-col gap-3 rounded-card p-4">
          <p class="text-ink-soft flex items-center gap-2 text-sm">
            <RotateCcw class="size-4" aria-hidden="true" /> Due for review
          </p>
          <p class="text-ink text-2xl font-semibold tabular-nums">{{ due }}</p>
          <BaseButton v-if="due > 0" as="router-link" to="/review" size="sm">Start review</BaseButton>
          <p v-else class="text-ink-soft flex items-center gap-1.5 text-sm">
            <CalendarCheck class="size-4" aria-hidden="true" /> Nothing due. Nice.
          </p>
        </div>
        <div class="bg-muted/50 flex flex-col gap-3 rounded-card p-4">
          <p class="text-ink-soft text-sm">{{ hasStarted ? 'Continue learning' : 'Start learning' }}</p>
          <template v-if="next">
            <p class="text-ink line-clamp-2 font-medium leading-snug">{{ next.question.title }}</p>
            <p class="text-ink-soft -mt-2 truncate text-xs">{{ next.track.code }} · {{ next.track.title }}</p>
            <BaseButton as="router-link" :to="`/q/${next.question.id}`" size="sm" variant="secondary">
              {{ hasStarted ? 'Continue' : 'Begin' }} <ArrowRight class="size-4" aria-hidden="true" />
            </BaseButton>
          </template>
          <p v-else class="text-ink-soft text-sm">
            Questions are on their way. Explore the <RouterLink to="/roadmap" class="text-primary underline">roadmap</RouterLink> meanwhile.
          </p>
        </div>
      </div>
    </div>
    <div class="border-hair/70 mt-5 flex flex-wrap gap-2 border-t pt-4">
      <BaseButton as="router-link" :to="{ path: '/review', query: { mode: 'new' } }" size="sm" variant="secondary">
        <Sparkles class="size-4" aria-hidden="true" /> Learn new
      </BaseButton>
      <BaseButton
        v-if="progress.bookmarkedIds.length > 0"
        as="router-link"
        :to="{ path: '/review', query: { mode: 'bookmarks' } }"
        size="sm"
        variant="secondary"
      >
        <Bookmark class="size-4" aria-hidden="true" /> Practice bookmarks
      </BaseButton>
      <BaseButton as="router-link" to="/review" size="sm" variant="ghost">
        <RotateCcw class="size-4" aria-hidden="true" /> Review session
      </BaseButton>
    </div>
  </BaseCard>
</template>
