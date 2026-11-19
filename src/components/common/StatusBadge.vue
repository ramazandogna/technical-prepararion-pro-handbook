<script setup lang="ts">
import { BaseBadge } from 'rei-kit'
import type { ProgressStatus } from '@/types/progress'
import { STATUS_LABEL, STATUS_TONE } from './labels'

defineProps<{ value: ProgressStatus }>()
</script>

<template>
  <BaseBadge :tone="STATUS_TONE[value]">{{ STATUS_LABEL[value] }}</BaseBadge>
</template>
