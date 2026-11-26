<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { BaseAlert, BaseButton, ToastHost } from 'rei-kit'
import { SkipLink } from 'rei-kit/web'
import AppLayout from '@/app/layouts/AppLayout.vue'
import { initStores, reloadStores, useNotesStore, useProgressStore, useSettingsStore } from '@/stores'
import { useSyncStore } from '@/stores/sync'
import SyncGate from '@/components/sync/SyncGate.vue'

const progress = useProgressStore()
const notes = useNotesStore()
const settings = useSettingsStore()

const sync = useSyncStore()

onMounted(() => {
  void initStores().then(() => sync.boot())
})

function retry() {
  void reloadStores()
}

const storeError = computed(() => progress.error ?? notes.error ?? settings.error)
</script>

<template>
  <SyncGate v-if="sync.mode === 'unset'" />
  <template v-else>
  <SkipLink for="main" label="Skip to content" />
  <AppLayout>
    <template v-if="storeError" #banner>
      <BaseAlert tone="danger" assertive>
        <template #title>Your progress could not be saved or loaded</template>
        {{ storeError }} Your browser may be blocking local storage (private mode or full disk). Export a backup from
        Settings if you can.
        <template #action>
          <BaseButton size="sm" variant="secondary" @click="retry">Try again</BaseButton>
        </template>
      </BaseAlert>
    </template>
  </AppLayout>
  </template>
  <ToastHost close-label="Dismiss notification" />
</template>
