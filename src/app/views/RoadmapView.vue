<script setup lang="ts">
import { computed } from 'vue'
import { BaseBadge } from 'rei-kit'
import { CircleCheck } from 'lucide-vue-next'
import { getTrack } from '@/content'
import { roadmap } from '@/content/meta/roadmap'
import type { Track } from '@/types/content'
import { useProgressStore } from '@/stores/progress'
import PageTitle from '@/components/common/PageTitle.vue'
import TrackCard from '@/components/common/TrackCard.vue'

const progress = useProgressStore()

const phases = computed(() =>
  roadmap.map((p) => {
    const phaseTracks = p.trackIds.map((id) => getTrack(id)).filter((t): t is Track => Boolean(t))
    const totals = phaseTracks.reduce(
      (acc, t) => {
        const s = progress.trackStats(t.id)
        return { total: acc.total + s.total, mastered: acc.mastered + s.mastered }
      },
      { total: 0, mastered: 0 },
    )
    return { ...p, tracks: phaseTracks, ...totals }
  }),
)
</script>

<template>
  <div class="flex flex-col gap-8">
    <PageTitle
      eyebrow="Learning path"
      title="Roadmap"
      description="Four phases, about sixteen weeks. Work through them in order, but jump ahead whenever an interview is near."
    />

    <ol class="flex flex-col gap-10">
      <li v-for="p in phases" :key="p.phase" :aria-labelledby="`phase-${p.phase}`">
        <section class="grid grid-cols-1 gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
          <div class="lg:sticky lg:top-8 lg:self-start">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="bg-primary text-on-primary flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums"
                aria-hidden="true"
                >{{ p.phase }}</span
              >
              <BaseBadge tone="neutral">{{ p.weeks }}</BaseBadge>
              <BaseBadge v-if="p.total > 0" tone="primary">
                <span class="tabular-nums">{{ p.mastered }}/{{ p.total }}</span> mastered
              </BaseBadge>
            </div>
            <h2 :id="`phase-${p.phase}`" class="text-ink mt-3 text-xl font-semibold">
              <span class="sr-only">Phase {{ p.phase }}: </span>{{ p.title }}
            </h2>
            <p class="text-ink-soft mt-1 text-sm leading-relaxed">{{ p.summary }}</p>
            <ul v-if="p.goals.length > 0" class="mt-3 flex flex-col gap-1.5" aria-label="Phase goals">
              <li v-for="g in p.goals" :key="g" class="text-ink-soft flex gap-2 text-sm">
                <CircleCheck class="text-positive mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{{ g }}</span>
              </li>
            </ul>
          </div>
          <ul class="grid grid-cols-1 content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <li v-for="t in p.tracks" :key="t.id">
              <TrackCard :track="t" />
            </li>
          </ul>
        </section>
      </li>
    </ol>
  </div>
</template>
