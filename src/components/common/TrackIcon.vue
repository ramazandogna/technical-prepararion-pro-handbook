<script setup lang="ts">
/** Maps a Track.icon string (lucide PascalCase name) to a component, with a fallback. */
import { computed, type Component } from 'vue'
import {
  Atom,
  Binary,
  BookOpen,
  Braces,
  Code2,
  CodeXml,
  Component as ComponentIcon,
  Container,
  Cpu,
  Database,
  FileCode,
  FileCode2,
  FlaskConical,
  Layers,
  LayoutTemplate,
  MapPin,
  MemoryStick,
  MessagesSquare,
  Network,
  Server,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-vue-next'

const props = defineProps<{ name: string }>()

const ICONS: Record<string, Component> = {
  Atom,
  Binary,
  BookOpen,
  Braces,
  Code2,
  CodeXml,
  Component: ComponentIcon,
  Container,
  Cpu,
  Database,
  FileCode,
  FileCode2,
  FlaskConical,
  Layers,
  LayoutTemplate,
  MapPin,
  MemoryStick,
  MessagesSquare,
  Network,
  Server,
  ShieldCheck,
  Users,
  Workflow,
}

const icon = computed<Component>(() => ICONS[props.name] ?? BookOpen)
</script>

<template>
  <component :is="icon" aria-hidden="true" />
</template>
