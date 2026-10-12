import { MINIMUM_NUMBER_GAP, ODOMETER_DURATION } from './constants'
import { Emitter } from './Emitter'
import { NumberPool } from './NumberPool'
import type { DrawResult } from './NumberPool'
import { PrizeCatalog } from './PrizeCatalog'
import type { NumberedPrize } from './PrizeCatalog'
import type { Prize, TombolaSettings } from './types'

/**
 * Orchestrates a tombola session: the draw sequence, prize navigation and the
 * spin state machine. Framework agnostic - the Vue layer subscribes to events.
 */
export class TombolaEngine extends Emitter {
  private pool: NumberPool
  private catalog: PrizeCatalog
  private index = 0
  private position = 0
  private spinning = false
  private spinTimer: ReturnType<typeof setTimeout> | null = null

  constructor(settings: TombolaSettings) {
    super()
    this.catalog = new PrizeCatalog(settings.prizes, settings.reversePrizeOrder)
    this.pool = this.createPool(settings)
  }

  get isSpinning(): boolean {
    return this.spinning
  }

  get currentIndex(): number {
    return this.index
  }

  get total(): number {
    return this.catalog.size
  }

  get drawPosition(): number {
    return this.position
  }

  get currentPrize(): NumberedPrize | null {
    return this.catalog.at(this.index)
  }

  get prizes(): NumberedPrize[] {
    return this.catalog.list()
  }

  get remainingNumbers(): number {
    return this.pool.remainingCount
  }

  get lastNumber(): number {
    return this.pool.last
  }

  /** Replace the settings and rebuild the derived state (resets the session). */
  applySettings(settings: TombolaSettings): void {
    this.catalog = new PrizeCatalog(settings.prizes, settings.reversePrizeOrder)
    this.pool = this.createPool(settings)
    this.index = 0
    this.position = 0
    this.cancelSpin()
    this.emit('settings', { settings })
    this.emitNavigation()
  }

  next(): void {
    const total = this.catalog.size
    if (total === 0) return
    this.index = (this.index + 1) % total
    this.emitNavigation()
  }

  prev(): void {
    const total = this.catalog.size
    if (total === 0) return
    this.index = (this.index - 1 + total) % total
    this.emitNavigation()
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.catalog.size) return
    this.index = index
    this.emitNavigation()
  }

  spin(): DrawResult | null {
    if (this.spinning) return null
    const nextPosition = this.position + 1
    // Fixed prizes are keyed by the prize number shown to the audience
    // (e.g. fixedPrizes position 4 = "4. Preis"), not by the draw counter.
    const result = this.pool.draw(this.currentPrize?.position ?? nextPosition)
    if (!result) return null

    this.position = nextPosition
    this.spinning = true
    this.emit('spun', { number: result.number, position: nextPosition })

    // Lock further rolls for the duration of the odometer plus a short buffer,
    // matching the original app's 8.5s wait (7s odometer + 1.5s).
    const lockDuration = Math.max(500, ODOMETER_DURATION) + 1500
    this.spinTimer = setTimeout(() => {
      this.spinning = false
      this.spinTimer = null
      this.emit('spinEnd', {})
    }, lockDuration)

    return result
  }

  reset(): void {
    this.pool.reset()
    this.index = 0
    this.position = 0
    this.cancelSpin()
    this.emit('reset', {})
    this.emitNavigation()
  }

  dispose(): void {
    this.cancelSpin()
    this.clearListeners()
  }

  private createPool(settings: TombolaSettings): NumberPool {
    const disabled = new Set(settings.disabledNumbers)
    const enabled = settings.numbers.filter((value) => !disabled.has(value))
    return new NumberPool({
      numbers: enabled,
      fixedPrizes: settings.fixedPrizes,
      unique: settings.uniqueNumbers,
      minimumGap: MINIMUM_NUMBER_GAP
    })
  }

  private emitNavigation(): void {
    this.emit('navigation', {
      index: this.index,
      prize: this.currentPrize,
      total: this.catalog.size
    })
  }

  private cancelSpin(): void {
    if (this.spinTimer) {
      clearTimeout(this.spinTimer)
      this.spinTimer = null
    }
    this.spinning = false
  }
}

export type { DrawResult }
export type { Prize }
