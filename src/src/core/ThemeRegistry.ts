import { THEMES } from '../themes'
import type { ThemeDefinition, ThemePalette } from '../themes'

const FALLBACK: ThemeDefinition = THEMES[0] as ThemeDefinition

/**
 * Registry of available visual themes. Resolves themes by id and converts a
 * palette into CSS custom properties consumed by the stage components.
 */
export class ThemeRegistry {
  private readonly themes: ThemeDefinition[]
  private readonly byId: Map<string, ThemeDefinition>

  constructor(themes: ThemeDefinition[] = THEMES) {
    this.themes = themes
    this.byId = new Map(themes.map((theme) => [theme.id, theme]))
  }

  get all(): ThemeDefinition[] {
    return this.themes
  }

  get default(): ThemeDefinition {
    return this.themes[0] ?? FALLBACK
  }

  get(id: string): ThemeDefinition {
    return this.byId.get(id) ?? this.default
  }

  has(id: string): boolean {
    return this.byId.has(id)
  }

  /** Convert a theme palette into a CSS variables object for :style bindings. */
  toCssVariables(theme: ThemeDefinition): Record<string, string> {
    const p: ThemePalette = theme.palette
    return {
      '--tt-overlay': p.overlay,
      '--tt-odometer-from': p.odometerFrom,
      '--tt-odometer-to': p.odometerTo,
      '--tt-digit-from': p.digitFrom,
      '--tt-digit-to': p.digitTo,
      '--tt-digit-text': p.digitText,
      '--tt-digit-border': p.digitBorder,
      '--tt-title-color': p.titleColor,
      '--tt-title-font': p.titleFont,
      '--tt-prize-color': p.prizeColor,
      '--tt-prize-font': p.prizeFont,
      '--tt-prize-glow': p.prizeGlow,
      '--tt-label-color': p.labelColor,
      '--tt-accent': p.accent,
      '--tt-background': `url("${resolveAsset(theme.background)}")`
    }
  }
}

/**
 * Resolve a public-relative asset path to an absolute URL. Required because a
 * url() stored in a CSS custom property is resolved against the stylesheet that
 * consumes it (the bundled `assets/*.css`), which would break the path.
 */
function resolveAsset(path: string): string {
  if (typeof document === 'undefined') return path
  try {
    return new URL(path, document.baseURI).href
  } catch {
    return path
  }
}
