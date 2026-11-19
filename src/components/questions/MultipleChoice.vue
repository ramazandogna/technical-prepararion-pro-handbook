<script setup lang="ts">
/**
 * Select → Check → per-choice explanations. Radios when exactly one choice is correct,
 * checkboxes otherwise ("Select all that apply"). Native inputs inside a fieldset for
 * screen readers and keyboard; the row is the hit target.
 */
import { computed, ref, useId, watch } from 'vue'
import { Check, CheckCircle2, RotateCcw, XCircle } from 'lucide-vue-next'
import { BaseButton } from 'rei-kit'
import type { Choice } from '@/types/content'
import { useProgressStore } from '@/stores/progress'
import MarkdownContent from '@/components/content/MarkdownContent.vue'
import { markEngaged } from './learning'

const props = defineProps<{
  questionId: string
  choices: readonly Choice[]
}>()

const emit = defineEmits<{ checked: [correct: boolean] }>()

const progress = useProgressStore()
const uid = useId()

const multiple = computed(() => props.choices.filter((c) => c.correct).length > 1)
const selected = ref<string[]>([])
const checked = ref(false)

watch(
  () => props.questionId,
  () => {
    selected.value = []
    checked.value = false
  },
)

const isCorrect = computed(() => {
  const correctIds = props.choices.filter((c) => c.correct).map((c) => c.id)
  return correctIds.length === selected.value.length && correctIds.every((id) => selected.value.includes(id))
})

function toggle(id: string, on: boolean) {
  if (checked.value) return
  if (!multiple.value) selected.value = on ? [id] : []
  else selected.value = on ? [...new Set([...selected.value, id])] : selected.value.filter((v) => v !== id)
}

async function check() {
  if (!selected.value.length || checked.value) return
  checked.value = true
  emit('checked', isCorrect.value)
  await markEngaged(progress, props.questionId)
}

function retry() {
  selected.value = []
  checked.value = false
}

function stateOf(choice: Choice): 'correct' | 'wrong' | 'missed' | 'neutral' {
  if (!checked.value) return 'neutral'
  const picked = selected.value.includes(choice.id)
  if (choice.correct) return picked ? 'correct' : 'missed'
  return picked ? 'wrong' : 'neutral'
}

const stateLabel: Record<'correct' | 'wrong' | 'missed', string> = {
  correct: 'Correct choice',
  wrong: 'Incorrect choice',
  missed: 'Correct — you missed this one',
}

const feedback = computed(() => {
  if (!checked.value) return ''
  if (isCorrect.value) return 'Correct. Read the explanations, then reveal the full answer.'
  return multiple.value
    ? 'Not quite — check which correct options you missed or which you picked by mistake.'
    : 'Not quite. The correct option is marked below.'
})
</script>

<template>
  <fieldset class="flex min-w-0 flex-col gap-3">
    <legend class="mb-3 text-sm font-semibold text-ink">
      {{ multiple ? 'Select all that apply' : 'Choose one answer' }}
    </legend>

    <div class="flex flex-col gap-2">
      <label
        v-for="(choice, index) in choices"
        :key="choice.id"
        :for="`${uid}-${choice.id}`"
        class="choice-row"
        :class="{
          'is-correct': stateOf(choice) === 'correct' || stateOf(choice) === 'missed',
          'is-wrong': stateOf(choice) === 'wrong',
          'is-locked': checked,
        }"
      >
        <input
          :id="`${uid}-${choice.id}`"
          :type="multiple ? 'checkbox' : 'radio'"
          :name="`${uid}-choice`"
          :value="choice.id"
          :checked="selected.includes(choice.id)"
          :disabled="checked"
          :aria-describedby="checked && choice.explanation ? `${uid}-${choice.id}-exp` : undefined"
          @change="toggle(choice.id, ($event.target as HTMLInputElement).checked)"
        />
        <span class="flex min-w-0 flex-1 flex-col gap-1">
          <span class="flex items-start gap-2 text-sm text-ink">
            <span class="font-semibold text-ink-soft uppercase" aria-hidden="true">{{ String.fromCharCode(97 + index) }}.</span>
            <MarkdownContent :source="choice.text" inline />
          </span>
          <template v-if="stateOf(choice) !== 'neutral'">
            <span
              class="inline-flex items-center gap-1 text-xs font-semibold"
              :class="stateOf(choice) === 'wrong' ? 'text-negative' : 'text-positive'"
            >
              <XCircle v-if="stateOf(choice) === 'wrong'" class="size-3.5" aria-hidden="true" />
              <CheckCircle2 v-else class="size-3.5" aria-hidden="true" />
              {{ stateLabel[stateOf(choice) as 'correct' | 'wrong' | 'missed'] }}
            </span>
          </template>
          <span v-if="checked && choice.explanation" :id="`${uid}-${choice.id}-exp`" class="text-sm text-ink-soft">
            <MarkdownContent :source="choice.explanation" inline />
          </span>
        </span>
      </label>
    </div>

    <div
      v-if="checked"
      class="tint-panel flex items-start gap-2 text-sm"
      :class="isCorrect ? 'tint-positive' : 'tint-negative'"
      aria-hidden="true"
    >
      <CheckCircle2 v-if="isCorrect" class="mt-0.5 size-4 shrink-0 text-positive" aria-hidden="true" />
      <XCircle v-else class="mt-0.5 size-4 shrink-0 text-negative" aria-hidden="true" />
      <span class="text-ink">{{ feedback }}</span>
    </div>
    <p class="sr-only" aria-live="polite">{{ feedback }}</p>

    <div class="flex flex-wrap gap-2">
      <BaseButton v-if="!checked" variant="primary" :disabled="!selected.length" @click="check">
        <Check class="size-4" aria-hidden="true" />
        Check answer
      </BaseButton>
      <BaseButton v-else variant="ghost" @click="retry">
        <RotateCcw class="size-4" aria-hidden="true" />
        Try again
      </BaseButton>
    </div>
  </fieldset>
</template>
