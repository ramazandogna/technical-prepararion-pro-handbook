import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { createBackup, parseBackup, restoreBackup } from '@/services/backup'
import { clearAllData } from '@/services/storage'
import { deriveKeys, pull, push, type SyncKeys } from '@/services/sync'
import type { BackupFile } from '@/types/progress'
import { reloadStores, useNotesStore, useProgressStore, useSessionStore, useSettingsStore } from './index'

const CODE_KEY = 'ios-sync-code'
const MODE_KEY = 'ios-sync-mode'
const REMOTE_AT_KEY = 'ios-sync-remote-at'
const DEBOUNCE_MS = 2500

type Mode = 'unset' | 'offline' | 'cloud'

const ls = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set: (k: string, v: string | null) => {
    try {
      if (v === null) localStorage.removeItem(k)
      else localStorage.setItem(k, v)
    } catch {
      /* storage blocked */
    }
  },
}

/** Everything except timestamps of the export itself — equal fingerprints mean nothing to upload. */
const fingerprint = (b: BackupFile) =>
  JSON.stringify([b.progress, b.notes, b.activity, b.session ?? null, { ...b.settings, lastBackupAt: null }])

/**
 * Code-based sync. "Log in" = enter your personal code: the cloud copy for that code is merged
 * into this device, and every change is pushed back (debounced). "Log out" uploads, then wipes
 * this device so another code starts clean.
 */
export const useSyncStore = defineStore('sync', () => {
  const code = ref<string | null>(ls.get(CODE_KEY))
  const mode = ref<Mode>(code.value ? 'cloud' : ls.get(MODE_KEY) === 'offline' ? 'offline' : 'unset')
  const status = ref<'idle' | 'syncing' | 'error'>('idle')
  const error = ref<string | null>(null)
  const lastSyncedAt = ref<string | null>(ls.get(REMOTE_AT_KEY))

  let keys: SyncKeys | null = null
  let lastPushed = ''
  let timer: ReturnType<typeof setTimeout> | undefined
  let running: Promise<void> | null = null
  let again = false
  let stopWatch: (() => void) | null = null

  const label = computed(() => (code.value ? `•••${code.value.slice(-2)}` : null))

  async function getKeys(): Promise<SyncKeys> {
    if (!keys) keys = await deriveKeys(code.value ?? '')
    return keys
  }

  /** Pull + merge the remote copy when it changed elsewhere, then upload if anything differs. */
  async function syncOnce(): Promise<void> {
    if (mode.value !== 'cloud') return
    status.value = 'syncing'
    try {
      const k = await getKeys()
      const remoteText = await pull(k)
      if (remoteText) {
        const parsed = parseBackup(remoteText)
        if (!parsed.ok) throw new Error(`Cloud copy rejected: ${parsed.error}`)
        if (parsed.data.exportedAt !== lastSyncedAt.value) await restoreBackup(parsed.data, 'merge')
      }
      const local = await createBackup()
      const fp = fingerprint(local)
      if (fp !== lastPushed || !remoteText) {
        await push(k, local)
        lastPushed = fp
        lastSyncedAt.value = local.exportedAt
        ls.set(REMOTE_AT_KEY, local.exportedAt)
      }
      status.value = 'idle'
      error.value = null
    } catch (e) {
      status.value = 'error'
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  /** Serialised: concurrent calls coalesce into one follow-up run. */
  function syncNow(): Promise<void> {
    clearTimeout(timer)
    if (running) {
      again = true
      return running
    }
    running = syncOnce()
      .catch(() => undefined)
      .finally(() => {
        running = null
        if (again) {
          again = false
          void syncNow()
        }
      })
    return running
  }

  function schedule() {
    if (mode.value !== 'cloud') return
    clearTimeout(timer)
    timer = setTimeout(() => void syncNow(), DEBOUNCE_MS)
  }

  function startAuto() {
    if (stopWatch) return
    const progress = useProgressStore()
    const notes = useNotesStore()
    const settings = useSettingsStore()
    const session = useSessionStore()
    stopWatch = watch(
      () => [progress.records, progress.activity, notes.notes, settings.settings, session.session],
      schedule,
      { deep: true },
    )
    document.addEventListener('visibilitychange', onVisibility)
  }

  function onVisibility() {
    if (mode.value === 'cloud') void syncNow()
  }

  /** Called once at app start. */
  async function boot(): Promise<void> {
    if (mode.value !== 'cloud') return
    startAuto()
    await syncNow()
  }

  /** Use (or create) the cloud copy for this code; local data is merged into it. */
  async function login(rawCode: string): Promise<void> {
    const c = rawCode.trim()
    keys = await deriveKeys(c) // validates length
    code.value = c
    mode.value = 'cloud'
    lastSyncedAt.value = null
    lastPushed = ''
    try {
      await syncOnce()
    } catch (e) {
      code.value = null
      mode.value = 'unset'
      keys = null
      throw e
    }
    ls.set(CODE_KEY, c)
    ls.set(MODE_KEY, 'cloud')
    startAuto()
  }

  function useOffline() {
    mode.value = 'offline'
    ls.set(MODE_KEY, 'offline')
  }

  /**
   * Upload, then wipe this device. Throws when the upload fails unless `force` — logging out then
   * would lose changes that only exist here.
   */
  async function logout(force = false): Promise<void> {
    if (mode.value === 'cloud') {
      clearTimeout(timer)
      if (running) await running
      try {
        await syncOnce()
      } catch (e) {
        if (!force) throw e
      }
    }
    stopWatch?.()
    stopWatch = null
    document.removeEventListener('visibilitychange', onVisibility)
    code.value = null
    keys = null
    lastPushed = ''
    lastSyncedAt.value = null
    mode.value = 'unset'
    status.value = 'idle'
    error.value = null
    for (const k of [CODE_KEY, MODE_KEY, REMOTE_AT_KEY]) ls.set(k, null)
    await clearAllData()
    await reloadStores()
  }

  return { code, mode, status, error, lastSyncedAt, label, boot, login, logout, useOffline, syncNow }
})
