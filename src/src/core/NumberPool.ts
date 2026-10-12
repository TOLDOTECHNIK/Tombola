import type { FixedPrize } from './types'

interface NumberPoolOptions {
  numbers: number[]
  fixedPrizes: FixedPrize[]
  unique: boolean
  minimumGap: number
  maxRetries?: number
}

export interface DrawResult {
  number: number
  /** True when the number came from a fixed-prize rule. */
  fixed: boolean
}

/**
 * Owns the pool of drawable numbers and the draw algorithm.
 *
 * Rules (ported from the original script, cleaned up):
 *  - a fixed prize wins whenever the drawn prize matches its position
 *    (the 1-based prize number shown to the audience, e.g. 4 = "4. Preis");
 *  - numbers reserved for a still-pending fixed prize are never drawn randomly;
 *  - a freshly drawn number should differ from the previous one by at least
 *    `minimumGap` so the odometer visibly spins.
 */
export class NumberPool {
  private remaining: number[] = []
  private readonly fixedByPosition = new Map<number, number>()
  private readonly reservedNumbers = new Set<number>()
  private readonly unique: boolean
  private readonly minimumGap: number
  private readonly maxRetries: number
  private readonly source: number[]
  private lastNumber = 0

  constructor(options: NumberPoolOptions) {
    this.source = [...options.numbers]
    this.unique = options.unique
    this.minimumGap = Math.max(0, options.minimumGap)
    this.maxRetries = options.maxRetries ?? 250

    for (const fixed of options.fixedPrizes) {
      this.fixedByPosition.set(fixed.position, fixed.number)
      this.reservedNumbers.add(fixed.number)
    }
    this.reset()
  }

  /** Rebuild the pool from scratch (keeps fixed-prize reservations). */
  reset(): void {
    this.remaining = this.unique ? [...this.source] : []
    this.lastNumber = 0
  }

  get remainingCount(): number {
    return this.unique ? this.remaining.length : Number.POSITIVE_INFINITY
  }

  get isEmpty(): boolean {
    return this.unique && this.remaining.length === 0
  }

  get last(): number {
    return this.lastNumber
  }

  /**
   * Draw the number for the given prize (1-based prize number shown to the
   * audience, e.g. 4 = "4. Preis"). Returns null when the unique pool is
   * exhausted.
   */
  draw(prizePosition: number): DrawResult | null {
    const fixed = this.fixedByPosition.get(prizePosition)
    if (fixed !== undefined && this.isAvailable(fixed)) {
      this.take(fixed)
      this.lastNumber = fixed
      return { number: fixed, fixed: true }
    }

    if (this.isEmpty) return null

    let candidate = this.pickRandom()
    let retries = 0
    while (
      candidate !== null &&
      ((this.isReserved(candidate) ||
        (this.unique && !this.remaining.includes(candidate)) ||
        Math.abs(this.lastNumber - candidate) < this.minimumGap) &&
        retries < this.maxRetries)
    ) {
      candidate = this.pickRandom()
      retries++
    }

    if (candidate === null) return null

    this.take(candidate)
    this.lastNumber = candidate
    return { number: candidate, fixed: false }
  }

  private isAvailable(value: number): boolean {
    return !this.unique || this.remaining.includes(value)
  }

  private isReserved(value: number): boolean {
    return this.reservedNumbers.has(value)
  }

  /** Returns a random number from the pool (or the full source for endless mode). */
  private pickRandom(): number | null {
    const pool = this.unique ? this.remaining : this.source
    if (pool.length === 0) return null
    const index = Math.floor(Math.random() * pool.length)
    return pool[index] ?? null
  }

  private take(value: number): void {
    if (!this.unique) return
    const index = this.remaining.indexOf(value)
    if (index >= 0) this.remaining.splice(index, 1)
  }
}
