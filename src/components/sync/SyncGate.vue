<script setup lang="ts">
/** First screen on a new device: choose a personal sync code (or continue on this device only). */
import { computed, ref } from 'vue'
import { CloudUpload, GraduationCap, HardDrive } from 'lucide-vue-next'
import { BaseAlert, BaseButton, BaseCard, PasswordInput } from 'rei-kit'
import { MIN_CODE_LENGTH } from '@/services/sync'
import { useSyncStore } from '@/stores/sync'

const sync = useSyncStore()
const code = ref('')
const error = ref<string | null>(null)
const busy = ref(false)
const tooShort = computed(() => code.value.trim().length < MIN_CODE_LENGTH)

async function submit() {
  if (tooShort.value || busy.value) return
  busy.value = true
  error.value = null
  try {
    await sync.login(code.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <main class="grid min-h-dvh place-items-center px-4 py-10">
    <BaseCard padding="lg" class="w-full max-w-md">
      <form class="flex flex-col gap-5" @submit.prevent="submit">
        <div class="flex items-center gap-3">
          <span class="bg-primary text-on-primary flex size-10 items-center justify-center rounded-card">
            <GraduationCap class="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 class="text-lg font-semibold text-ink">Interview OS</h1>
            <p class="text-sm text-ink-soft">Pick your personal code</p>
          </div>
        </div>

        <p class="text-sm text-ink-soft">
          Your code is your login. Use the <strong class="text-ink">same code</strong> on your laptop and phone and you
          continue where you left off. A different code is a different, empty workspace. There is no reset — write it
          down.
        </p>

        <PasswordInput
          v-model="code"
          label="Sync code"
          toggle-label="Show code"
          :hint="`At least ${MIN_CODE_LENGTH} characters. Longer is safer — a short phrase works well.`"
          :error="error ?? undefined"
          autocomplete="current-password"
        />

        <BaseButton type="submit" variant="primary" size="lg" class="justify-center" :disabled="tooShort || busy">
          <CloudUpload class="size-5" aria-hidden="true" />
          {{ busy ? 'Connecting…' : 'Continue with this code' }}
        </BaseButton>

        <BaseAlert tone="info">
          Progress is encrypted in your browser with a key made from your code, then stored as an unreadable blob.
        </BaseAlert>

        <BaseButton variant="ghost" size="sm" class="justify-center" @click="sync.useOffline()">
          <HardDrive class="size-4" aria-hidden="true" />
          Skip — keep progress on this device only
        </BaseButton>
      </form>
    </BaseCard>
  </main>
</template>
