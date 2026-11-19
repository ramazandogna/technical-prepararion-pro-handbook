<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { BaseBadge, BaseButton, BaseCard, EmptyState, ProgressBar } from 'rei-kit'
import { BaseBreadcrumb } from 'rei-kit/web'
import { Dumbbell, Hourglass, SearchX } from 'lucide-vue-next'
import { getTrack } from '@/content'
import { roadmap } from '@/content/meta/roadmap'
import { useProgressStore } from '@/stores/progress'
import PageTitle from '@/components/common/PageTitle.vue'
import TrackIcon from '@/components/common/TrackIcon.vue'
import QuestionRow from '@/components/common/QuestionRow.vue'

const route = useRoute()
const progress = useProgressStore()

const track = computed(() => getTrack(String(route.params.trackId)))
const stats = computed(() => (track.value ? progress.trackStats(track.value.id) : null))
const phase = computed(() => roadmap.find((p) => p.phase === track.value?.phase))
const totalMinutes = computed(
  () => track.value?.modules.reduce((sum, m) => sum + m.questions.reduce((s, q) => s + q.estMinutes, 0), 0) ?? 0,
)

function moduleMastered(questionIds: string[]): number {
  return questionIds.filter((id) => progress.statusOf(id) === 'mastered').length
}
</script>

<template>
  <div v-if="track && stats" class="flex flex-col gap-6">
    <BaseBreadcrumb
      label="Breadcrumb"
      :items="[{ label: 'Roadmap', to: '/roadmap' }, { label: `Phase ${track.phase}${phase ? ` · ${phase.title}` : ''}`, to: '/roadmap' }, { label: track.title }]"
    />

    <PageTitle :eyebrow="`Track ${track.code}`" :title="track.title" :description="track.summary">
      <template #actions>
        <BaseButton v-if="stats.total > 0" as="router-link" :to="{ path: '/review', query: { track: track.id } }">
          <Dumbbell class="size-4" aria-hidden="true" /> Practice this track
        </BaseButton>
      </template>
    </PageTitle>

    <BaseCard padding="lg">
      <div class="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_16rem] md:items-start">
        <div class="flex gap-3">
          <span class="bg-primary/12 text-primary flex size-10 shrink-0 items-center justify-center rounded-card">
            <TrackIcon :name="track.icon" class="size-5" />
          </span>
          <div>
            <h2 class="text-ink text-sm font-semibold">Why this matters for you</h2>
            <p class="text-ink-soft mt-1 text-sm leading-relaxed">
              {{ track.rationale || 'Rationale coming soon.' }}
            </p>
          </div>
        </div>
        <div>
          <div class="text-ink-soft mb-1.5 flex justify-between text-xs tabular-nums">
            <span>{{ stats.mastered }} of {{ stats.total }} mastered</span>
            <span>{{ stats.percent }}%</span>
          </div>
          <ProgressBar
            :value="stats.mastered"
            :max="Math.max(1, stats.total)"
            :label="`${track.title} progress`"
          />
          <p class="text-ink-soft mt-2 text-xs tabular-nums">
            {{ track.modules.length }} modules · {{ stats.started }} started · ~{{ Math.round(totalMinutes / 6) / 10 }} h
          </p>
        </div>
      </div>
    </BaseCard>

    <EmptyState
      v-if="track.modules.length === 0"
      title="Questions for this track are being written"
      description="Check back soon, or keep going with another track on the roadmap."
    >
      <template #icon><Hourglass class="size-6" aria-hidden="true" /></template>
      <template #action>
        <BaseButton as="router-link" to="/roadmap" variant="secondary">Back to roadmap</BaseButton>
      </template>
    </EmptyState>

    <section v-for="(m, i) in track.modules" :key="m.id" :aria-labelledby="`mod-${m.id}`">
      <BaseCard padding="none">
        <template #head>
          <div class="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
            <div class="min-w-0">
              <p class="text-ink-soft text-xs tabular-nums">Module {{ i + 1 }}</p>
              <h2 :id="`mod-${m.id}`" class="text-ink font-semibold">{{ m.title }}</h2>
              <p class="text-ink-soft mt-0.5 text-sm">{{ m.summary }}</p>
            </div>
            <BaseBadge tone="neutral">
              <span class="tabular-nums">{{ moduleMastered(m.questions.map((q) => q.id)) }}/{{ m.questions.length }}</span>
            </BaseBadge>
          </div>
        </template>
        <ul class="divide-hair divide-y">
          <li v-for="q in m.questions" :key="q.id">
            <QuestionRow :question="q" />
          </li>
        </ul>
      </BaseCard>
    </section>
  </div>

  <EmptyState v-else title="Track not found" description="This track does not exist. It may have been renamed.">
    <template #icon><SearchX class="size-6" aria-hidden="true" /></template>
    <template #action>
      <BaseButton as="router-link" to="/roadmap">Go to roadmap</BaseButton>
    </template>
  </EmptyState>
</template>
