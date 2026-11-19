<script setup lang="ts">
/**
 * Plain-text personal notes per question. Debounced autosave via notes.save; the pending save
 * is flushed when the question changes or the component unmounts, so nothing typed is lost.
 * Notes are rendered as text only — never through Markdown/v-html.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-vue-next'
import { BaseTextarea, useDebouncedCallback } from 'rei-kit'
import { useNotesStore } from '@/stores/notes'

const props = withDefaults(defineProps<{ questionId: string; rows?: number }>(), { rows: 6 })

const notes = useNotesStore()
const body = ref('')
const dirty = ref(false)
const state = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const savedAt = ref<string | null>(null)

const stored = computed(() => notes.get(props.questionId))

async function persist(id: string, value: string) {
  state.value = 'saving'
  try {
    await notes.save(id, value)
    state.value = 'saved'
    savedAt.value = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    if (id === props.questionId) dirty.value = false
  } catch {
    state.value = 'error'
  }
}

const autosave = useDebouncedCallback((id: string, value: string) => void persist(id, value), 700)

function load() {
  body.value = stored.value?.body ?? ''
  dirty.value = false
}

// Switching question: save what was typed for the previous one first.
watch(
  () => props.questionId,
  () => {
    autosave.flush()
    state.value = 'idle'
    savedAt.value = null
    load()
  },
  { immediate: true },
)

// The store may finish loading after mount; adopt its value unless the user already typed.
watch(
  () => stored.value?.body,
  (value) => {
    if (!dirty.value && value !== undefined && value !== body.value) body.value = value
  },
)

function onInput(value: string) {
  body.value = value
  dirty.value = true
  state.value = 'saving'
  autosave.run(props.questionId, value)
}

onBeforeUnmount(() => autosave.flush())

const updatedLabel = computed(() => {
  const iso = stored.value?.updatedAt
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <BaseTextarea
      :model-value="body"
      label="Your notes"
      :rows="rows"
      hint="Plain text, saved on this device as you type."
      @update:model-value="onInput"
    />
    <p class="flex min-h-5 items-center gap-1.5 text-xs text-ink-soft" aria-live="polite">
      <template v-if="state === 'saving'">
        <Loader2 class="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Saving…
      </template>
      <template v-else-if="state === 'saved'">
        <CheckCircle2 class="size-3.5 text-positive" aria-hidden="true" />
        {{ body.trim() ? `Saved${savedAt ? ` at ${savedAt}` : ''}` : 'Note cleared' }}
      </template>
      <template v-else-if="state === 'error'">
        <AlertCircle class="size-3.5 text-negative" aria-hidden="true" />
        <span class="text-negative">Couldn't save. Your text is still here — keep typing to retry.</span>
      </template>
      <template v-else-if="updatedLabel">Last edited {{ updatedLabel }}</template>
    </p>
  </div>
</template>
