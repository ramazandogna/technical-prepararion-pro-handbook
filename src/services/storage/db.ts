import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { ActivityDay, Note, ProgressRecord } from '@/types/progress'
import type { MetaKey, RecordStoreMap, RecordStoreName, StorageAdapter, WriteBatch } from './types'

export const DB_NAME = 'interview-os'
/**
 * IndexedDB schema version. To change the schema: bump this, add an
 * `if (oldVersion < N)` step to `upgrade()` below (never edit old steps),
 * and document it in docs/DATA.md.
 */
export const DB_VERSION = 1

interface InterviewOsDB extends DBSchema {
  progress: { key: string; value: ProgressRecord }
  notes: { key: string; value: Note }
  activity: { key: string; value: ActivityDay }
  meta: { key: MetaKey; value: unknown }
}

type Db = IDBPDatabase<InterviewOsDB>

const OPEN_TIMEOUT_MS = 5000

/** Opens (and migrates) the database. Rejects if IndexedDB is unusable or blocked. */
export async function openInterviewDb(onLost: () => void): Promise<Db> {
  if (typeof indexedDB === 'undefined' || indexedDB === null) {
    throw new Error('IndexedDB is not supported in this browser')
  }
  const opening = openDB<InterviewOsDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, tx) {
      // Migration ladder — each step runs once, in order.
      if (oldVersion < 1) {
        db.createObjectStore('progress', { keyPath: 'questionId' })
        db.createObjectStore('notes', { keyPath: 'questionId' })
        db.createObjectStore('activity', { keyPath: 'date' })
        db.createObjectStore('meta')
      }
      // if (oldVersion < 2) { ...future migration using `tx`... }
      void tx.objectStore('meta').put(DB_VERSION, 'schemaVersion')
    },
    blocking() {
      // A newer version was opened in another tab: release our connection so it can upgrade.
      dbClosed()
    },
    terminated() {
      onLost()
    },
  })

  let db: Db | null = null
  function dbClosed() {
    db?.close()
    onLost()
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      // If it opens late, don't leak the connection.
      opening.then((late) => late.close()).catch(() => {})
      reject(new Error('IndexedDB open timed out (blocked by another tab?)'))
    }, OPEN_TIMEOUT_MS)
  })
  try {
    db = await Promise.race([opening, timeout])
    return db
  } finally {
    clearTimeout(timer)
  }
}

export function createIdbAdapter(getDb: () => Promise<Db>): StorageAdapter {
  return {
    kind: 'indexeddb',
    async getAll<S extends RecordStoreName>(store: S) {
      const db = await getDb()
      return (await db.getAll(store)) as RecordStoreMap[S][]
    },
    async put<S extends RecordStoreName>(store: S, value: RecordStoreMap[S]) {
      const db = await getDb()
      await db.put(store, plain(value) as never)
    },
    async delete(store, key) {
      const db = await getDb()
      await db.delete(store, key)
    },
    async getMeta(key) {
      const db = await getDb()
      return db.get('meta', key)
    },
    async setMeta(key, value) {
      const db = await getDb()
      await db.put('meta', plain(value), key)
    },
    async writeBatch(input: WriteBatch) {
      const batch = { ...input, ...plain({ progress: input.progress, notes: input.notes, activity: input.activity, meta: input.meta }) }
      const db = await getDb()
      const tx = db.transaction(['progress', 'notes', 'activity', 'meta'], 'readwrite')
      const ops: Promise<unknown>[] = []
      for (const s of batch.clear ?? []) ops.push(tx.objectStore(s).clear())
      for (const r of batch.progress ?? []) ops.push(tx.objectStore('progress').put(r))
      for (const n of batch.notes ?? []) ops.push(tx.objectStore('notes').put(n))
      for (const a of batch.activity ?? []) ops.push(tx.objectStore('activity').put(a))
      for (const [k, v] of batch.meta ?? []) ops.push(tx.objectStore('meta').put(v, k))
      // A failed request aborts the whole transaction; tx.done rejects.
      await Promise.all([...ops, tx.done])
    },
  }
}

/**
 * IndexedDB's structured clone rejects Vue reactive Proxies (DataCloneError). Every stored value is
 * JSON-safe by contract, so a JSON round-trip strips any Proxy a caller may hand us.
 */
function plain<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T)
}
