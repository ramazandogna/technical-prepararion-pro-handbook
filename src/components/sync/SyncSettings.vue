<script setup lang="ts">
import { computed, ref } from 'vue'
import { Cloud, KeyRound, LogOut, RefreshCw } from 'lucide-vue-next'
import { BaseAlert, BaseButton, SettingsGroup, SettingsRow, formatDate } from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import { useSyncStore } from '@/stores/sync'

const sync = useSyncStore()
const confirmOpen = ref(false)
const busy = ref(false)
const logoutError = ref<string | null>(null)

const last = computed(() =>
  sync.lastSyncedAt ? formatDate(new Date(sync.lastSyncedAt), { dateStyle: 'medium', timeStyle: 'short' }) : 'never',
)

async function logout(force = false) {
  busy.value = true
  logoutError.value = null
  try {
    await sync.logout(force)
    confirmOpen.value = false
  } catch (e) {
    logoutError.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}

function setCode() {
  // Back to the code screen; local progress is merged into the code's copy on login.
  sync.mode = 'unset'
}
</script>

<template>
  <SettingsGroup id="sync" title="Sync code">
    <template v-if="sync.mode === 'cloud'">
      <SettingsRow label="Signed in with your code" :description="`Code ${sync.label} · last synced ${last}`" :icon="Cloud">
        <BaseButton size="sm" variant="secondary" :loading="sync.status === 'syncing'" @click="sync.syncNow()">
          <RefreshCw class="size-4" aria-hidden="true" /> Sync now
        </BaseButton>
      </SettingsRow>
      <SettingsRow v-if="sync.error" label="Last sync failed" :description="sync.error" />
      <SettingsRow label="Log out" description="Uploads, then clears this device. Enter another code to switch." :icon="LogOut">
        <BaseButton size="sm" variant="ghost" @click="confirmOpen = true">Log out</BaseButton>
      </SettingsRow>
    </template>
    <SettingsRow
      v-else
      label="This device only"
      description="Set a code to keep progress safe and continue on your phone or another computer."
      :icon="KeyRound"
    >
      <BaseButton size="sm" variant="primary" @click="setCode">Set a sync code</BaseButton>
    </SettingsRow>
  </SettingsGroup>

  <ResponsiveDialog v-model="confirmOpen" title="Log out of this code?" close-label="Cancel">
    <p class="text-sm text-ink">
      Your progress is uploaded first, then removed from this device. Log back in with the same code to get it back.
    </p>
    <BaseAlert v-if="logoutError" tone="danger" class="mt-3">
      {{ logoutError }} Logging out now would lose changes that only exist on this device.
    </BaseAlert>
    <template #actions>
      <BaseButton variant="ghost" @click="confirmOpen = false">Cancel</BaseButton>
      <BaseButton v-if="logoutError" variant="danger" :loading="busy" @click="logout(true)">Log out anyway</BaseButton>
      <BaseButton v-else variant="primary" :loading="busy" @click="logout()">Upload &amp; log out</BaseButton>
    </template>
  </ResponsiveDialog>
</template>
