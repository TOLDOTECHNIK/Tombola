import playerSource from './player.js?raw'
import odometerSource from 'odometer/odometer.min.js?raw'
import odometerCss from '../assets/css/odometer.css?raw'
import { MINIMUM_NUMBER_GAP, ODOMETER_DURATION } from '../core/constants'
import type { NumberedPrize, TombolaSettings } from '../core/types'
import type { ThemeDefinition } from '../themes'

export interface ExportAssets {
  background: string
  music: string
  rolling: string
  fonts: { rye: string; arizonia: string; arvo: string }
}

export interface ExportLabels {
  remaining: string
  spin: string
  prev: string
  next: string
  reset: string
  ready: string
  finished: string
  music: string
  fullscreen: string
}

export interface ExportPayload {
  settings: TombolaSettings
  theme: ThemeDefinition
  prizes: NumberedPrize[]
  numbers: number[]
  digits: number
  labels: ExportLabels
  assets: ExportAssets
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** JSON that is safe to embed inside an inline <script>. */
function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function fontFace(name: string, dataUri: string, weight = '400'): string {
  if (!dataUri) return ''
  return `@font-face{font-family:'${name}';font-style:normal;font-weight:${weight};src:url('${dataUri}') format('woff2');}`
}

/**
 * Build a fully self-contained `tombola.html` (assets, theme, settings and
 * music embedded as data URIs) that plays the current tombola in any browser.
 */
export function buildStandaloneHtml(payload: ExportPayload): string {
  const { settings, theme, assets } = payload
  const p = theme.palette

  const fonts =
    fontFace('Rye', assets.fonts.rye) +
    fontFace('Arizonia', assets.fonts.arizonia) +
    fontFace('Arvo', assets.fonts.arvo, '700')

  const css = `
:root{
  --tt-overlay:${p.overlay};
  --tt-odometer-from:${p.odometerFrom};
  --tt-odometer-to:${p.odometerTo};
  --tt-digit-from:${p.digitFrom};
  --tt-digit-to:${p.digitTo};
  --tt-digit-text:${p.digitText};
  --tt-digit-border:${p.digitBorder};
  --tt-title-color:${p.titleColor};
  --tt-title-font:${p.titleFont};
  --tt-prize-color:${p.prizeColor};
  --tt-prize-font:${p.prizeFont};
  --tt-prize-glow:${p.prizeGlow};
  --tt-label-color:${p.labelColor};
  --tt-background:url('${assets.background}');
  --tt-roll-duration:${Math.max(500, ODOMETER_DURATION)}ms;
}
${fonts}
*{box-sizing:border-box}
html,body{height:100%;margin:0}
body{overflow:hidden;background:#111;color:#fff;font-family:'Arvo',Georgia,serif}
.stage{position:relative;width:100%;height:100%;container-type:size;display:flex;flex-direction:column;align-items:center;justify-content:space-between;overflow:hidden;background-image:linear-gradient(var(--tt-overlay),var(--tt-overlay)),var(--tt-background);background-size:cover,cover;background-position:center,center;background-repeat:no-repeat,no-repeat;user-select:none}
.title{font-family:var(--tt-title-font,'Arizonia',cursive);color:var(--tt-title-color,#fff);font-size:clamp(1rem,6cqw,4.5rem);line-height:1.1;padding:1rem;text-align:center;max-width:92%;overflow-wrap:anywhere;text-shadow:0 15px 29px rgba(0,0,0,.35),10px 20px 5px rgba(0,0,0,.12),-10px 20px 5px rgba(0,0,0,.12)}
.center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;width:100%;min-height:0}
.prize-label{font-family:'Arvo',serif;color:var(--tt-label-color,#fff);font-size:clamp(.6rem,1.7cqw,1.6rem);letter-spacing:.06em;text-transform:uppercase;opacity:.9}
.prize-name{font-family:var(--tt-prize-font,'Rye',serif);color:var(--tt-prize-color,#fff);font-size:clamp(.95rem,5.4cqw,4rem);text-align:center;padding:.25rem 1rem;overflow-wrap:anywhere;text-shadow:0 0 10px var(--tt-prize-glow,transparent),0 0 24px var(--tt-prize-glow,transparent),0 0 40px var(--tt-prize-glow,transparent);animation:tt-pulse 2.6s ease-in-out infinite}
@keyframes tt-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
.prize-enter{animation:tt-prize-in .28s ease both}
@keyframes tt-prize-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.bar{width:100%;display:flex;gap:1rem;align-items:center;justify-content:center;flex-wrap:wrap;padding:0 1rem 1rem;transition:opacity .3s ease,transform .3s ease}
body.idle .bar{opacity:0;transform:translateY(120%);pointer-events:none}
body.idle{cursor:none}
.bar .chip{font-size:.8rem;letter-spacing:.05em;padding:.3rem .8rem;border-radius:999px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.25)}
.bar button{font-family:'Arvo',Georgia,serif;font-size:1rem;color:#fff;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.35);border-radius:10px;padding:.5rem 1rem;cursor:pointer}
.bar button:hover{background:rgba(255,255,255,.28)}
.hint{position:fixed;bottom:.35rem;left:0;right:0;text-align:center;font-size:.7rem;color:rgba(255,255,255,.55)}
${odometerCss}
`.trim()

  const data = safeJson({
    settings: {
      title: settings.title,
      prizeLabel: settings.prizeLabel,
      prizes: payload.prizes,
      numbers: payload.numbers,
      fixedPrizes: settings.fixedPrizes.map((f) => ({ position: f.position, number: f.number })),
      uniqueNumbers: settings.uniqueNumbers,
      minimumNumberGap: MINIMUM_NUMBER_GAP,
      odometerDuration: ODOMETER_DURATION,
      backgroundMusic: settings.backgroundMusic,
      digits: payload.digits,
      labels: payload.labels
    },
    assets: { music: assets.music, rolling: assets.rolling }
  })

  return `<!doctype html>
<html lang="${settings.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(settings.title || 'Tombola')}</title>
<style>${css}</style>
</head>
<body>
<div class="stage">
  <div class="title" id="title"></div>
<div class="center">
      <div class="tt-odometer" id="odometer"></div>
      <div class="prize-label" id="label"></div>
      <div class="prize-enter" id="prize-enter"><div class="prize-name" id="prize"></div></div>
    </div>
  <div class="bar" id="bar">
    <span class="chip" id="status"></span>
    <span class="chip" id="remaining"></span>
    <button data-act="prev" title="${escapeHtml(payload.labels.prev)}">&#8249;</button>
    <button data-act="spin"></button>
    <button data-act="next" title="${escapeHtml(payload.labels.next)}">&#8250;</button>
    <button data-act="reset" title="${escapeHtml(payload.labels.reset)}">&#8635;</button>
    <button data-act="music" title="${escapeHtml(payload.labels.music)}">&#9835;</button>
    <button data-act="fullscreen" title="${escapeHtml(payload.labels.fullscreen)}">&#9974;</button>
  </div>
</div>
<div class="hint">Enter/Space = ${escapeHtml(payload.labels.spin)} &middot; &#8592;/&#8594; = ${escapeHtml(payload.labels.prev)}/${escapeHtml(payload.labels.next)} &middot; Shift = lock &middot; S = ${escapeHtml(payload.labels.music)} &middot; F = ${escapeHtml(payload.labels.fullscreen)}</div>
<audio id="music" loop></audio>
<audio id="rolling"></audio>
<script>${odometerSource}</script>
<script>window.__TOMBOLLA__=${data};</script>
<script>${playerSource}</script>
</body>
</html>`
}
