/**
 * Backup / restore of all user data as a versioned JSON file.
 * Format contract: `BackupFile` in src/types/progress.ts.
 */
import { todayKey } from 'rei-kit'
import { allQuestionIds } from '@/content'
import type { ActivityDay, BackupFile, Note, ProgressRecord, RestoreMode } from '@/types/progress'
import { activityRepo, clearAllData, metaRepo, notesRepo, progressRepo, writeBatch } from '@/services/storage'
import { reloadStores, useNotesStore, useProgressStore, useSessionStore, useSettingsStore } from '@/stores'
import {
  isIso,
  isObj,
  newerByUpdatedAt,
  normalizeActivityDay,
  normalizeList,
  normalizeNote,
  normalizeProgressRecord,
  normalizeSession,
  normalizeSettings,
} from './validate'

export const BACKUP_APP = 'interview-os'
/** Current backup format. Bump together with a `migrations` entry. */
export const BACKUP_SCHEMA_VERSION = 1
/** Refuse absurdly large files before JSON.parse (50 MB). */
const MAX_BACKUP_BYTES = 50 * 1024 * 1024

/**
 * migrations[n] upgrades a raw backup object from schemaVersion n to n + 1.
 * Never edit an existing entry; add a new one when bumping BACKUP_SCHEMA_VERSION.
 */
const migrations: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {
  // 1: (raw) => ({ ...raw, schemaVersion: 2, /* transform fields */ }),
}

export interface BackupSummary {
  progress: number
  notes: number
  activity: number
  /** records dropped because they were invalid or duplicated */
  skipped: { progress: number; notes: number; activity: number }
  /** valid records whose question id is not in the current curriculum (kept) */
  unknownQuestions: number
}

export type ParseResult = { ok: true; data: BackupFile; summary: BackupSummary } | { ok: false; error: string }

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export async function createBackup(): Promise<BackupFile> {
  const progress = useProgressStore()
  const notes = useNotesStore()
  const settings = useSettingsStore()
  const session = useSessionStore()
  await Promise.all([progress.init(), notes.init(), settings.init(), session.init()])
  // Export in-memory state: it is what the user sees, even if a write failed.
  // JSON round-trip, not structuredClone: store state is reactive Proxies, which structuredClone rejects.
  return jsonClone({
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    progress: Object.values(progress.records),
    notes: Object.values(notes.notes),
    activity: Object.values(progress.activity).sort((a, b) => a.date.localeCompare(b.date)),
    settings: { ...settings.settings },
    session: session.session,
  }) as BackupFile
}

/**
 * Like rei-kit's `downloadJson`, but the object URL is revoked after the browser has
 * started the download. Revoking in the same tick as `click()` can cancel the download
 * in some browsers (observed in headless Chromium), which would silently lose a backup.
 */
function saveJsonFile(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

export async function downloadBackup(): Promise<void> {
  const data = await createBackup()
  saveJsonFile(data, `interview-os-backup-${todayKey()}.json`)
  await useSettingsStore().update({ lastBackupAt: new Date().toISOString() })
}

export function parseBackup(text: string): ParseResult {
  if (typeof text !== 'string' || text.trim() === '') return { ok: false, error: 'The file is empty.' }
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, error: 'The file is too large to be an Interview OS backup.' }

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch (e) {
    const detail = e instanceof Error ? ` (${e.message})` : ''
    return { ok: false, error: `The file is not valid JSON${detail}.` }
  }
  if (!isObj(raw)) return { ok: false, error: 'The file does not contain a backup object.' }
  if (raw.app !== BACKUP_APP) return { ok: false, error: 'This is not an Interview OS backup file.' }

  const version = raw.schemaVersion
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return { ok: false, error: 'The backup has a missing or invalid schemaVersion.' }
  }
  if (version > BACKUP_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `This backup was made by a newer version of Interview OS (format v${version}; this app supports up to v${BACKUP_SCHEMA_VERSION}). Update the app and try again.`,
    }
  }

  let obj: Record<string, unknown> = raw
  for (let v = version; v < BACKUP_SCHEMA_VERSION; v++) {
    const migrate = migrations[v]
    if (!migrate) return { ok: false, error: `No migration available for backup format v${v}.` }
    try {
      obj = migrate(obj)
    } catch {
      return { ok: false, error: `Could not upgrade backup from format v${v}.` }
    }
  }

  for (const key of ['progress', 'notes'] as const) {
    if (!Array.isArray(obj[key])) return { ok: false, error: `The backup's "${key}" section is missing or not a list.` }
  }
  if (obj.activity !== undefined && !Array.isArray(obj.activity)) {
    return { ok: false, error: `The backup's "activity" section is not a list.` }
  }
  if (obj.settings !== undefined && !isObj(obj.settings)) {
    return { ok: false, error: `The backup's "settings" section is not an object.` }
  }

  const progress = normalizeList(obj.progress as unknown[], normalizeProgressRecord, (r) => r.questionId, newerByUpdatedAt)
  const notes = normalizeList(obj.notes as unknown[], normalizeNote, (n) => n.questionId, newerByUpdatedAt)
  const activity = normalizeList((obj.activity ?? []) as unknown[], normalizeActivityDay, (d) => d.date)

  const known = new Set<string>(allQuestionIds)
  const unknownQuestions = known.size
    ? new Set([...progress.items, ...notes.items].map((r) => r.questionId).filter((id) => !known.has(id))).size
    : 0

  const data: BackupFile = {
    app: BACKUP_APP,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: isIso(obj.exportedAt) ? obj.exportedAt : new Date(0).toISOString(),
    progress: progress.items,
    notes: notes.items,
    activity: activity.items,
    settings: normalizeSettings(obj.settings),
    session: normalizeSession(obj.session),
  }
  return {
    ok: true,
    data,
    summary: {
      progress: progress.items.length,
      notes: notes.items.length,
      activity: activity.items.length,
      skipped: { progress: progress.dropped, notes: notes.dropped, activity: activity.dropped },
      unknownQuestions,
    },
  }
}

/**
 * merge: per record keep whichever side has the newer `updatedAt`; activity days take
 *        the max of each counter; local settings are kept (lastBackupAt = newest).
 * replace: wipe all stores and write the backup, in a single transaction.
 * Stores are re-initialised afterwards.
 */
export async function restoreBackup(input: BackupFile, mode: RestoreMode): Promise<void> {
  // Callers often hold the parsed backup in a ref; IndexedDB cannot clone reactive Proxies.
  const data = jsonClone(input)
  if (mode === 'replace') {
    await writeBatch({
      clear: ['progress', 'notes', 'activity'],
      progress: data.progress,
      notes: data.notes,
      activity: data.activity,
      meta: [
        ['settings', normalizeSettings(data.settings)],
        ['session', data.session ?? null],
      ],
    })
  } else {
    const [curProgress, curNotes, curActivity, curSettingsRaw, curSessionRaw] = await Promise.all([
      progressRepo.all(),
      notesRepo.all(),
      activityRepo.all(),
      metaRepo.get('settings'),
      metaRepo.get('session'),
    ])
    const curSession = normalizeSession(curSessionRaw)
    const incomingSession = data.session ?? null
    const session =
      incomingSession && (!curSession || newerByUpdatedAt(incomingSession, curSession)) ? incomingSession : curSession
    const progress = mergeNewer<ProgressRecord>(curProgress, data.progress, (r) => r.questionId)
    const notes = mergeNewer<Note>(curNotes, data.notes, (n) => n.questionId)
    const days = new Map<string, ActivityDay>(curActivity.map((d) => [d.date, d]))
    const activity: ActivityDay[] = []
    for (const d of data.activity) {
      const cur = days.get(d.date)
      activity.push(
        cur
          ? {
              date: d.date,
              reviewed: Math.max(cur.reviewed, d.reviewed),
              mastered: Math.max(cur.mastered, d.mastered),
              notesEdited: Math.max(cur.notesEdited, d.notesEdited),
            }
          : d,
      )
    }
    const curSettings = normalizeSettings(curSettingsRaw)
    const lastBackupAt = newestIso(curSettings.lastBackupAt, data.settings.lastBackupAt)
    await writeBatch({
      progress,
      notes,
      activity,
      meta: [
        ['settings', { ...curSettings, lastBackupAt }],
        ['session', session],
      ],
    })
  }
  await reloadStores()
}

/** Deletes all progress, notes, activity and settings, then reloads the stores. */
export async function resetAllData(): Promise<void> {
  await clearAllData()
  await reloadStores()
}

// ---- helpers ---------------------------------------------------------------

/** Returns the incoming records that should be written (newer than, or absent from, current). */
function mergeNewer<T extends { updatedAt: string }>(current: T[], incoming: T[], keyOf: (r: T) => string): T[] {
  const cur = new Map(current.map((r) => [keyOf(r), r]))
  return incoming.filter((r) => {
    const existing = cur.get(keyOf(r))
    return !existing || newerByUpdatedAt(r, existing)
  })
}

function newestIso(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return Date.parse(a) >= Date.parse(b) ? a : b
}
