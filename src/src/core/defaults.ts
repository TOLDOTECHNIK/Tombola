import { createId } from './id'
import type { Prize, TombolaSettings } from './types'

const DEFAULT_PRIZE_NAMES = [
  'Jagdwaffe',
  'Traumreise',
  'Universalreiniger',
  'Sofortbildkamera'
]

const DEFAULT_NUMBERS = [
  144, 518, 211, 838, 787, 765, 801, 651, 596, 412, 510, 882, 754, 376, 289, 849, 834, 948, 658,
  279
]

export const DEFAULT_SETTINGS: TombolaSettings = {
  locale: 'de',
  themeId: 'pinkbubbles',
  title: 'Tombola',
  prizeLabel: 'Preis',
  prizes: DEFAULT_PRIZE_NAMES.map((name) => ({ id: createId('prize'), name })),
  reversePrizeOrder: true,
  fixedPrizes: [
    { id: createId('fixed'), position: 1, number: 144 }
  ],
  numbers: [...DEFAULT_NUMBERS],
  disabledNumbers: [211],
  uniqueNumbers: true,
  backgroundMusic: true,
  customMusicPath: null,
  customMusicName: null,
  random: { quantity: 20 }
}

export function createDefaultSettings(): TombolaSettings {
  return structuredClone(DEFAULT_SETTINGS) as TombolaSettings
}

export function createPrize(name = ''): Prize {
  return { id: createId('prize'), name }
}
