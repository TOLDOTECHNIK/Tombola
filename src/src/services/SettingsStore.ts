import { reactive, toRaw } from 'vue'
import { createDefaultSettings } from '../core/defaults'
import { createId } from '../core/id'
import type { TombolaSettings } from '../core/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

const LEGACY_SETTING_KEYS = [
  'minimumNumberGap',
  'musicVolume',
  'showRandomNumbers',
  'odometerDuration',
  'lockSpinWithShift'
]

/**
 * Bridges the persisted settings (stored in the app data directory) with Vue
 * reactivity. Unknown/partial payloads are merged onto the defaults so older
 * config files keep working after upgrades.
 */
export class SettingsStore {
  readonly state = reactive<TombolaSettings>(createDefaultSettings())
  private persistTimer: ReturnType<typeof setTimeout> | null = null
  private loaded = false

  async init(): Promise<void> {
    const defaults = createDefaultSettings()
    try {
      const stored = await window.tombola.loadSettings()
      this.assign(migrate(stored, defaults))
    } catch {
      this.assign(defaults)
    }
    this.loaded = true
  }

  /** Apply a partial mutation and schedule a debounced persist. */
  update(mutator: (draft: TombolaSettings) => void): void {
    mutator(this.state)
    this.schedulePersist()
  }

  /** Replace the whole settings object. */
  replace(next: TombolaSettings): void {
    this.assign(next)
    this.schedulePersist()
  }

  reset(): void {
    this.assign(createDefaultSettings())
    this.schedulePersist()
  }

  /** Force an immediate write (used before closing). */
  async flush(): Promise<void> {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer)
      this.persistTimer = null
    }
    await window.tombola.saveSettings(this.snapshot())
  }

  snapshot(): TombolaSettings {
    return structuredClone(toRaw(this.state)) as TombolaSettings
  }

  get ready(): boolean {
    return this.loaded
  }

  private assign(next: TombolaSettings): void {
    Object.assign(this.state, next)
  }

  private schedulePersist(): void {
    if (!this.loaded) return
    if (this.persistTimer) clearTimeout(this.persistTimer)
    this.persistTimer = setTimeout(() => {
      void window.tombola.saveSettings(this.snapshot())
    }, 350)
  }
}

function migrate(stored: unknown, defaults: TombolaSettings): TombolaSettings {
  if (!isRecord(stored)) return defaults
  const merged = { ...defaults, ...(stored as Partial<TombolaSettings>) } as TombolaSettings

  for (const key of LEGACY_SETTING_KEYS) delete (merged as unknown as Record<string, unknown>)[key]

  merged.prizes = Array.isArray(merged.prizes)
    ? merged.prizes.map((prize) => ({
        id: prize?.id || createId('prize'),
        name: typeof prize?.name === 'string' ? prize.name : ''
      }))
    : defaults.prizes

  merged.reversePrizeOrder = Boolean(merged.reversePrizeOrder)

  merged.fixedPrizes = Array.isArray(merged.fixedPrizes)
    ? merged.fixedPrizes.map((fixed) => ({
        id: fixed?.id || createId('fixed'),
        position: Number(fixed?.position) || 1,
        number: Number(fixed?.number) || 0
      }))
    : defaults.fixedPrizes

  merged.numbers = Array.isArray(merged.numbers)
    ? merged.numbers.map((n) => Number(n)).filter((n) => Number.isFinite(n))
    : defaults.numbers

  merged.disabledNumbers = Array.isArray(merged.disabledNumbers)
    ? merged.disabledNumbers.map((n) => Number(n)).filter((n) => Number.isFinite(n))
    : defaults.disabledNumbers

  const storedRandom = isRecord(merged.random) ? merged.random : null
  const storedQuantity = storedRandom ? Number(storedRandom.quantity) : NaN
  merged.random = { quantity: Math.max(1, storedQuantity || defaults.random.quantity) }

  merged.customMusicPath =
    typeof merged.customMusicPath === 'string' ? merged.customMusicPath : null
  merged.customMusicName =
    typeof merged.customMusicName === 'string' ? merged.customMusicName : null

  return merged
}
