import { createI18n } from 'vue-i18n'
import de from './messages/de'
import en from './messages/en'
import fr from './messages/fr'
import rm from './messages/rm'
import type { Locale } from '../core/types'

export const SUPPORTED_LOCALES: { value: Locale; label: string }[] = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' }
  // { value: 'rm', label: 'Rumantsch' }
]

export const LOCALE_FLAGS: Record<Locale, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  fr: '🇫🇷'
  // rm: '🇨🇭'
}

export function createI18nInstance(locale: Locale = 'de') {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: { de, en, fr }
  })
}

export type { Locale }
