<script setup lang="ts">
import { BaseButton, EmptyState } from 'rei-kit'
import { Compass } from 'lucide-vue-next'
import { useCommandMenu } from '@/composables/useCommandMenu'

const { show } = useCommandMenu()
</script>

<template>
  <div class="py-12">
    <h1 class="sr-only">Page not found</h1>
    <EmptyState title="This page does not exist" description="The link may be old, or the question may have moved.">
      <template #icon><Compass class="size-6" aria-hidden="true" /></template>
      <template #action>
        <div class="flex flex-wrap justify-center gap-2">
          <BaseButton as="router-link" to="/">Go to dashboard</BaseButton>
          <BaseButton variant="secondary" @click="show">Search</BaseButton>
        </div>
      </template>
    </EmptyState>
  </div>
</template>
