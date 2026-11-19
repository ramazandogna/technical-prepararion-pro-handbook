<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  BaseAlert,
  BaseButton,
  BaseSelect,
  BaseSwitch,
  FileDrop,
  MATERIALS,
  PALETTES,
  SegmentedControl,
  SettingsGroup,
  SettingsRow,
  VERSION,
  formatDate,
  useMaterial,
  usePalette,
  useTheme,
  useToast,
  type Material,
  type ThemePreference,
} from 'rei-kit'
import { ResponsiveDialog } from 'rei-kit/web'
import {
  Archive,
  Check,
  Download,
  HardDrive,
  Info,
  Lightbulb,
  NotebookPen,
  Target,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import type { BackupFile, RestoreMode } from '@/types/progress'
import { useSettingsStore } from '@/stores/settings'
import { downloadBackup, parseBackup, resetAllData, restoreBackup, type BackupSummary } from '@/services/backup'
import PageTitle from '@/components/common/PageTitle.vue'

const APP_VERSION = '0.1.0-alpha'

const router = useRouter()
const toast = useToast()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

// ---- Appearance (rei-kit, localStorage) ----
const theme = useTheme()
const material = useMaterial()
const palette = usePalette()

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]
const materialOptions = MATERIALS.map((m) => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))

// ---- Learning ----
const goalOptions = [3, 5, 8, 10, 15, 20, 30].map((n) => ({ value: n, label: `${n} questions a day` }))

function setGoal(v: number | undefined) {
  if (v) void settingsStore.update({ dailyGoal: v })
}

// ---- Storage ----
const storageText = ref('Checking…')
const persisted = ref<boolean | null>(null)

async function refreshStorage() {
  try {
    if (!navigator.storage?.estimate) {
      storageText.value = 'IndexedDB (usage unknown in this browser)'
      return
    }
    const [{ usage = 0, quota = 0 }, isPersisted] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted?.() ?? Promise.resolve(false),
    ])
    persisted.value = isPersisted
    const mb = (n: number) => `${(n / 1024 / 1024).toFixed(n < 1024 * 1024 ? 2 : 1)} MB`
    if (settingsStore.storageMode === 'memory') {
      storageText.value = 'Not saving: storage is blocked, so changes are lost on reload. Export a backup.'
      return
    }
    storageText.value = `IndexedDB · ${mb(usage)} used of ${mb(quota)} · ${isPersisted ? 'persistent' : 'may be cleared by the browser under storage pressure'}`
  } catch {
    storageText.value = 'IndexedDB (status unavailable)'
  }
}

async function requestPersist() {
  const ok = (await navigator.storage?.persist?.()) ?? false
  if (ok) toast.success('Storage is now persistent')
  else toast.warning('The browser declined. Regular backups keep your data safe.')
  await refreshStorage()
}

onMounted(refreshStorage)

const lastBackup = computed(() =>
  settings.value.lastBackupAt
    ? formatDate(new Date(settings.value.lastBackupAt), { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Never',
)

// ---- Export ----
const exporting = ref(false)
async function exportBackup() {
  exporting.value = true
  try {
    await downloadBackup()
    toast.success('Backup downloaded')
  } catch (e) {
    toast.danger(`Export failed: ${e instanceof Error ? e.message : String(e)}`, { duration: 0 })
  } finally {
    exporting.value = false
  }
}

// ---- Import ----
const files = ref<File[]>([])
const importError = ref<string | null>(null)
const pending = ref<{ data: BackupFile; summary: BackupSummary } | null>(null)
const importOpen = ref(false)
const restoreMode = ref<RestoreMode>('merge')
const restoring = ref(false)
const restoreOptions: { value: RestoreMode; label: string }[] = [
  { value: 'merge', label: 'Merge' },
  { value: 'replace', label: 'Replace' },
]

watch(files, async (list) => {
  const file = list[0]
  if (!file) return
  importError.value = null
  try {
    const result = parseBackup(await file.text())
    if (result.ok) {
      pending.value = { data: result.data, summary: result.summary }
      restoreMode.value = 'merge'
      importOpen.value = true
    } else {
      importError.value = result.error
    }
  } catch (e) {
    importError.value = e instanceof Error ? e.message : 'Could not read the file.'
  } finally {
    files.value = []
  }
})

const exportedAt = computed(() =>
  pending.value ? formatDate(new Date(pending.value.data.exportedAt), { year: 'numeric', month: 'short', day: 'numeric' }) : '',
)

const skippedCount = computed(() => {
  const s = pending.value?.summary.skipped
  return s ? s.progress + s.notes + s.activity : 0
})

async function confirmRestore() {
  if (!pending.value) return
  restoring.value = true
  try {
    await restoreBackup(pending.value.data, restoreMode.value)
    toast.success(restoreMode.value === 'merge' ? 'Backup merged' : 'Backup restored')
    importOpen.value = false
    pending.value = null
  } catch (e) {
    toast.danger(`Restore failed: ${e instanceof Error ? e.message : String(e)}`, { duration: 0 })
  } finally {
    restoring.value = false
  }
}

// ---- Reset ----
const resetOpen = ref(false)
const resetting = ref(false)
async function confirmReset() {
  resetting.value = true
  try {
    await resetAllData()
    toast.success('All progress, notes and settings were reset')
    resetOpen.value = false
  } catch (e) {
    toast.danger(`Reset failed: ${e instanceof Error ? e.message : String(e)}`, { duration: 0 })
  } finally {
    resetting.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6">
    <PageTitle title="Settings" description="Appearance, learning preferences and your local data." />

    <SettingsGroup title="More" class="lg:hidden">
      <SettingsRow label="Notes" description="Everything you have written" :icon="NotebookPen" interactive @click="router.push('/notes')" />
      <SettingsRow label="About" description="Research, interview stages and sources" :icon="Info" interactive @click="router.push('/about')" />
    </SettingsGroup>

    <SettingsGroup title="Appearance">
      <SettingsRow label="Theme" stacked>
        <SegmentedControl v-model="theme" :options="themeOptions" />
      </SettingsRow>
      <SettingsRow label="Material" description="How surfaces look: borders, depth, translucency" stacked>
        <SegmentedControl :model-value="material" :options="materialOptions" @update:model-value="(v: Material) => (material = v)" />
      </SettingsRow>
      <SettingsRow label="Palette" stacked>
        <div role="radiogroup" aria-label="Palette" class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            v-for="p in PALETTES"
            :key="p.name"
            type="button"
            role="radio"
            :aria-checked="palette === p.name"
            class="border-hair focus-ring flex items-center gap-2 rounded-card border px-3 py-2 text-left text-sm transition-colors"
            :class="palette === p.name ? 'border-primary bg-primary/10 text-ink' : 'text-ink-soft hover:bg-muted'"
            @click="palette = p.name"
          >
            <span class="flex shrink-0 -space-x-1" aria-hidden="true">
              <span
                v-for="(c, i) in p.swatch"
                :key="i"
                class="ring-surface size-3.5 rounded-full ring-2"
                :style="{ backgroundColor: c }"
              />
            </span>
            <span class="min-w-0 flex-1 truncate">{{ p.label }}</span>
            <Check v-if="palette === p.name" class="text-primary size-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </SettingsRow>
    </SettingsGroup>

    <SettingsGroup title="Learning">
      <SettingsRow label="Daily goal" description="Questions reviewed per day" :icon="Target">
        <BaseSelect
          label="Daily goal"
          label-hidden
          size="sm"
          :options="goalOptions"
          :model-value="settings.dailyGoal"
          @update:model-value="setGoal"
        />
      </SettingsRow>
      <SettingsRow label="Personal angle tips" description="Show how each answer connects to your own experience" :icon="Lightbulb">
        <BaseSwitch
          label="Show personal angle tips"
          label-hidden
          :model-value="settings.showPersonalAngle"
          @update:model-value="(v) => settingsStore.update({ showPersonalAngle: v })"
        />
      </SettingsRow>
      <SettingsRow
        v-if="settings.onboardingDismissed"
        label="Show introduction again"
        description="The how-it-works card on the dashboard"
        interactive
        @click="settingsStore.update({ onboardingDismissed: false })"
      />
    </SettingsGroup>

    <SettingsGroup title="Your data">
      <SettingsRow label="Storage" :description="storageText" :icon="HardDrive">
        <BaseButton v-if="persisted === false" size="sm" variant="secondary" @click="requestPersist">Make persistent</BaseButton>
      </SettingsRow>
      <SettingsRow label="Export backup" :description="`Last backup: ${lastBackup}`" :icon="Download">
        <BaseButton size="sm" :loading="exporting" @click="exportBackup">Export</BaseButton>
      </SettingsRow>
      <SettingsRow label="Import backup" description="Restore progress and notes from a .json backup" :icon="Upload" stacked>
        <FileDrop
          v-model="files"
          label="Backup file"
          hint="Drop an Interview OS backup (.json) here"
          browse-label="Choose file"
          remove-label="Remove file"
          accept="application/json,.json"
          :max-size="20 * 1024 * 1024"
          too-large-label="That file is too large to be a backup."
        />
        <BaseAlert v-if="importError" tone="danger" class="mt-3">
          <template #title>That file could not be imported</template>
          {{ importError }}
        </BaseAlert>
      </SettingsRow>
      <SettingsRow label="Reset all data" description="Delete progress, notes, activity and settings" :icon="Trash2">
        <BaseButton size="sm" variant="danger" @click="resetOpen = true">Reset…</BaseButton>
      </SettingsRow>
    </SettingsGroup>

    <SettingsGroup title="About">
      <SettingsRow label="Interview OS" :description="`Version ${APP_VERSION} · rei-kit ${VERSION}`" :icon="Archive" />
      <SettingsRow label="Privacy" description="No account, no server, no tracking. Everything is stored in this browser." :icon="HardDrive" />
      <SettingsRow label="Research & methodology" :icon="Info" interactive @click="router.push('/about')" />
    </SettingsGroup>

    <ResponsiveDialog
      v-model="importOpen"
      title="Import backup"
      :subtitle="pending ? `Exported ${exportedAt}` : undefined"
      close-label="Cancel import"
    >
      <div v-if="pending" class="flex flex-col gap-4 text-sm">
        <p class="text-ink">
          This backup contains <strong class="tabular-nums">{{ pending.summary.progress }}</strong> progress records,
          <strong class="tabular-nums">{{ pending.summary.notes }}</strong> notes and
          <strong class="tabular-nums">{{ pending.summary.activity }}</strong> days of activity.
        </p>
        <p v-if="pending.summary.unknownQuestions > 0" class="text-ink-soft">
          {{ pending.summary.unknownQuestions }} records refer to questions not in this version of the curriculum; they are kept.
        </p>
        <p v-if="skippedCount > 0" class="text-ink-soft">{{ skippedCount }} invalid or duplicate records will be skipped.</p>
        <div role="group" aria-label="Import mode" class="flex flex-col gap-2">
          <SegmentedControl v-model="restoreMode" :options="restoreOptions" />
          <p class="text-ink-soft">
            <template v-if="restoreMode === 'merge'">
              Keeps your current data and adds the backup.
            </template>
            <template v-else>Deletes everything here first, then restores the backup exactly.</template>
          </p>
        </div>
        <BaseAlert v-if="restoreMode === 'replace'" tone="warning">
          Your current progress and notes will be replaced. Export a backup first if unsure.
        </BaseAlert>
      </div>
      <template #actions>
        <BaseButton variant="ghost" @click="importOpen = false">Cancel</BaseButton>
        <BaseButton :variant="restoreMode === 'replace' ? 'danger' : 'primary'" :loading="restoring" @click="confirmRestore">
          {{ restoreMode === 'merge' ? 'Merge backup' : 'Replace my data' }}
        </BaseButton>
      </template>
    </ResponsiveDialog>

    <ResponsiveDialog v-model="resetOpen" title="Reset all data?" tone="alert" close-label="Cancel reset">
      <p class="text-ink text-sm">
        This permanently deletes all progress, notes, activity history and learning settings in this browser. It cannot be undone.
      </p>
      <template #actions>
        <BaseButton variant="ghost" @click="resetOpen = false">Cancel</BaseButton>
        <BaseButton variant="danger" :loading="resetting" @click="confirmReset">Delete everything</BaseButton>
      </template>
    </ResponsiveDialog>
  </div>
</template>
