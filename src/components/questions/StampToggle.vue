<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * A hanko-style "learned" checkbox. Off: a faint dashed ring. On: a seal is pressed onto the page
 * (drops in, turns, ink bleeds) and stays as a pale green mark. The press plays only on change.
 */
const { checked, disabled = false, glyph = '✓', size = 'md' } = defineProps<{
  checked: boolean
  label: string
  hint?: string
  disabled?: boolean
  glyph?: string
  size?: 'sm' | 'md'
}>()
const emit = defineEmits<{ toggle: [] }>()

const pressed = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
watch(
  () => checked,
  (on) => {
    if (!on) return
    pressed.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (pressed.value = false), 600)
  },
)
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    :aria-disabled="disabled || undefined"
    class="stamp focus-ring inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-card px-1.5 text-start text-sm font-semibold"
    :class="[disabled ? 'stamp-disabled cursor-not-allowed' : 'cursor-pointer', checked ? 'stamp-on' : 'text-ink']"
    @click="!disabled && emit('toggle')"
  >
    <span
      class="stamp-seal relative grid shrink-0 place-items-center rounded-full"
      :class="size === 'sm' ? 'size-8 text-sm' : 'size-10 text-lg'"
      aria-hidden="true"
    >
      <span v-if="checked" class="stamp-ink grid size-full place-items-center rounded-full font-bold" :class="pressed ? 'stamp-press' : ''">
        {{ glyph }}
      </span>
    </span>
    <span class="min-w-0">
      <span class="block">{{ label }}</span>
      <span v-if="hint" class="block text-xs font-normal text-ink-soft">{{ hint }}</span>
    </span>
  </button>
</template>
