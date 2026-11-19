<script setup lang="ts">
/**
 * Renders TRUSTED curriculum Markdown (our own static data). Never use for user notes —
 * notes are plain text rendered with text interpolation.
 */
import { computed } from 'vue'
import { renderInline, renderMarkdown } from '@/composables/useMarkdown'
import CodeSnippet from './CodeSnippet.vue'

const props = withDefaults(
  defineProps<{
    source: string
    /** Inline mode: no block elements, renders into a <span>. */
    inline?: boolean
    /** Base label for code regions inside this content. */
    codeLabel?: string
  }>(),
  { inline: false, codeLabel: 'Code example' },
)

const segments = computed(() => (props.inline ? [] : renderMarkdown(props.source)))
const inlineHtml = computed(() => (props.inline ? renderInline(props.source) : ''))
</script>

<template>
  <!-- eslint-disable vue/no-v-html -- trusted static content only -->
  <span v-if="inline" class="prose-ios prose-inline" v-html="inlineHtml" />
  <div v-else class="prose-ios">
    <template v-for="(segment, index) in segments" :key="index">
      <div v-if="segment.kind === 'html'" class="prose-run" v-html="segment.html" />
      <CodeSnippet
        v-else
        class="prose-code"
        :code="segment.code"
        :language="segment.language || 'plaintext'"
        :label="`${codeLabel} ${index + 1}`"
      />
    </template>
  </div>
</template>
