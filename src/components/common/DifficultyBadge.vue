<script setup lang="ts">
import { BaseBadge } from 'rei-kit'
import type { Difficulty } from '@/types/content'
import { DIFFICULTY_LABEL, DIFFICULTY_TONE } from './labels'

defineProps<{ value: Difficulty }>()
</script>

<template>
  <BaseBadge :tone="DIFFICULTY_TONE[value]">{{ DIFFICULTY_LABEL[value] }}</BaseBadge>
</template>
