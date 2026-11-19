<script setup lang="ts">
import { computed } from 'vue'
import { allEntries, tracks } from '@/content'
import { useSettingsStore } from '@/stores/settings'
import PageTitle from '@/components/common/PageTitle.vue'
import OnboardingCard from '@/components/dashboard/OnboardingCard.vue'
import TodayCard from '@/components/dashboard/TodayCard.vue'
import StatusStats from '@/components/dashboard/StatusStats.vue'
import TrackProgressList from '@/components/dashboard/TrackProgressList.vue'
import ActivityCard from '@/components/dashboard/ActivityCard.vue'
import BookmarksCard from '@/components/dashboard/BookmarksCard.vue'

const settingsStore = useSettingsStore()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 5) return 'Working late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
const showOnboarding = computed(() => settingsStore.ready && !settingsStore.settings.onboardingDismissed)

function dismissOnboarding() {
  void settingsStore.update({ onboardingDismissed: true })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageTitle
      :eyebrow="today"
      :title="greeting"
      :description="`${allEntries.length} questions across ${tracks.length} tracks. A little every day compounds.`"
    />

    <OnboardingCard v-if="showOnboarding" @dismiss="dismissOnboarding" />

    <TodayCard />

    <StatusStats />

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <TrackProgressList />
      <div class="flex min-w-0 flex-col gap-6">
        <ActivityCard />
        <BookmarksCard />
      </div>
    </div>
  </div>
</template>
