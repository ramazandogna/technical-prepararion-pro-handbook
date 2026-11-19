/**
 * Storage service: picks IndexedDB (via `idb`) or an in-memory fallback, and
 * exposes thin per-store repositories. Every function here may reject — callers
 * (the Pinia stores) catch, set their `error`, and keep in-memory state.
 */
import type { ActivityDay, Note, ProgressRecord } from '@/types/progress'
import { createIdbAdapter, DB_VERSION, openInterviewDb } from './db'
import { createMemoryAdapter } from './memory'
import type { MetaKey, StorageAdapter, StorageStatus, WriteBatch } from './types'

export { DB_NAME, DB_VERSION } from './db'
export type { StorageAdapter, StorageStatus, WriteBatch, MetaKey } from './types'

export const STORAGE_UNAVAILABLE_MESSAGE =
  'Browser storage is unavailable (private browsing or storage blocked). Your progress will not be saved after you close this tab — export a backup from Settings to keep it.'

type Db = Awaited<ReturnType<typeof openInterviewDb>>

let dbPromise: Promise<Db> | null = null
function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = openInterviewDb(() => {
      dbPromise = null
    })
    dbPromise.catch(() => {
      dbPromise = null
    })
  }
  return dbPromise
}

let adapterPromise: Promise<StorageAdapter> | null = null
const status: StorageStatus = { mode: 'indexeddb', persisted: null, error: null }

/** True when IndexedDB can actually be opened (not just defined). */
export async function storageAvailable(): Promise<boolean> {
  try {
    await getDb()
    return true
  } catch {
    return false
  }
}

let persistPromise: Promise<boolean | null> | null = null
/** Best-effort request for persistent storage (asked once). null = API unsupported/failed. */
export function requestPersistence(): Promise<boolean | null> {
  if (!persistPromise) {
    persistPromise = (async () => {
      try {
        const sm = typeof navigator !== 'undefined' ? navigator.storage : undefined
        if (!sm?.persist) return null
        if (sm.persisted && (await sm.persisted())) return true
        return await sm.persist()
      } catch {
        return null
      }
    })().then((result) => {
      status.persisted = result
      return result
    })
  }
  return persistPromise
}

/** Resolves the active adapter once (IndexedDB, else memory fallback). Never rejects. */
export function getAdapter(): Promise<StorageAdapter> {
  if (!adapterPromise) {
    adapterPromise = (async () => {
      try {
        await getDb()
        status.mode = 'indexeddb'
        status.error = null
        void requestPersistence()
        return createIdbAdapter(getDb)
      } catch (e) {
        console.warn('[storage] IndexedDB unavailable, using in-memory fallback:', e)
        status.mode = 'memory'
        status.error = STORAGE_UNAVAILABLE_MESSAGE
        return createMemoryAdapter()
      }
    })()
  }
  return adapterPromise
}

/** Current storage status (call after `getAdapter()` resolved for a meaningful value). */
export function getStorageStatus(): Readonly<StorageStatus> {
  return { ...status }
}

/** Human-readable message for a failed write/read. */
export function describeStorageError(action: string, e: unknown): string {
  const name = e instanceof DOMException || e instanceof Error ? e.name : ''
  const reason =
    name === 'QuotaExceededError'
      ? 'browser storage is full'
      : e instanceof Error && e.message
        ? e.message
        : 'unknown error'
  return `Could not ${action}: ${reason}. Your changes are kept for this session but may be lost on reload.`
}

// ---- repositories ----------------------------------------------------------

export const progressRepo = {
  all: async (): Promise<ProgressRecord[]> => (await getAdapter()).getAll('progress'),
  put: async (record: ProgressRecord): Promise<void> => (await getAdapter()).put('progress', record),
  remove: async (questionId: string): Promise<void> => (await getAdapter()).delete('progress', questionId),
}

export const notesRepo = {
  all: async (): Promise<Note[]> => (await getAdapter()).getAll('notes'),
  put: async (note: Note): Promise<void> => (await getAdapter()).put('notes', note),
  remove: async (questionId: string): Promise<void> => (await getAdapter()).delete('notes', questionId),
}

export const activityRepo = {
  all: async (): Promise<ActivityDay[]> => (await getAdapter()).getAll('activity'),
  put: async (day: ActivityDay): Promise<void> => (await getAdapter()).put('activity', day),
}

export const metaRepo = {
  get: async (key: MetaKey): Promise<unknown> => (await getAdapter()).getMeta(key),
  set: async (key: MetaKey, value: unknown): Promise<void> => (await getAdapter()).setMeta(key, value),
}

/** Atomic multi-store write (single IndexedDB transaction). */
export async function writeBatch(batch: WriteBatch): Promise<void> {
  return (await getAdapter()).writeBatch(batch)
}

/** Deletes all user data (progress, notes, activity, settings). Keeps the schema version. */
export async function clearAllData(): Promise<void> {
  await writeBatch({
    clear: ['progress', 'notes', 'activity', 'meta'],
    meta: [['schemaVersion', DB_VERSION]],
  })
}
