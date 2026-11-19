<script setup lang="ts">
import { BaseBadge } from 'rei-kit'
import type { Priority } from '@/types/content'
import { PRIORITY_LABEL, PRIORITY_TONE } from './labels'

defineProps<{ value: Priority }>()
</script>

<template>
  <BaseBadge :tone="PRIORITY_TONE[value]">{{ PRIORITY_LABEL[value] }}</BaseBadge>
</template>
