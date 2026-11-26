<script setup lang="ts">
import { computed } from 'vue'
import { Flame, RotateCcw } from 'lucide-vue-next'
import { rolePlans } from '@/content/meta/plans'
import { useProgressStore } from '@/stores/progress'
import PageTitle from '@/components/common/PageTitle.vue'
import RoleCard from '@/components/home/RoleCard.vue'
import StatusStats from '@/components/dashboard/StatusStats.vue'
import ActivityCard from '@/components/dashboard/ActivityCard.vue'

const progress = useProgressStore()
const active = computed(() => rolePlans.filter((p) => p.status === 'active'))
const soon = computed(() => rolePlans.filter((p) => p.status === 'coming-soon'))
const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageTitle
      :eyebrow="today"
      title="Pick a role. Press Start."
      description="The panel built each session: algorithms first, then the mix a real loop for that role tests. Close each question, move to the next."
    />

    <div class="flex flex-wrap gap-2 text-sm">
      <span class="flex items-center gap-1.5 rounded-full border border-hair px-3 py-1 text-ink">
        <Flame class="size-4 text-warning" aria-hidden="true" />
        <span class="tabular-nums">{{ progress.streak }}</span> day streak
      </span>
      <RouterLink
        v-if="progress.dueIds.length"
        to="/review"
        class="focus-ring flex items-center gap-1.5 rounded-full border border-hair px-3 py-1 text-ink"
      >
        <RotateCcw class="size-4 text-primary" aria-hidden="true" />
        <span class="tabular-nums">{{ progress.dueIds.length }}</span> due for review
      </RouterLink>
    </div>

    <section class="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Active roles">
      <RoleCard v-for="(plan, i) in active" :key="plan.role" :plan="plan" :featured="i === 0" />
    </section>

    <section class="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Coming soon">
      <RoleCard v-for="plan in soon" :key="plan.role" :plan="plan" />
    </section>

    <StatusStats />
    <ActivityCard />
  </div>
</template>
