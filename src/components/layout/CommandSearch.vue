<script setup lang="ts">
import { CommandMenu } from 'rei-kit/web'
import { useCommandMenu } from '@/composables/useCommandMenu'
import { useGlobalSearch } from '@/composables/useGlobalSearch'

const { open } = useCommandMenu()
const { groups, select } = useGlobalSearch()
</script>

<template>
  <CommandMenu
    v-model="open"
    :groups="groups"
    label="Search Interview OS"
    placeholder="Search pages, tracks and questions…"
    empty-label="Nothing matches. Try fewer words."
    hotkey="k"
    @select="select"
  />
</template>
