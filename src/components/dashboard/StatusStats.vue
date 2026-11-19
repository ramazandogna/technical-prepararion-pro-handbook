<script setup lang="ts">
import { computed } from 'vue'
import { StatCard } from 'rei-kit'
import { useProgressStore } from '@/stores/progress'
import { STATUS_LABEL } from '@/components/common/labels'
import type { ProgressStatus } from '@/types/progress'

const progress = useProgressStore()
const order: ProgressStatus[] = ['new', 'learning', 'reviewing', 'mastered']
const stats = computed(() => order.map((s) => ({ key: s, label: STATUS_LABEL[s], value: String(progress.counts[s] ?? 0) })))
</script>

<template>
  <section aria-labelledby="stats-title">
    <h2 id="stats-title" class="sr-only">Questions by status</h2>
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard v-for="s in stats" :key="s.key" :value="s.value" :label="s.label" />
    </div>
  </section>
</template>
