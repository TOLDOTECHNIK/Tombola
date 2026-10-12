import { RANDOM_NUMBER_EXCLUDE, RANDOM_NUMBER_FROM, RANDOM_NUMBER_TO } from './constants'
import type { RandomNumberOptions } from './types'

/**
 * Produces the printable list of lottery numbers used to hand out to guests.
 * Numbers are unique within the generated set and any excluded value is skipped.
 */
export class RandomNumberService {
  constructor(private readonly options: RandomNumberOptions) {}

  generate(): number[] {
    const {
      quantity,
      from = RANDOM_NUMBER_FROM,
      to = RANDOM_NUMBER_TO,
      exclude = RANDOM_NUMBER_EXCLUDE
    } = this.options
    const span = to - from + 1
    if (span <= 0 || quantity <= 0) return []

    const excluded = new Set(exclude)
    const result: number[] = []
    const maxAttempts = Math.max(quantity * 50, 1000)
    let attempts = 0

    while (result.length < Math.min(quantity, span) && attempts < maxAttempts) {
      attempts++
      const value = Math.floor(Math.random() * span) + from
      if (excluded.has(value) || result.includes(value)) continue
      result.push(value)
    }

    return result.sort((a, b) => a - b)
  }

  /** The copy-paste snippet mirroring the original tool. */
  toNumbersSnippet(numbers: number[]): string {
    return `var numbers = [${numbers.join(',')}];`
  }
}
