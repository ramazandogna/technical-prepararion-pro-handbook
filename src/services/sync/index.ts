/**
 * Code-based cloud copy of all user data, no account and no backend of our own.
 *
 * - The learner picks a personal sync code. From it we derive (Web Crypto):
 *     slot id = SHA-256("interview-os/slot/v1:" + code)   → where the copy lives
 *     key     = PBKDF2(code, app salt, 210k, SHA-256)      → AES-GCM-256 encryption key
 * - The backup JSON (same format as Settings → Export) is encrypted in the browser and stored at
 *   textdb.dev/api/data/<slot>, a free public key-value text store. The service only ever sees
 *   ciphertext; without the code the copy is unreadable.
 * - Same code on any device → same slot → same data. A different code → a different, empty slot.
 *
 * Trade-off: textdb.dev is a third-party free service with no SLA. IndexedDB stays the primary
 * store and JSON export keeps working, so an outage never loses local progress.
 */
import type { BackupFile } from '@/types/progress'

const ENDPOINT = 'https://textdb.dev/api/data/'
const SALT = new TextEncoder().encode('interview-os/sync/v1')
const ITERATIONS = 210_000
export const MIN_CODE_LENGTH = 6

interface Envelope {
  app: 'interview-os-sync'
  v: 1
  iv: string
  ct: string
}

export interface SyncKeys {
  slot: string
  key: CryptoKey
}

const enc = new TextEncoder()
const toHex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

export function normalizeCode(code: string): string {
  return code.trim()
}

export async function deriveKeys(rawCode: string): Promise<SyncKeys> {
  const code = normalizeCode(rawCode)
  if (code.length < MIN_CODE_LENGTH) throw new Error(`The code needs at least ${MIN_CODE_LENGTH} characters.`)
  const slot = toHex(await crypto.subtle.digest('SHA-256', enc.encode(`interview-os/slot/v1:${code}`)))
  const material = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
  return { slot, key }
}

async function request(url: string, init?: RequestInit): Promise<Response> {
  let res: Response
  try {
    res = await fetch(url, { ...init, cache: 'no-store' })
  } catch {
    throw new Error('Cloud sync is unreachable (offline?). Your progress is still saved on this device.')
  }
  if (!res.ok) throw new Error(`Cloud sync failed (HTTP ${res.status}). Your progress is still saved on this device.`)
  return res
}

/** Returns the stored backup JSON text, or null when nothing is stored for this code yet. */
export async function pull(keys: SyncKeys): Promise<string | null> {
  const text = (await (await request(ENDPOINT + keys.slot)).text()).trim()
  if (!text) return null
  let env: Envelope
  try {
    env = JSON.parse(text) as Envelope
  } catch {
    throw new Error('The cloud copy for this code is unreadable.')
  }
  if (env.app !== 'interview-os-sync' || env.v !== 1) throw new Error('The cloud copy for this code is not an Interview OS copy.')
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(env.iv) }, keys.key, fromB64(env.ct))
    return new TextDecoder().decode(plain)
  } catch {
    throw new Error('The cloud copy for this code could not be decrypted.')
  }
}

export async function push(keys: SyncKeys, backup: BackupFile): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, keys.key, enc.encode(JSON.stringify(backup)))
  const env: Envelope = { app: 'interview-os-sync', v: 1, iv: toB64(iv.buffer), ct: toB64(ct) }
  await request(ENDPOINT + keys.slot, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(env),
  })
}
