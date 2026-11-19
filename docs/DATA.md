# Data & Persistence

All user data stays on the user's device. There is no account, server or sync. Content (questions, answers) is bundled TypeScript; only **progress, notes, activity and settings** are stored.

## Where data lives

| Thing | Where | Notes |
| --- | --- | --- |
| Progress, notes, activity, settings | IndexedDB database `interview-os` | via `idb`, `src/services/storage/` |
| Theme / material / palette | `localStorage` keys `ios-theme`, `ios-material`, `ios-palette` | rei-kit; not included in backups |

If IndexedDB cannot be opened (some private-browsing modes, storage disabled, blocked by an old tab during an upgrade for > 5 s), the app falls back to an **in-memory store**: everything works but is lost when the tab closes. Every store's `error` is set to `STORAGE_UNAVAILABLE_MESSAGE` so the UI can warn, and `useSettingsStore().storageMode === 'memory'`.

On startup the app asks once for persistent storage (`navigator.storage.persist()`), best-effort. The result is `useSettingsStore().persisted` (`true` / `false` / `null` = unsupported). Persistent storage makes the browser much less likely to evict the data under storage pressure.

## Schema (IndexedDB v1)

| Object store | Key | Value |
| --- | --- | --- |
| `progress` | `questionId` (in-line) | `ProgressRecord` |
| `notes` | `questionId` (in-line) | `Note` |
| `activity` | `date` (in-line, `YYYY-MM-DD` local time) | `ActivityDay` |
| `meta` | out-of-line string | `settings` → `AppSettings`, `schemaVersion` → number |

Types: `src/types/progress.ts`. Records reference content only by the permanent `Question.id`. Records for ids no longer in the curriculum are kept (harmless) but ignored by `dueIds`, `counts` and `trackStats`.

Data read from IndexedDB is validated with the same normalizers used for backup import (`src/services/backup/validate.ts`), so a corrupt record is skipped rather than crashing the app.

### Spaced review (SM-2-lite)

`src/services/progress/index.ts` — pure `schedule(record, grade, now)`:

| Grade | Interval (days) | Ease | Confidence |
| --- | --- | --- | --- |
| again | 0 (due again in 10 min) | −0.2 | 1 |
| hard | max(1, i × 1.2) | −0.15 | 2 |
| good | 1 → 3 → i × ease | — | 4 |
| easy | max(1, i) × ease × 1.3 | +0.15 | 5 |

Ease starts at 2.5, minimum 1.3; intervals capped at 365 days. Status: `mastered` at interval ≥ 21 days, `reviewing` at ≥ 1 day after a pass, otherwise `learning`. Revealing a hint/answer moves a `new` question to `learning`.

## Writes and errors

Store actions update in-memory state first (optimistic), then persist. A failed write is caught, logged to the console and surfaced in the store's `error` (e.g. "Could not save your progress: browser storage is full…"). The in-memory state is kept so the session continues; the user should export a backup.

## Backup & restore

Settings → Backup uses `src/services/backup/index.ts`.

- **Export** (`downloadBackup`) writes `interview-os-backup-YYYY-MM-DD.json` and sets `settings.lastBackupAt`.
- **Format** (`BackupFile`): `{ app: "interview-os", schemaVersion: 1, exportedAt, progress[], notes[], activity[], settings }`.
- **Import** (`parseBackup`) validates by hand: JSON syntax, `app`, `schemaVersion` (rejects files from a newer app version, migrates older ones), section shapes and every field of every record. Invalid or duplicate records are dropped and counted in `summary.skipped`; unknown extra fields are stripped. Records for unknown question ids are kept and counted in `summary.unknownQuestions`.
- **Restore** (`restoreBackup(data, mode)`):
  - `merge` — per record, the side with the newer `updatedAt` wins; activity days take the max of each counter; local settings are kept.
  - `replace` — clears progress/notes/activity and writes the backup and its settings in **one IndexedDB transaction** (all-or-nothing).
  - Stores are reloaded afterwards.
- **Reset** (`resetAllData`) deletes everything (progress, notes, activity, settings) and reloads the stores. Appearance in `localStorage` is untouched.

## Migration procedure

**IndexedDB schema** (`src/services/storage/db.ts`):

1. Bump `DB_VERSION`.
2. Add a new `if (oldVersion < N) { … }` step at the end of the `upgrade()` ladder. Never edit or reorder previous steps; use the provided `tx` for data transforms.
3. Update `src/types/progress.ts`, the normalizers in `services/backup/validate.ts`, and this document.
4. Other open tabs on the old version are asked to close their connection (`blocking`); if one does not, the new tab falls back to memory after 5 s and shows the warning.

**Backup format** (`src/services/backup/index.ts`):

1. Bump `BACKUP_SCHEMA_VERSION`.
2. Add `migrations[oldVersion] = (raw) => upgradedRaw` (one step per version). Old backups are upgraded step by step before validation.
3. Older app versions refuse newer backups with a clear message.

## Data-loss caveats

- **Clearing site data** (browser settings, "clear cookies and site data", some privacy extensions) deletes everything. Export backups regularly; the dashboard can nudge based on `lastBackupAt`.
- **Per origin**: production, each Vercel preview URL and `localhost:5173` have **separate** databases. Data does not follow you between them — use export/import.
- **Per browser / device / profile**: there is no sync.
- **Private / incognito windows**: data is discarded when the window closes (or never stored, in memory-fallback mode).
- **Eviction**: without persistent storage, browsers (notably Safari after ~7 days without a visit) may evict site data.
- Theme preferences are not part of backups.
