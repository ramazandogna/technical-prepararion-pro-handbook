<script setup lang="ts">
import { BaseButton, BaseCard } from 'rei-kit'
import { Lightbulb, X } from 'lucide-vue-next'

defineEmits<{ dismiss: [] }>()

const steps = [
  { title: 'Follow the roadmap', body: 'Four phases over ~16 weeks. Each track groups questions by module, from foundations to advanced.' },
  { title: 'Answer before you reveal', body: 'Say or write your answer first, take hints if stuck, then compare with the model answer and key points.' },
  { title: 'Grade yourself honestly', body: 'Again / Hard / Good / Easy schedules the next review. Due questions appear in Review.' },
  { title: 'Make it yours', body: 'Bookmark tricky questions and keep notes on how each one connects to your own projects.' },
]
</script>

<template>
  <BaseCard as="section" padding="lg" aria-labelledby="onboarding-title">
    <div class="flex items-start gap-3">
      <span class="bg-primary/12 text-primary flex size-9 shrink-0 items-center justify-center rounded-card">
        <Lightbulb class="size-5" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <h2 id="onboarding-title" class="text-ink text-lg font-semibold">How Interview OS works</h2>
        <p class="text-ink-soft mt-1 text-sm">A short loop, repeated daily, beats cramming.</p>
      </div>
      <BaseButton variant="ghost" size="sm" icon aria-label="Dismiss introduction" @click="$emit('dismiss')">
        <X class="size-4" aria-hidden="true" />
      </BaseButton>
    </div>
    <ol class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <li v-for="(step, i) in steps" :key="step.title" class="flex gap-3">
        <span
          class="border-hair text-ink-soft flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums"
          aria-hidden="true"
          >{{ i + 1 }}</span
        >
        <div>
          <p class="text-ink text-sm font-medium">{{ step.title }}</p>
          <p class="text-ink-soft mt-0.5 text-sm leading-relaxed">{{ step.body }}</p>
        </div>
      </li>
    </ol>
    <div class="mt-5 flex flex-wrap gap-2">
      <BaseButton as="router-link" to="/roadmap" size="sm">See the roadmap</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="$emit('dismiss')">Got it</BaseButton>
    </div>
  </BaseCard>
</template>
