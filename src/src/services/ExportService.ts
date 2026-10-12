import { PrizeCatalog } from '../core/PrizeCatalog'
import type { TombolaSettings } from '../core/types'
import type { ThemeDefinition } from '../themes'
import { buildStandaloneHtml } from '../export/template'
import type { ExportAssets, ExportLabels } from '../export/template'

/** MIME type for the supported audio/font/image asset extensions. */
function mimeFor(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    opus: 'audio/ogg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    woff2: 'font/woff2',
    woff: 'font/woff'
  }
  return map[extension] ?? 'application/octet-stream'
}

function bytesToDataUri(bytes: Uint8Array, mime: string): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return `data:${mime};base64,${btoa(binary)}`
}

/**
 * Exports the running tombola as a single, fully self-contained HTML file:
 * background image, fonts, music, rolling sound, theme and all settings are
 * embedded as data URIs.
 */
export class ExportService {
  constructor(private readonly labels: ExportLabels) {}

  async exportStandalone(
    settings: TombolaSettings,
    theme: ThemeDefinition
  ): Promise<string | null> {
    const assets = await this.gatherAssets(settings, theme)
    const prizes = new PrizeCatalog(settings.prizes, settings.reversePrizeOrder).list()
    const disabled = new Set(settings.disabledNumbers)
    const numbers = settings.numbers.filter((value) => !disabled.has(value))
    const digits = Math.max(3, ...numbers.map((value) => String(Math.abs(value)).length), 1)

    const html = buildStandaloneHtml({
      settings,
      theme,
      prizes,
      numbers,
      digits,
      labels: this.labels,
      assets
    })

    const bytes = new TextEncoder().encode(html)
    return window.tombola.saveFile('tombola.html', bytes, [
      { name: 'HTML', extensions: ['html'] }
    ])
  }

  private async gatherAssets(
    settings: TombolaSettings,
    theme: ThemeDefinition
  ): Promise<ExportAssets> {
    const musicPath = settings.customMusicPath || 'audio/music.mp3'
    const [background, music, rolling, rye, arizonia, arvo] = await Promise.all([
      this.dataUri(theme.background),
      this.dataUri(musicPath),
      this.dataUri('audio/spinning.mp3'),
      this.dataUri('fonts/Rye.woff2'),
      this.dataUri('fonts/Arizona.woff2'),
      this.dataUri('fonts/Arvo-Bold.woff2')
    ])

    return { background, music, rolling, fonts: { rye, arizonia, arvo } }
  }

  private async dataUri(path: string): Promise<string> {
    const bytes = await window.tombola.readBinary(path)
    if (!bytes || bytes.length === 0) return ''
    return bytesToDataUri(bytes, mimeFor(path))
  }
}
