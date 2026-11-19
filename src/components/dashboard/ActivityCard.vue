<script setup lang="ts">
import { computed } from 'vue'
import { ActivityGrid, BaseCard, formatDate, fromDateKey, lastNDays } from 'rei-kit'
import { useProgressStore } from '@/stores/progress'

const WEEKS = 16
const progress = useProgressStore()

const days = computed(() => lastNDays(WEEKS * 7))

function reviewed(key: string): number {
  return progress.activity[key]?.reviewed ?? 0
}

// `!` (important) beats the grid cell's own scoped background.
function levelFor(key: string): string {
  const n = reviewed(key)
  if (n === 0) return ''
  if (n < 3) return 'bg-primary/35!'
  if (n < 6) return 'bg-primary/65!'
  return 'bg-primary!'
}

function dayLabel(key: string): string {
  const n = reviewed(key)
  const date = formatDate(fromDateKey(key), { weekday: 'short', month: 'short', day: 'numeric' })
  return `${date}: ${n === 0 ? 'no reviews' : `${n} reviewed`}`
}

const total = computed(() => days.value.reduce((sum, k) => sum + reviewed(k), 0))
const activeDays = computed(() => days.value.filter((k) => reviewed(k) > 0).length)
</script>

<template>
  <BaseCard as="section" aria-labelledby="activity-title">
    <template #head>
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="activity-title" class="text-ink font-semibold">Activity</h2>
        <p class="text-ink-soft text-xs tabular-nums">
          {{ total }} reviews on {{ activeDays }} days · last {{ WEEKS }} weeks
        </p>
      </div>
    </template>
    <ActivityGrid
      :days="days"
      label="Reviews per day, last 16 weeks"
      :level-for="levelFor"
      :day-label="dayLabel"
    />
    <div class="text-ink-soft mt-3 flex items-center justify-end gap-1.5 text-xs" aria-hidden="true">
      Less
      <span class="bg-muted size-2.5 rounded-sm" />
      <span class="bg-primary/35 size-2.5 rounded-sm" />
      <span class="bg-primary/65 size-2.5 rounded-sm" />
      <span class="bg-primary size-2.5 rounded-sm" />
      More
    </div>
  </BaseCard>
</template>
