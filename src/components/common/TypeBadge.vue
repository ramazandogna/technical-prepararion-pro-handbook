<script setup lang="ts">
import { BaseBadge } from 'rei-kit'
import type { QuestionType } from '@/types/content'
import { TYPE_LABEL } from './labels'

defineProps<{ value: QuestionType }>()
</script>

<template>
  <BaseBadge tone="neutral">{{ TYPE_LABEL[value] }}</BaseBadge>
</template>
