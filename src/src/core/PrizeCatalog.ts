import type { NumberedPrize, Prize } from './types'

export type { NumberedPrize }

/**
 * Immutable view over the configured prize list. Empty entries are ignored and
 * the remaining prizes receive a stable 1-based running number (their position
 * in the configured list). When `reverse` is set the presentation order is
 * flipped so the last prize is drawn first, while each prize keeps its number.
 */
export class PrizeCatalog {
  private readonly entries: NumberedPrize[]

  constructor(prizes: Prize[], reverse = false) {
    let position = 0
    const list = prizes
      .filter((prize) => prize.name.trim().length > 0)
      .map((prize) => ({ position: ++position, id: prize.id, name: prize.name.trim() }))
    this.entries = reverse ? list.reverse() : list
  }

  get size(): number {
    return this.entries.length
  }

  list(): NumberedPrize[] {
    return this.entries
  }

  at(index: number): NumberedPrize | null {
    if (index < 0 || index >= this.entries.length) return null
    return this.entries[index] ?? null
  }
}
