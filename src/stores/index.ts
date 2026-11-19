import { useNotesStore } from './notes'
import { useProgressStore } from './progress'
import { useSettingsStore } from './settings'

export { useNotesStore, useProgressStore, useSettingsStore }

/** Loads all persisted state. Idempotent — call once from App.vue (after Pinia is installed). */
export async function initStores(): Promise<void> {
  await Promise.all([useSettingsStore().init(), useProgressStore().init(), useNotesStore().init()])
}

/** Re-reads all stores from storage (after a restore or reset). */
export async function reloadStores(): Promise<void> {
  await Promise.all([useSettingsStore().reload(), useProgressStore().reload(), useNotesStore().reload()])
}
