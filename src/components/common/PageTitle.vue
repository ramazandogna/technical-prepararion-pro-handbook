<script setup lang="ts">
/** The heading block at the top of every view: optional eyebrow, h1, description, actions. */
defineProps<{ title: string; eyebrow?: string; description?: string }>()
</script>

<template>
  <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <p v-if="eyebrow" class="text-ink-soft mb-1 text-xs font-medium tracking-wide uppercase">{{ eyebrow }}</p>
      <h1 class="text-ink text-2xl font-semibold tracking-tight sm:text-3xl">{{ title }}</h1>
      <p v-if="description" class="text-ink-soft mt-2 max-w-[65ch] text-sm leading-relaxed sm:text-base">
        {{ description }}
      </p>
      <slot name="below" />
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
