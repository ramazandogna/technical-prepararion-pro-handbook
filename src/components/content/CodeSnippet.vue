<script setup lang="ts">
/** rei-kit CodeBlock (frame, scroll region, copy) with highlight.js markup in its slot. */
import { computed } from 'vue'
import { CodeBlock } from 'rei-kit'
import { highlightCode } from '@/composables/useMarkdown'

const props = withDefaults(
  defineProps<{
    code: string
    language?: string
    /** Accessible name of the scroll region, e.g. "Code for the question". */
    label?: string
    wrap?: boolean
  }>(),
  { language: 'plaintext', label: 'Code sample', wrap: false },
)

const shortNames: Record<string, string> = {
  typescript: 'ts',
  javascript: 'js',
  plaintext: 'text',
}

const html = computed(() => highlightCode(props.code.replace(/\n$/, ''), props.language))
const shownLanguage = computed(() => {
  const raw = props.language.trim().toLowerCase()
  return shortNames[raw] ?? (raw || undefined)
})
</script>

<template>
  <CodeBlock
    class="code-snippet"
    :code="code"
    :label="label"
    :language="shownLanguage"
    :wrap="wrap"
    copy-label="Copy code"
    copied-label="Copied"
  >
    <!-- eslint-disable-next-line vue/no-v-html -- hljs output escapes the source -->
    <span class="hljs" v-html="html" />
  </CodeBlock>
</template>
