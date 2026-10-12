export type Locale = 'de' | 'en' | 'fr' | 'rm'

export type EventName = 'spun' | 'spinEnd' | 'navigation' | 'reset' | 'settings'

export interface EventMap {
  spun: { number: number; position: number }
  spinEnd: Record<string, never>
  navigation: { index: number; prize: NumberedPrize | null; total: number }
  reset: Record<string, never>
  settings: { settings: TombolaSettings }
}

export interface Prize {
  id: string
  name: string
}

export interface NumberedPrize {
  /** 1-based running number shown to the audience. */
  position: number
  id: string
  name: string
}

export interface FixedPrize {
  id: string
  /** 1-based prize number shown to the audience (4 = "4. Preis"). */
  position: number
  /** The number that must be drawn for that prize. */
  number: number
}

export interface RandomNumberOptions {
  quantity: number
  from?: number
  to?: number
  exclude?: number[]
}

export interface TombolaSettings {
  locale: Locale
  themeId: string
  title: string
  prizeLabel: string
  prizes: Prize[]
  /** Present the prizes in reverse order (last prize drawn first). */
  reversePrizeOrder: boolean
  fixedPrizes: FixedPrize[]
  numbers: number[]
  /** Ticket numbers excluded from the final game (not chosen by players). */
  disabledNumbers: number[]
  /** Never draw a number twice. */
  uniqueNumbers: boolean
  backgroundMusic: boolean
  /** Absolute path to a user-provided background music file (copied to app data). */
  customMusicPath: string | null
  /** Original file name of the custom music, shown in the UI. */
  customMusicName: string | null
  random: { quantity: number }
}
