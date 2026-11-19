import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Note } from '@/types/progress'
import { describeStorageError, getAdapter, getStorageStatus, notesRepo } from '@/services/storage'
import { normalizeList, normalizeNote, newerByUpdatedAt } from '@/services/backup/validate'
import { useProgressStore } from './progress'

export const useNotesStore = defineStore('notes', () => {
  const ready = ref(false)
  const error = ref<string | null>(null)
  const notes = ref<Record<string, Note>>({})

  let initPromise: Promise<void> | null = null

  async function load(): Promise<void> {
    try {
      await getAdapter()
      const storageError = getStorageStatus().error
      const list = normalizeList(await notesRepo.all(), normalizeNote, (n) => n.questionId, newerByUpdatedAt).items
      notes.value = Object.fromEntries(list.map((n) => [n.questionId, n]))
      error.value = storageError
    } catch (e) {
      console.error('[notes] load failed', e)
      error.value = describeStorageError('load your notes', e)
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

  function get(id: string): Note | undefined {
    return notes.value[id]
  }

  /** Saves a note; an empty (whitespace-only) body removes it. No-op if unchanged. */
  async function save(id: string, body: string): Promise<void> {
    await init()
    if (body.trim() === '') return remove(id)
    const existing = notes.value[id]
    if (existing && existing.body === body) return
    const iso = new Date().toISOString()
    const note: Note = { questionId: id, body, createdAt: existing?.createdAt ?? iso, updatedAt: iso }
    notes.value[id] = note
    try {
      await notesRepo.put(note)
    } catch (e) {
      console.error('[notes] save failed', e)
      error.value = describeStorageError('save your note', e)
    }
    await useProgressStore().recordActivity('notesEdited')
  }

  async function remove(id: string): Promise<void> {
    await init()
    if (!notes.value[id]) return
    const { [id]: _removed, ...rest } = notes.value
    void _removed
    notes.value = rest
    try {
      await notesRepo.remove(id)
    } catch (e) {
      console.error('[notes] delete failed', e)
      error.value = describeStorageError('delete your note', e)
    }
  }

  const sorted = computed<Note[]>(() =>
    Object.values(notes.value).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
  )

  return { ready, error, notes, init, reload, get, save, remove, sorted }
})
