import { ref, watch } from 'vue'
import { AudioManager } from '../core/AudioManager'
import { MUSIC_VOLUME, ODOMETER_DURATION } from '../core/constants'
import { RandomNumberService } from '../core/RandomNumbers'
import { ThemeRegistry } from '../core/ThemeRegistry'
import { TombolaEngine } from '../core/TombolaEngine'
import type { NumberedPrize } from '../core/PrizeCatalog'
import type { Locale, TombolaSettings } from '../core/types'
import type { ThemeDefinition } from '../themes'
import type { ExportLabels } from '../export/template'
import { ExportService } from './ExportService'
import { SettingsStore } from './SettingsStore'

const MUSIC_URL = 'audio/music.mp3'
const ROLLING_URL = 'audio/spinning.mp3'

/**
 * Application service that owns the tombola domain objects, exposes them as Vue
 * refs and keeps the engine, audio and persisted settings in sync.
 */
export class TombolaService {
  readonly settings = new SettingsStore()
  readonly registry = new ThemeRegistry()

  readonly prize = ref<NumberedPrize | null>(null)
  readonly index = ref(0)
  readonly total = ref(0)
  readonly lastNumber = ref(999)
  readonly spinning = ref(false)
  readonly remaining = ref(0)
  readonly ready = ref(false)

  private engine: TombolaEngine
  private audio: AudioManager | null = null
  private structureKey = ''
  private musicObjectUrl: string | null = null
  /** Music only plays while the tombola is presented (run mode). */
  private live = false

  constructor() {
    this.engine = new TombolaEngine(this.settings.state)
    this.bindEngine()
    this.bindWatchers()
  }

  get theme(): ThemeDefinition {
    return this.registry.get(this.settings.state.themeId)
  }

  get stageStyle(): Record<string, string> {
    return this.registry.toCssVariables(this.theme)
  }

  get unique(): boolean {
    return this.settings.state.uniqueNumbers
  }

  get finished(): boolean {
    return this.unique && this.remaining.value <= 0
  }

  get prizeHeading(): string {
    const position = this.prize.value?.position ?? this.index.value + 1
    return `${position}. ${this.settings.state.prizeLabel}`
  }

  async init(): Promise<void> {
    await this.settings.init()
    this.structureKey = this.structureSignature()
    this.engine.applySettings(this.settings.snapshot())
    this.syncAudio()
    await this.applyCustomMusic()
    this.refresh()
    this.ready.value = true
  }

  spin(): void {
    // Ignore while the odometer is still rolling (locks new rolls).
    if (this.spinning.value) return
    if (this.finished) return
    const result = this.engine.spin()
    if (result) this.refresh()
  }

  next(): void {
    this.engine.next()
  }

  prev(): void {
    this.engine.prev()
  }

  reset(): void {
    this.engine.reset()
    this.refresh()
  }

  setLocale(locale: Locale): void {
    this.settings.update((draft) => {
      draft.locale = locale
    })
  }

  generateRandomNumbers(): number[] {
    // Ticket numbers are always generated in the 100–999 range.
    return new RandomNumberService({ quantity: this.settings.state.random.quantity }).generate()
  }

  numbersSnippet(numbers: number[]): string {
    return new RandomNumberService({ quantity: this.settings.state.random.quantity }).toNumbersSnippet(
      numbers
    )
  }

  /** Export the current tombola as a single self-contained HTML file. */
  async exportStandalone(labels: ExportLabels): Promise<string | null> {
    const exporter = new ExportService(labels)
    return exporter.exportStandalone(this.settings.snapshot(), this.theme)
  }

  toggleMusic(): void {
    this.settings.update((draft) => {
      draft.backgroundMusic = !draft.backgroundMusic
    })
  }

  /** Enter/leave presentation mode; background music only plays while live. */
  setLive(value: boolean): void {
    if (this.live === value) return
    this.live = value
    this.syncAudio()
  }

  /** Open a file dialog and use the chosen file as background music. */
  async chooseMusic(): Promise<void> {
    const file = await window.tombola.chooseMusic()
    if (!file) return
    this.settings.update((draft) => {
      draft.customMusicPath = file.path
      draft.customMusicName = file.name
      draft.backgroundMusic = true
    })
    this.setCustomMusicSource(file.data, file.name)
  }

  /** Remove the custom music and fall back to the bundled track. */
  async clearCustomMusic(): Promise<void> {
    this.settings.update((draft) => {
      draft.customMusicPath = null
      draft.customMusicName = null
    })
    await window.tombola.clearMusic()
    this.revokeMusicUrl()
    this.syncAudio()
    this.audio?.setMusicUrl(MUSIC_URL)
  }

  private async applyCustomMusic(): Promise<void> {
    const path = this.settings.state.customMusicPath
    if (!path) return
    const file = await window.tombola.loadMusic(path)
    if (!file) {
      this.settings.update((draft) => {
        draft.customMusicPath = null
        draft.customMusicName = null
      })
      return
    }
    this.setCustomMusicSource(file.data, file.name)
  }

  private setCustomMusicSource(data: Uint8Array, name: string): void {
    this.revokeMusicUrl()
    const blob = new Blob([data as BlobPart], { type: mimeForName(name) })
    this.musicObjectUrl = URL.createObjectURL(blob)
    this.syncAudio()
    this.audio?.setMusicUrl(this.musicObjectUrl)
  }

  private revokeMusicUrl(): void {
    if (this.musicObjectUrl) {
      URL.revokeObjectURL(this.musicObjectUrl)
      this.musicObjectUrl = null
    }
  }

  private bindEngine(): void {
    this.engine.on('spun', ({ number }) => {
      this.lastNumber.value = number
      this.spinning.value = true
      this.audio?.playRolling()
      this.audio?.duck(ODOMETER_DURATION)
    })
    this.engine.on('spinEnd', () => {
      this.spinning.value = false
    })
    this.engine.on('navigation', ({ index, total, prize }) => {
      this.index.value = index
      this.total.value = total
      this.prize.value = prize
    })
    this.engine.on('reset', () => this.refresh())
  }

  private bindWatchers(): void {
    watch(
      () => this.structureSignature(),
      (signature) => {
        if (signature === this.structureKey) return
        this.structureKey = signature
        this.engine.applySettings(this.settings.snapshot())
        this.refresh()
      }
    )

    watch(
      () => this.settings.state.backgroundMusic,
      () => this.syncAudio()
    )
  }

  private refresh(): void {
    this.index.value = this.engine.currentIndex
    this.total.value = this.engine.total
    this.prize.value = this.engine.currentPrize
    this.lastNumber.value = this.engine.lastNumber || this.lastNumber.value
    this.remaining.value = this.engine.remainingNumbers
    this.spinning.value = this.engine.isSpinning
  }

  private syncAudio(): void {
    const { backgroundMusic } = this.settings.state
    const enabled = backgroundMusic && this.live
    // The audio manager is always created so the rolling sound works even when
    // background music is disabled.
    if (!this.audio) {
      this.audio = new AudioManager({
        musicUrl: MUSIC_URL,
        rollingUrl: ROLLING_URL,
        musicVolume: MUSIC_VOLUME,
        musicEnabled: enabled
      })
    }
    this.audio.setMusicVolume(MUSIC_VOLUME)
    // Music is only played while in run mode, regardless of the setting.
    this.audio.setMusicEnabled(enabled)
  }

  private structureSignature(): string {
    const s = this.settings.state
    return JSON.stringify({
      prizes: s.prizes.map((p) => p.name),
      reverse: s.reversePrizeOrder,
      fixed: s.fixedPrizes.map((f) => [f.position, f.number]),
      numbers: s.numbers,
      disabled: s.disabledNumbers,
      unique: s.uniqueNumbers
    })
  }
}

let instance: TombolaService | null = null

/** Shared application service (singleton). */
export function useTombola(): TombolaService {
  if (!instance) instance = new TombolaService()
  return instance
}

function mimeForName(name: string): string {
  const extension = name.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    opus: 'audio/ogg',
    wav: 'audio/wav',
    flac: 'audio/flac'
  }
  return map[extension] ?? 'audio/mpeg'
}

export type { TombolaSettings }
