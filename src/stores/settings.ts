import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppSettings } from '@/types/progress'
import { DEFAULT_SETTINGS } from '@/types/progress'
import {
  describeStorageError,
  getAdapter,
  getStorageStatus,
  metaRepo,
  requestPersistence,
} from '@/services/storage'
import { normalizeSettings } from '@/services/backup/validate'

export const useSettingsStore = defineStore('settings', () => {
  const ready = ref(false)
  const error = ref<string | null>(null)
  const settings = ref<AppSettings>({ ...DEFAULT_SETTINGS })
  /** 'memory' means nothing survives a reload (private mode / storage blocked). */
  const storageMode = ref<'indexeddb' | 'memory'>('indexeddb')
  /** navigator.storage.persist() result; null = unsupported or not granted info. */
  const persisted = ref<boolean | null>(null)

  let initPromise: Promise<void> | null = null

  async function load(): Promise<void> {
    try {
      await getAdapter()
      const status = getStorageStatus()
      storageMode.value = status.mode
      settings.value = normalizeSettings(await metaRepo.get('settings'))
      error.value = status.error
      if (status.mode === 'indexeddb') {
        void requestPersistence().then((p) => (persisted.value = p))
      }
    } catch (e) {
      console.error('[settings] load failed', e)
      error.value = describeStorageError('load your settings', e)
    } finally {
      ready.value = true
    }
  }

  function init(): Promise<void> {
    if (!initPromise) initPromise = load()
    return initPromise
  }

  function reload(): Promise<void> {
    initPromise = load()
    return initPromise
  }

  async function update(patch: Partial<AppSettings>): Promise<void> {
    await init()
    const next = normalizeSettings({ ...settings.value, ...patch })
    settings.value = next
    try {
      await metaRepo.set('settings', { ...next })
    } catch (e) {
      console.error('[settings] save failed', e)
      error.value = describeStorageError('save your settings', e)
    }
  }

  return { ready, error, settings, storageMode, persisted, init, reload, update }
})
