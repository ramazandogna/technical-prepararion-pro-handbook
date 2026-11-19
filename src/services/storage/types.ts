import type { ActivityDay, Note, ProgressRecord } from '@/types/progress'

/** Object stores keyed in-line by a field of the value. */
export interface RecordStoreMap {
  progress: ProgressRecord
  notes: Note
  activity: ActivityDay
}
export type RecordStoreName = keyof RecordStoreMap
export type StoreName = RecordStoreName | 'meta'

/** Keys used in the out-of-line `meta` key-value store. */
export type MetaKey = 'settings' | 'schemaVersion'

/** A multi-store write applied atomically (one IndexedDB transaction). */
export interface WriteBatch {
  /** stores cleared before any put */
  clear?: StoreName[]
  progress?: ProgressRecord[]
  notes?: Note[]
  activity?: ActivityDay[]
  meta?: Array<[MetaKey, unknown]>
}

export interface StorageAdapter {
  readonly kind: 'indexeddb' | 'memory'
  getAll<S extends RecordStoreName>(store: S): Promise<RecordStoreMap[S][]>
  put<S extends RecordStoreName>(store: S, value: RecordStoreMap[S]): Promise<void>
  delete(store: RecordStoreName, key: string): Promise<void>
  getMeta(key: MetaKey): Promise<unknown>
  setMeta(key: MetaKey, value: unknown): Promise<void>
  writeBatch(batch: WriteBatch): Promise<void>
}

export interface StorageStatus {
  mode: 'indexeddb' | 'memory'
  /** result of navigator.storage.persist(); null = unsupported / not requested */
  persisted: boolean | null
  /** set when running on the in-memory fallback */
  error: string | null
}
