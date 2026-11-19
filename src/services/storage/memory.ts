import type { MetaKey, RecordStoreMap, RecordStoreName, StorageAdapter, StoreName } from './types'

const keyOf: { [S in RecordStoreName]: (v: RecordStoreMap[S]) => string } = {
  progress: (v) => v.questionId,
  notes: (v) => v.questionId,
  activity: (v) => v.date,
}

/** Volatile fallback used when IndexedDB is unavailable. Lost on reload. */
export function createMemoryAdapter(): StorageAdapter {
  const stores: Record<StoreName, Map<string, unknown>> = {
    progress: new Map(),
    notes: new Map(),
    activity: new Map(),
    meta: new Map(),
  }
  // JSON round-trip: values may be Vue reactive Proxies, which structuredClone rejects. All records are JSON-safe.
  const clone = <T>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T))
  const putRecord = <S extends RecordStoreName>(store: S, value: RecordStoreMap[S]) => {
    stores[store].set(keyOf[store](value), clone(value))
  }
  return {
    kind: 'memory',
    async getAll<S extends RecordStoreName>(store: S) {
      return [...stores[store].values()].map((v) => clone(v)) as RecordStoreMap[S][]
    },
    async put(store, value) {
      putRecord(store, value)
    },
    async delete(store, key) {
      stores[store].delete(key)
    },
    async getMeta(key: MetaKey) {
      return clone(stores.meta.get(key))
    },
    async setMeta(key, value) {
      stores.meta.set(key, clone(value))
    },
    async writeBatch(batch) {
      for (const s of batch.clear ?? []) stores[s].clear()
      for (const r of batch.progress ?? []) putRecord('progress', r)
      for (const n of batch.notes ?? []) putRecord('notes', n)
      for (const a of batch.activity ?? []) putRecord('activity', a)
      for (const [k, v] of batch.meta ?? []) stores.meta.set(k, clone(v))
    },
  }
}
